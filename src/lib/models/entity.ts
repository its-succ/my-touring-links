import type { Timestamp } from '@google-cloud/firestore';
import { touringJsonSchema, type TouringJSON } from './touring';
import z from 'zod';
import type { ZodShape } from './zod-shape';

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
 * ツーリングエンティティ
 */
export interface TouringEntity extends BaseEntity {
  /** 名前 */
  name: string;
  /** ルート情報 */
  touring: TouringJSON;
  /** 公開フラグ */
  publish?: boolean;
}

const touringShape: ZodShape<TouringEntity> = {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  name: z.string(),
  touring: touringJsonSchema,
  publish: z.boolean().optional()
};

/**
 * ツーリングスキーマ
 */
export const touringSchema = z.object(touringShape);
