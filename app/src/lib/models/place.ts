import { fetchFields } from '$lib/utils/googlemaps-util';

/** 場所のベース */
type PlaceBase = {
  /** ID */
  id: string;
  /** 表示名 */
  displayName?: string;
  /** 緯度経度 */
  latLng: google.maps.LatLngLiteral;
  /** 滞在時間(分) */
  stayingTime: number;
  /** 経由地 */
  waypoint?: boolean;
  /** アイコン */
  icon?: string;
};

/** 滞在時間のデフォルト */
export const DEFAULT_STAYING_TIME = 10;

/** Place API で取得できるスポットの ID(placeId) を含む場所  */
export type Spot = PlaceBase & Pick<google.maps.IconMouseEvent, 'placeId'>;
/** 座標による地点 */
export type Location = PlaceBase;
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
  if (location === undefined) return '';
  return (
    location.displayName ?? `${location.latLng?.lat.toFixed(6)}, ${location.latLng?.lng.toFixed(6)}`
  );
}

/**
 * Google Map のスポット詳細URIを取得する
 * @param place - 場所
 * @returns URI文字列
 */
export const googleMapURI = (place: Place) => {
  return `https://www.google.com/maps/place/?q=place_id:${(<Spot>place).placeId}`;
};

/**
 * スポット表示名称を取得する
 * @param placeId - 場所ID
 * @returns 表示名称
 */
export const fetchDisplayName = async (placeId: string) => {
  if (displayNameCache.has(placeId)) return displayNameCache.get(placeId);
  const { place } = await fetchFields(placeId, { fields: ['displayName'] });
  displayNameCache.set(placeId, place.displayName!);
  return place.displayName;
};

/** スポット表示名称のキャッシュ  */
const displayNameCache = new Map<string, string>();
