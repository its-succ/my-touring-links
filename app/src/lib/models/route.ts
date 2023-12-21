import { DateTime } from 'luxon';
import type { Place } from './place';
import { TravelMode, latLngToString } from '$lib/utils/googlemaps-util';

/**
 * ルート
 */
export class Route {
  private places: Place[] = [];
  private calculated?: google.maps.DirectionsResult[];

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
   * ルートを計算する
   * @param departureTime - 出発日時
   * @return 計算結果
   */
  async calc(departureTime: Date) {
    let waypoints: google.maps.DirectionsWaypoint[] = [];
    let origin: google.maps.LatLngLiteral | undefined = undefined;
    this.calculated = [];
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
        travelMode: TravelMode.DRIVING,
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
      this.calculated.push(result);
      departureTime = DateTime.fromJSDate(departureTime)
        .plus({
          second: result.routes[0].legs
            .map((l) => l.duration!.value)
            .reduce((sum, val) => sum + val, 0)
        })
        .plus({ minutes: this.places[i].stayingTime })
        .toJSDate();
      waypoints = [];
      origin = undefined;
    }
    return this.calculated;
  }

  /**
   * ルート計算結果をクリアする
   */
  resetCalculated() {
    this.calculated = undefined;
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
