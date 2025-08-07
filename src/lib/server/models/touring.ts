import { touringSchema, type TouringEntity } from '$lib/models/entity';
import type { User } from '@auth/sveltekit';
import { DocumentReference, Firestore } from '@google-cloud/firestore';
import { v4 as uuidv4 } from 'uuid';

const db = () => {
  const firestore = new Firestore({ ignoreUndefinedProperties: true });
  return firestore.collection('tourings');
};

/**
 * データベース定義
 */
interface TouringDatabaseEntity extends Omit<TouringEntity, 'id' | 'createdAt' | 'updatedAt'> {
  userId: string;
}

/**
 * データベースに保存する
 * @param user ユーザー
 * @param entity ツーリング情報
 * @returns 保存したデータ
 */
export const store = async (user: User, entity: TouringEntity): Promise<TouringEntity> => {
  if (entity.id === undefined) {
    entity.id = await create(user, entity);
  } else {
    await update(user, entity);
  }
  return entity;
};

const toDatabaseEntity = (user: User, entity: TouringEntity): TouringDatabaseEntity => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...toDatabase } = entity;
  return {
    ...toDatabase,
    userId: user.id!
  };
};

const create = async (user: User, entity: TouringEntity) => {
  const doc = db().doc();
  entity.sharedTouringId = uuidv4();
  await doc.set(toDatabaseEntity(user, entity));
  return doc.id;
};

const update = async (user: User, entity: TouringEntity) => {
  const doc = db().doc(entity.id!);
  const current = await doc.get();
  const data = current && current.data();
  if (data?.userId !== user.id) throw Error('Not found update data');
  await doc.update({ ...toDatabaseEntity(user, entity) });
};

/**
 * データベースにから取得する
 * @param user 登録したユーザー
 * @param touringId ツーリングID
 * @returns ユーザーが登録したツーリングの場合が見つかった場合は登録されているデータ、見つからなかった場合は undefined が戻る
 */
export const findById = async (
  user: User,
  touringId: string
): Promise<TouringEntity | undefined> => {
  const results = await db().doc(touringId).get();
  if (!results.exists) return undefined;
  const { userId, entity } = toEntity(results);
  if (userId !== user.id) return undefined;
  return entity;
};

const toEntity = (
  findResult: Awaited<ReturnType<DocumentReference['get']>>
): { userId: string; entity: TouringEntity } => {
  const data = findResult.data();
  if (data === undefined) throw Error('data is not found');

  const { userId, ...entity } = data;
  const touring = touringSchema.parse(entity);
  return {
    userId,
    entity: {
      ...touring,
      id: findResult.id,
      createdAt: findResult.createTime?.toDate(),
      updatedAt: findResult.updateTime?.toDate()
    }
  };
};

/**
 * ユーザーに紐づくツーリングをすべて取得する
 * @param user 取得するユーザー
 * @returns ツーリング一覧
 */
export const findAllByUser = async (user: User): Promise<TouringEntity[]> => {
  const results = await db().where('userId', '==', user.id).get();
  if (results.empty) return [];
  return results.docs.map((doc) => toEntity(doc).entity);
};

/**
 * データーベースから削除する
 * @param user 削除するユーザー
 * @param touringId 削除対象のツーリングID
 */
export const remove = async (user: User, touringId: string) => {
  const doc = db().doc(touringId);
  const current = await doc.get();
  const data = current && current.data();
  if (data?.userId !== user.id) throw Error('Not found remove data');
  await doc.delete();
};
