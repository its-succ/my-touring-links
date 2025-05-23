import type { TouringEntity } from './entity';
import type { Place } from './place';
import { Route } from './route';
import { DateTime } from 'luxon';
import { v4 as uuidv4 } from 'uuid';

export type TouringJSON = { [index: string]: Place[] };
export type EditTouringEntity = Omit<TouringEntity, 'userId'>;

/**
 * 出発日時別ルート
 */
export class Touring {
  /**
   * 現在日時（タイムスタンプ）をキーとする Route クラスのマッピング
   */
  private routes: Map<number, Route>;

  /**
   * コンストラクタ
   */
  constructor() {
    this.routes = new Map([[DateTime.now().toJSDate().getTime(), new Route()]]);
  }

  /**
   * 出発日時別ルートから出発日時一覧を取得する
   * @returns 古い順にソートされた出発日時一覧
   */
  getDepartureDateTimes() {
    return Array.from(this.routes.keys())
      .sort((a: number, b: number) => a - b)
      .map((time) => new Date(time));
  }

  /**
   * 出発日時のルートを取得する
   * @param departureDateTime - 出発日時
   * @returns ルート
   */
  findTouringByDepartureDateTime(departureDateTime: Date): Route | undefined {
    return this.routes.get(departureDateTime.getTime());
  }

  /**
   * 出発日時のルートに出発日時を追加する
   * @param departureDateTime - 出発日時
   * @returns 追加された出発日時のルート。すでに出発日時が存在している場合は、存在しているルート
   */
  addDepartureDateTimeToTouring(departureDateTime: Date): Route {
    if (this.routes.has(departureDateTime.getTime()))
      return this.findTouringByDepartureDateTime(departureDateTime)!;
    const route = new Route();
    this.routes.set(departureDateTime.getTime(), route);
    return route;
  }

  /**
   * 出発日時のルートから出発日時を削除する
   * @param departureDateTime - 出発日時
   * @returns 削除できた場合は true
   */
  removeDepartureDateTimeFromTouring(departureDateTime: Date) {
    return this.routes.delete(departureDateTime.getTime());
  }

  /**
   * 出発日時のルートに場所を追加する
   * @param departureDateTime - 出発日時
   * @param place - 追加する場所
   * @returns 追加されたルート
   */
  addPlaceByDepartureDateTimeToTouring(departureDateTime: Date, place: Place): Route | undefined {
    const route = this.findTouringByDepartureDateTime(departureDateTime);
    if (route === undefined) return undefined;
    route.add({ ...place, id: uuidv4() });
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
  changeDepartureDateTimeToTouring(from: Date, to: Date): boolean {
    const route = this.findTouringByDepartureDateTime(from);
    if (route === undefined) return false;
    if (this.routes.has(to.getTime())) return false;
    this.routes.set(to.getTime(), route);
    route.resetCalculated();
    return this.removeDepartureDateTimeFromTouring(from);
  }

  /**
   * シリアライズ可能なJSONオブジェクトに変換する
   * @returns  このオブジェクトのJSON形式
   */
  toJSON() {
    const ret: TouringJSON = {};
    Array.from(this.routes.keys()).forEach(
      (key) => (ret[new Date(key).toISOString()] = this.routes.get(key)!.get())
    );
    return ret;
  }

  /**
   * toJSON() で出力されたJSON形式からクラスオブジェクトを復元する
   * @param json - TouringのJSON形式
   */
  fromJSON(json: TouringJSON) {
    this.routes.clear();
    Object.keys(json).forEach((key) => {
      const route = new Route();
      route.set(json[key]);
      this.routes.set(new Date(key).getTime(), route);
    });
  }
}
