import type { TouringJSON } from './touring';

// TODO: firebase の Timestamp 型はいったん削除。Datastoreの日付型は後続タスクで確認
export type EntityDate = Date/** | Timestamp */;

export interface BaseEntity {
  /** ID */
  id?: string;
  /** 作成日 */
  createdAt?: EntityDate;
  /** 更新日 */
  updatedAt?: EntityDate;
}

/**
 * ルートエンティティ
 */
export interface TouringEntity extends BaseEntity {
  /** 名前 */
  name: string;
  /** ルート情報 */
  touring: TouringJSON;
  /** 公開フラグ */
  publish?: boolean;
  /** 作成者ID */
  userId: string;
}
