import { DateTime } from 'luxon';
import type { Place } from './place';

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
		this.calculated = [];
		for (let i = 1; i < this.places.length; i++) {
			const request: google.maps.DirectionsRequest = {
				origin: this.places[i - 1].latLng!,
				destination: this.places[i].latLng!,
				travelMode: google.maps.TravelMode.DRIVING,
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
				.plus({ second: result.routes[0].legs.at(-1)!.duration!.value })
				.plus({ minutes: this.places[i].stayingTime })
				.toJSDate();
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
		return `${request.origin.toString()}-${request.destination.toString()}-${request.drivingOptions?.departureTime.getTime()}}`;
	}
}

/** ルート検索結果のキャッシュ  */
const cache = new DirectionsResultCache();
