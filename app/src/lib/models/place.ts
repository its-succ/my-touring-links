/** Place API で取得できるスポットの ID(placeId) を含む場所  */
export type Spot = Omit<google.maps.IconMouseEvent, 'domEvent' | 'stop'>;
/** 座標による地点 */
export type Location = Omit<google.maps.MapMouseEvent, 'domEvent' | 'stop'>;
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
