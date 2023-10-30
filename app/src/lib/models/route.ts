import type { Place } from './place';

/**
 * ルート
 */
export class Route {
	private places: Place[] = [];

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
}
