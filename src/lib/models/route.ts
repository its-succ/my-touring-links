import { DateTime } from 'luxon';
import type { Place } from './place';
import { travelMode, latLngToString } from '$lib/utils/googlemaps-util';
import z from 'zod';
import SuperJSON from 'superjson';
import { compress, decompress } from '$lib/utils/compress';

/**
 * 到着時間スキーマ
 */
export const arrivalTimeSchema = z.record(z.number());

/**
 * 到着時間
 */
export type ArrivalTimes = z.infer<typeof arrivalTimeSchema>;

/**
 * ルート
 */
export class Route {
  private places: Place[] = [];
  private calculated: { [placeId: string]: google.maps.DirectionsResult } = {};
  private arrivalTimes: ArrivalTimes = {};
  private calcedAt?: Date;

  /**
   * ルートの最後に場所を追加する
   * @param place - 場所
   */
  add(place: Place) {
    this.places.push(place);
  }

  /**
   * ルートを取得する
   * @returns ルート
   */
  get() {
    return this.places;
  }

  /**
   * ルートを設定する
   * ソートしたあとでの書き換えなどで利用する
   * @returns ルート
   */
  set(places: Place[]) {
    this.places = places;
  }

  /**
   * 場所の到着時刻を取得する
   * @param place - 場所
   * @returns 到着時刻
   */
  getArrivalTime(place: Place): Date | undefined {
    return new Date(this.arrivalTimes[place.id]);
  }

  /**
   * @returns 到着時刻一覧を取得する
   */
  getArrivalTimes(): ArrivalTimes | undefined {
    return this.arrivalTimes;
  }

  /**
   * 場所の計算結果を取得する
   * @param place - 場所
   * @returns 計算結果
   */
  getDirectionsResult(place: Place): google.maps.DirectionsResult | undefined {
    return this.calculated[place.id];
  }

  /**
   * ルートを計算した日時を取得する
   * @returns 計算日時。計算してない場合は undefined が戻る
   */
  getCalcedDate(): Date | undefined {
    return this.calcedAt;
  }

  /**
   * ルートを計算する
   * @param departureTime - 出発日時
   * @return 計算結果
   */
  async calc(departureTime: Date) {
    let waypoints: google.maps.DirectionsWaypoint[] = [];
    let origin: google.maps.LatLngLiteral | undefined = undefined;
    this.calculated = {};
    this.arrivalTimes = {};
    for (let i = 1; i < this.places.length; i++) {
      if (this.places[i].waypoint === true && i < this.places.length - 1) {
        waypoints.push({ location: this.places[i].latLng! });
        if (origin === undefined) {
          origin = this.places[i - 1].latLng!;
        }
        continue;
      }
      if (origin === undefined) {
        origin = this.places[i - 1].latLng!;
      }
      const request: google.maps.DirectionsRequest = {
        origin,
        destination: this.places[i].latLng!,
        waypoints,
        travelMode: travelMode().DRIVING,
        drivingOptions: { departureTime }
      };
      const service = new google.maps.DirectionsService();
      const result = await (async () => {
        const cached = cache.get(request);
        if (cached) return cached;
        const result = await service.route(request);
        cache.set(request, result);
        return result;
      })();
      this.calculated[this.places[i].id] = result;
      const arrivalTime = DateTime.fromJSDate(departureTime).plus({
        second: result.routes[0].legs
          .map((l) => l.duration!.value)
          .reduce((sum, val) => sum + val, 0)
      });
      this.arrivalTimes[this.places[i].id] = arrivalTime.toMillis();
      departureTime = arrivalTime.plus({ minutes: this.places[i].stayingTime }).toJSDate();
      waypoints = [];
      origin = undefined;
    }
    this.calcedAt = new Date();
    return this.calculated;
  }

  /**
   * ルート計算結果をクリアする
   */
  resetCalculated() {
    this.calculated = {};
    this.arrivalTimes = {};
  }

  /**
   * 保存用にシリアライズする
   */
  async serialize() {
    const json = SuperJSON.stringify({
      places: this.places,
      calculated: this.calculated,
      arrivalTimes: this.arrivalTimes,
      calcedAt: this.calcedAt
    });
    return compress(json);
  }

  /**
   * 保存データからデシリアライズする
   */
  async deserialize(seriarized: string) {
    const decompressed = await decompress(seriarized);
    const deseriarized = SuperJSON.parse<{
      places: Place[];
      calculated: { [placeId: string]: google.maps.DirectionsResult };
      arrivalTimes: ArrivalTimes;
      calcedAt?: Date;
    }>(decompressed);
    this.places = deseriarized.places;
    this.calculated = deseriarized.calculated;
    this.arrivalTimes = deseriarized.arrivalTimes;
    this.calcedAt = deseriarized.calcedAt;
  }
}

/**
 * DirectionsResult のキャッシュクラス
 */
export class DirectionsResultCache extends Map<string, google.maps.DirectionsResult> {
  set(request: string | google.maps.DirectionsRequest, result: google.maps.DirectionsResult): this {
    const key =
      request instanceof String
        ? <string>request
        : this.generateKey(<google.maps.DirectionsRequest>request);
    return super.set(key, result);
  }

  get(request: string | google.maps.DirectionsRequest): google.maps.DirectionsResult | undefined {
    const key =
      request instanceof String
        ? <string>request
        : this.generateKey(<google.maps.DirectionsRequest>request);
    return super.get(key);
  }

  has(request: string | google.maps.DirectionsRequest): boolean {
    const key =
      request instanceof String
        ? <string>request
        : this.generateKey(<google.maps.DirectionsRequest>request);
    return super.has(key);
  }

  private generateKey(request: google.maps.DirectionsRequest): string {
    return `${latLngToString(request.origin)}-${request.waypoints
      ?.map((w) => latLngToString(w.location!))
      .join('+')}-${latLngToString(
      request.destination
    )}-${request.drivingOptions?.departureTime.getTime()}}`;
  }
}

/** ルート検索結果のキャッシュ  */
const cache = new DirectionsResultCache();
