import {
  sharedTouringSchema,
  type SharedTouringEntity,
  type TouringEntity
} from '$lib/models/entity';
import type { SharedTouringJSON } from '$lib/models/shared';
import type { ArrivalTimeJSON } from '$lib/models/touring';
import type { User } from '@auth/sveltekit';
import { DocumentReference, Firestore } from '@google-cloud/firestore';

const db = () => {
  const firestore = new Firestore({ ignoreUndefinedProperties: true });
  return firestore.collection('shared-tourings');
};

/**
 * データベース定義
 */
interface SharedTouringDatabaseEntity
  extends Omit<SharedTouringEntity, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * データベースに保存する
 * @param user ユーザー
 * @param touringEntity ツーリング情報
 * @param arrivalTimeEntity ルート計算結果の到着時間情報
 * @returns 保存したデータ
 */
export const store = async (
  user: User,
  touringEntity: TouringEntity,
  arrivalTimes: ArrivalTimeJSON,
  calcedAt: string
): Promise<SharedTouringEntity> => {
  if (touringEntity.id === undefined) throw Error('Can not share unsaved touring');
  const entity = toDatabaseEntity(user, touringEntity, arrivalTimes, calcedAt);
  const ret: SharedTouringEntity = entity;
  if (touringEntity.sharedTouringId === undefined) {
    throw Error('sharedTouringId not set');
  } else {
    await save(touringEntity.sharedTouringId, entity);
  }
  return ret;
};

const toDatabaseEntity = (
  user: User,
  touringEntity: TouringEntity,
  arrivalTimes: ArrivalTimeJSON,
  calcedAt: string
): SharedTouringDatabaseEntity => {
  const departureDateTimes = Object.keys(touringEntity.touring);
  const touring: SharedTouringJSON = {};
  departureDateTimes.forEach((departureDateTime) => {
    const places = touringEntity.touring[departureDateTime];
    const arrivalTime = arrivalTimes[departureDateTime];
    touring[departureDateTime] = places.map((place) => {
      return {
        ...place,
        arrivalTime: arrivalTime[place.id]
      };
    });
  });
  return {
    name: touringEntity.name,
    sharedBy: user.email!.split('@')[0],
    touring,
    calcedAt
  };
};

const save = async (id: string, entity: SharedTouringDatabaseEntity) => {
  const doc = db().doc(id);
  await doc.set(entity);
  return doc.id;
};

/**
 * データベースから取得する
 * @param sharedTouringId ツーリング共有ID
 * @returns 見つかった場合は登録されているデータ、見つからなかった場合は undefined が戻る
 */
export const findById = async (
  sharedTouringId: string
): Promise<SharedTouringEntity | undefined> => {
  const results = await db().doc(sharedTouringId).get();
  if (!results.exists) return undefined;
  return toEntity(results);
};

const toEntity = (
  findResult: Awaited<ReturnType<DocumentReference['get']>>
): SharedTouringEntity => {
  const data = findResult.data();
  if (data === undefined) throw Error('data is not found');
  return {
    ...sharedTouringSchema.parse(data),
    id: findResult.id,
    createdAt: findResult.createTime?.toDate(),
    updatedAt: findResult.updateTime?.toDate()
  };
};

/**
 * データーベースから削除する
 * @param sharedTouringId ツーリング共有ID
 */
export const remove = async (sharedTouringId: string) => {
  const doc = db().doc(sharedTouringId);
  await doc.delete();
};
