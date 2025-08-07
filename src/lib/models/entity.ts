import type { Timestamp } from '@google-cloud/firestore';
import { touringJsonSchema, type TouringJSON } from './touring';
import z from 'zod';
import type { ZodShape } from './zod-shape';
import { sharedTouringJsonSchema, type SharedTouringJSON } from './shared';

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
  /** 共有ID */
  sharedTouringId?: string;
}

const touringShape: ZodShape<TouringEntity> = {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  name: z.string(),
  touring: touringJsonSchema,
  publish: z.boolean().optional(),
  sharedTouringId: z.string().optional()
};

export type EditTouringEntity = Omit<TouringEntity, 'userId'>;

/**
 * ツーリングスキーマ
 */
export const touringSchema = z.object(touringShape);

/**
 * 共有ツーリングエンティティ
 */
export interface SharedTouringEntity extends BaseEntity {
  /** ツーリング名 */
  name: string;
  /** ルートと計算結果情報 */
  touring: SharedTouringJSON;
  /** 共有した人のアカウント名 */
  sharedBy: string;
}

const sharedTouringShape: ZodShape<SharedTouringEntity> = {
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  name: z.string(),
  touring: sharedTouringJsonSchema,
  sharedBy: z.string()
};

/**
 * 共有ツーリングスキーマ
 */
export const sharedTouringSchema = z.object(sharedTouringShape);
