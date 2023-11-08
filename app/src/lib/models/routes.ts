import type { Place } from './place';
import { Route } from './route';

/**
 * 出発日時別ルート
 */
export class Routes {
	private routes: Map<Date, Route>;

	/**
	 * コンストラクタ
	 */
	constructor() {
		this.routes = new Map([[new Date(), new Route()]]);
	}

	/**
	 * 出発日時別ルートから出発日時一覧を取得する
	 * @returns 古い順にソートされた出発日時一覧
	 */
	getDepartureDateTimes() {
		return Array.from(this.routes.keys()).sort((a: Date, b: Date) => a.getTime() - b.getTime());
	}

	/**
	 * 出発日時のルートを取得する
	 * @param departureDateTime - 出発日時
	 * @returns ルート
	 */
	findRoutesByDepartureDateTime(departureDateTime: Date): Route | undefined {
		return this.routes.get(departureDateTime);
	}

	/**
	 * 出発日時のルートに出発日時を追加する
	 * @param departureDateTime - 出発日時
	 * @returns 追加された出発日時のルート。すでに出発日時が存在している場合は、存在しているルート
	 */
	addDepartureDateTimeToRoutes(departureDateTime: Date): Route {
		if (this.routes.has(departureDateTime))
			return this.findRoutesByDepartureDateTime(departureDateTime)!;
		const route = new Route();
		this.routes.set(departureDateTime, route);
		return route;
	}

	/**
	 * 出発日時のルートから出発日時を削除する
	 * @param departureDateTime - 出発日時
	 * @returns 削除できた場合は true
	 */
	removeDepartureDateTimeFromRoutes(departureDateTime: Date) {
		return this.routes.delete(departureDateTime);
	}

	/**
	 * 出発日時のルートに場所を追加する
	 * @param departureDateTime - 出発日時
	 * @param place - 追加する場所
	 * @returns 追加されたルート
	 */
	addPlaceByDepartureDateTimeToRoutes(departureDateTime: Date, place: Place): Route | undefined {
		const route = this.findRoutesByDepartureDateTime(departureDateTime);
		if (route === undefined) return undefined;
		route.add(place);
		return route;
	}

	/**
	 * ルートの出発日時を変更する
	 * 計算済みのルート結果もクリアする
	 * @param routes - 出発日時別ルート
	 * @param from - 変更前の出発日時
	 * @param to - 変更後の出発日時
	 * @returns 変更前の日時が存在しない、変更後の日時がすでに存在している、変更に失敗した場合は false
	 */
	changeDepartureDateTimeToRoutes(from: Date, to: Date): boolean {
		const route = this.findRoutesByDepartureDateTime(from);
		if (route === undefined) return false;
		if (this.routes.has(to)) return false;
		this.routes.set(to, route);
		route.resetCalculated();
		return this.removeDepartureDateTimeFromRoutes(from);
	}
}
