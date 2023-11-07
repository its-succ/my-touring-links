/** Place API で取得できるスポットの ID(placeId) を含む場所  */
export interface Spot extends Omit<google.maps.IconMouseEvent, 'domEvent' | 'stop'> {
	id: string;
}
/** 座標による地点 */
export interface Location extends Omit<google.maps.MapMouseEvent, 'domEvent' | 'stop'> {
	id: string;
}
/** 場所  */
export type Place = Spot | Location;

/**
 * 場所がスポットかどうか
 * @param place - 場所
 * @returns スポットのときは true が戻る
 */
export const isSpot = (place: Place) => {
	return (<Spot>place).placeId !== undefined;
};
