/** 場所のベース */
type PlaceBase = {
	/** ID */
	id: string;
	/** 滞在時間(分) */
	stayingTime: number;
};

/** 滞在時間のデフォルト */
export const DEFAULT_STAYING_TIME = 10;

/** Place API で取得できるスポットの ID(placeId) を含む場所  */
export type Spot = PlaceBase & Omit<google.maps.IconMouseEvent, 'domEvent' | 'stop'>;
/** 座標による地点 */
export type Location = PlaceBase & Omit<google.maps.MapMouseEvent, 'domEvent' | 'stop'>;
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
