/** 場所のベース */
type PlaceBase = {
  /** ID */
  id: string;
  /** 滞在時間(分) */
  stayingTime: number;
  /** 経由地 */
  waypoint?: boolean;
};

/** 滞在時間のデフォルト */
export const DEFAULT_STAYING_TIME = 10;

/** Place API で取得できるスポットの ID(placeId) を含む場所  */
export type Spot = PlaceBase & Pick<google.maps.IconMouseEvent, 'placeId'> & { latLng: google.maps.LatLngLiteral; };
/** 座標による地点 */
export type Location = PlaceBase & { latLng: google.maps.LatLngLiteral; };
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
 * Location の緯度経度を小数点6桁のカンマ区切りでフォーマットする
 * @param location - Location オブジェクト
 * @returns  フォーマット済み文字列
 */
export function formatLocation(location?: Location) {
  return (
    (location
      ? `${location.latLng?.lat.toFixed(6)}, ${location.latLng?.lng.toFixed(6)}`
      : undefined) || ''
  );
}
