import type { Place } from './place';
import { Route } from './route';

/**
 * 出発日時別ルート
 */
export type Routes = Map<Date, Route>;

/**
 * 出発日時別ルートの初期状態を取得する
 * @returns 現在日時がキーになった空のルートを持つ出発日時別ルート
 */
export const initialRoutes = (): Routes => new Map([[new Date(), new Route()]]);

/**
 * 出発日時別ルートから出発日時一覧を取得する
 * @param routes - 出発日時別ルート
 * @returns 古い順にソートされた出発日時一覧
 */
export const getDepartureDateTimes = (routes: Routes): Date[] =>
	Array.from(routes.keys()).sort((a: Date, b: Date) => a.getTime() - b.getTime());

/**
 * 出発日時のルートを取得する
 * @param routes - 出発日時別ルート
 * @param departureDateTime - 出発日時
 * @returns ルート
 */
export const findRoutesByDepartureDateTime = (
	routes: Routes,
	departureDateTime: Date
): Route | undefined => routes.get(departureDateTime);

/**
 * 出発日時のルートに出発日時を追加する
 * @param routes - 出発日時別ルート
 * @param departureDateTime - 出発日時
 * @returns 追加された出発日時のルート。すでに出発日時が存在している場合は、存在しているルート
 */
export const addDepartureDateTimeToRoutes = (routes: Routes, departureDateTime: Date): Route => {
	if (routes.has(departureDateTime))
		return findRoutesByDepartureDateTime(routes, departureDateTime)!;
	const route = new Route();
	routes.set(departureDateTime, route);
	return route;
};

/**
 * 出発日時のルートから出発日時を削除する
 * @param routes - 出発日時別ルート
 * @param departureDateTime - 出発日時
 * @returns 削除できた場合は true
 */
export const removeDepartureDateTimeFromRoutes = (routes: Routes, departureDateTime: Date) =>
	routes.delete(departureDateTime);

/**
 * 出発日時のルートに場所を追加する
 * @param routes - 出発日時別ルート
 * @param departureDateTime - 出発日時
 * @param place - 追加する場所
 * @returns 追加されたルート
 */
export const addPlaceByDepartureDateTimeToRoutes = (
	routes: Routes,
	departureDateTime: Date,
	place: Place
): Route | undefined => {
	const route = findRoutesByDepartureDateTime(routes, departureDateTime);
	if (route === undefined) return undefined;
	route.add(place);
  return  route;
};

/**
 * ルートの出発日時を変更する
 * @param routes - 出発日時別ルート
 * @param from - 変更前の出発日時
 * @param to - 変更後の出発日時
 * @returns 変更前の日時が存在しない、変更後の日時がすでに存在している、変更に失敗した場合は false
 */
export const changeDepartureDateTimeToRoutes = (routes: Routes, from: Date, to: Date): boolean => {
	const route = findRoutesByDepartureDateTime(routes, from);
	if (route === undefined) return false;
	if (routes.has(to)) return false;
	routes.set(to, route);
	return removeDepartureDateTimeFromRoutes(routes, from);
};
