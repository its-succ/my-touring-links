import type { Timestamp } from "firebase/firestore";
import type { RoutesJSON } from "./routes";

export type EntityDate = Date | Timestamp;

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
export interface RoutesEntity extends BaseEntity {
  /** 名前 */
  name: string;
  /** ルート情報 */
  routes: RoutesJSON;
  /** 作成者ID */
  userId: string;
};
