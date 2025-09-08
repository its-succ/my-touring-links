import { touringSchema, type TouringEntity } from '$lib/models/entity';
import type { User } from '@auth/sveltekit';
import { CollectionReference, DocumentReference, Firestore } from '@google-cloud/firestore';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';

const db = () => {
  const firestore = new Firestore({ ignoreUndefinedProperties: true });
  return firestore.collection('tourings');
};

const RoutesSubCollection = 'routes';

/**
 * データベース定義
 */
interface TouringDatabaseEntity
  extends Omit<TouringEntity, 'id' | 'createdAt' | 'updatedAt' | 'touring'> {
  userId: string;
}

interface SerializedRouteEntity {
  serialized: string;
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
  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    touring: _touring,
    ...toDatabase
  } = entity;
  return {
    ...toDatabase,
    userId: user.id!
  };
};

const toSerializedRouteEntity = (
  entity: TouringEntity,
  departureDateTime: string
): SerializedRouteEntity => {
  return { serialized: entity.touring[departureDateTime] };
};

const create = async (user: User, entity: TouringEntity) => {
  const doc = db().doc();
  entity.sharedTouringId = uuidv4();
  await doc.set(toDatabaseEntity(user, entity));
  for (const departureDateTime of Object.keys(entity.touring)) {
    const route = doc.collection(RoutesSubCollection).doc(departureDateTime);
    await route.set(toSerializedRouteEntity(entity, departureDateTime));
  }
  return doc.id;
};

const update = async (user: User, entity: TouringEntity) => {
  const doc = db().doc(entity.id!);
  const current = await doc.get();
  const data = current && current.data();
  if (data?.userId !== user.id) throw Error('Not found update data');
  await doc.update({ ...toDatabaseEntity(user, entity) });
  const routesSubCollection = current.ref.collection(RoutesSubCollection);
  const routes = await routesSubCollection.get();
  const departureDateTimes = Object.keys(entity.touring);
  const beforeDepartureDateTimes: string[] = [];
  routes.forEach(async (route) => {
    beforeDepartureDateTimes.push(route.id);
    if (departureDateTimes.includes(route.id)) {
      // DBにすでに存在する出発日時で、シリアライズされた文字列が一致してない場合は更新する
      if (entity.touring[route.id] !== route.data().serialized) {
        await route.ref.update({ ...toSerializedRouteEntity(entity, route.id) });
      }
    } else {
      // 元々あったけど削除された出発日時
      route.ref.delete();
    }
  });
  for (const departureDateTime of departureDateTimes) {
    if (!beforeDepartureDateTimes.includes(departureDateTime)) {
      // もし更新前に出発日時がないときは、追加する
      await routesSubCollection
        .doc(departureDateTime)
        .set(toSerializedRouteEntity(entity, departureDateTime));
    }
  }
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
  const routes = await results.ref.collection(RoutesSubCollection).get();
  const { userId, entity } = toEntity(results, routes);
  if (userId !== user.id) return undefined;
  return entity;
};

const toEntity = (
  findResult: Awaited<ReturnType<DocumentReference['get']>>,
  routesResult?: Awaited<ReturnType<CollectionReference['get']>>
): { userId: string; entity: TouringEntity } => {
  const data = findResult.data();
  if (data === undefined) throw Error('data is not found');

  const { userId, ...entity } = data;
  const touring = touringSchema.extend({ touring: z.record(z.string()).optional() }).parse(entity);
  const touringEntity: { userId: string; entity: TouringEntity } = {
    userId,
    entity: {
      ...touring,
      touring: {},
      id: findResult.id,
      createdAt: findResult.createTime?.toDate(),
      updatedAt: findResult.updateTime?.toDate()
    }
  };
  if (routesResult) {
    routesResult.forEach((route) => {
      touringEntity.entity.touring[route.id] = route.data().serialized;
    });
  }
  return touringEntity;
};

/**
 * ユーザーに紐づくツーリングをすべて取得する
 * サブコレクションのルート情報までは取得されない
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
