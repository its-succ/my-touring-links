/** 場所のベース */
type PlaceBase = {
	/** ID */
	id: string;
	/** 滞在時間(分) */
	stayingTime: number;
  /** 経由値 */
  waypoint?: boolean;
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


/**
 * @see https://github.com/googlemaps/extended-component-library/blob/main/src/utils/place_utils.ts#L54
 */
export function isPlace(data: google.maps.LatLng|google.maps.LatLngLiteral|google.maps.Place): data is google.maps.Place {
  // eslint-disable-next-line no-prototype-builtins
  return data.hasOwnProperty('location');
}
export function isLatLng(data: google.maps.LatLng|google.maps.LatLngLiteral): data is google.maps.LatLng {
  return typeof data.lat === 'function';
}
