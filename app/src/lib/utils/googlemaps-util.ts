// このファイルは google.maps の jest-mock でカバーできない vitest でのエラーになる部分や、
// モックしたい定義、
// googlemaps のユーティリティからポーティングしたモジュールなどを定義するファイルです。

/**
 * vitest の実行でモックが必要が enum 定数を戻す
 */
export const travelMode = () => google.maps.TravelMode;

/**
 * ルートのキャッシュキーに利用する文字列を位置情報から変換する
 * @param data - 位置情報を含む値
 * @returns google.maps.LatLng クラスインスタンスの文字列表現
 */
export function latLngToString(
  data: string | google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place
): string {
  if (typeof data === 'string') return data;
  const latLng = isPlace(data) ? data.location : data;
  return new google.maps.LatLng(latLng!).toString();
}

/**
 * @see https://github.com/googlemaps/extended-component-library/blob/main/src/utils/place_utils.ts#L54
 */
export function isPlace(
  data: google.maps.LatLng | google.maps.LatLngLiteral | google.maps.Place
): data is google.maps.Place {
  // eslint-disable-next-line no-prototype-builtins
  return data.hasOwnProperty('location');
}
export function isLatLng(
  data: google.maps.LatLng | google.maps.LatLngLiteral
): data is google.maps.LatLng {
  return typeof data.lat === 'function';
}
