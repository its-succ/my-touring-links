import { Firestore } from '@google-cloud/firestore';
import { afterEach, describe, expect, it } from 'vitest';
import { touringSchema } from '$lib/models/entity';
import { placeSchema } from '$lib/models/place';
import { zocker } from 'zocker';
import { DateTime } from 'luxon';
import z from 'zod';
import { findAllByUser, findById, remove, store } from './touring';
import { userSchema } from '$lib/models/user';
import removeUndefinedObjects from 'remove-undefined-objects';
import { faker } from '@faker-js/faker/locale/ja';

const firestore = new Firestore({
  ignoreUndefinedProperties: true
});

afterEach(async () => {
  const snapshot = await firestore.collection('tourings').get();
  const batch = firestore.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
});

describe('store', () => {
  it('新規保存できること', async () => {
    const places = z.array(placeSchema);
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: zocker(places)
          .array({ min: 3, max: 5 })
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generate()
      }))
      .generate();
    delete touring.id;
    delete touring.createdAt;
    delete touring.updatedAt;
    const user = zocker(userSchema).generate();

    const { id, ...data } = await store(user, touring);
    expect(id).not.toBeUndefined();
    expect(data.sharedTouringId).not.toBeUndefined();

    const actual = await firestore.collection('tourings').doc(id!).get();
    expect(actual.createTime?.toDate()).toBeInstanceOf(Date);
    expect(actual.data()).toEqual({ ...removeUndefinedObjects(data), userId: user.id });
  });

  it('更新できること', async () => {
    const places = z.array(placeSchema);
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: zocker(places)
          .array({ min: 3, max: 5 })
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generate()
      }))
      .generate();
    delete touring.id;
    delete touring.createdAt;
    delete touring.updatedAt;
    const user = zocker(userSchema).generate();

    const created = await store(user, touring);
    expect(created.id).not.toBeUndefined();

    const { id, ...updated } = await store(user, { ...touring, name: '更新したツーリング名' });
    expect(id).toEqual(created.id);

    const actual = await firestore.collection('tourings').doc(id!).get();
    expect(actual.createTime?.toDate()).toBeInstanceOf(Date);
    expect(actual.updateTime?.toDate()).toBeInstanceOf(Date);
    expect(actual.createTime!.toMillis()).toBeLessThan(actual.updateTime!.toMillis());
    expect(actual.data()!.name).toEqual('更新したツーリング名');
    expect(actual.data()).toEqual({ ...removeUndefinedObjects(updated), userId: user.id });
  });
});

describe('findById', () => {
  it('ユーザーとツーリングのIDが一致する登録が取得できること', async () => {
    const places = z.array(placeSchema);
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: zocker(places)
          .array({ min: 3, max: 5 })
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generate()
      }))
      .generate();
    delete touring.id;
    delete touring.createdAt;
    delete touring.updatedAt;
    const user = zocker(userSchema).generate();
    const doc = firestore.collection('tourings').doc();
    await doc.set({ ...touring, userId: user.id });

    const results = await findById(user, doc.id);

    expect(results).not.toBeUndefined();
    expect(results?.id).toEqual(doc.id);
    expect(results?.createdAt).toBeInstanceOf(Date);
    expect(results?.updatedAt).toBeInstanceOf(Date);
    expect(results?.name).toEqual(touring.name);
    expect(results?.touring).toEqual(removeUndefinedObjects(touring.touring));
  });

  describe('条件に一致しない場合は undefined が戻ること', () => {
    it('ユーザーIDが一致しないとき', async () => {
      const places = z.array(placeSchema);
      const touring = zocker(touringSchema)
        .supply(touringSchema.shape.touring, () => ({
          [DateTime.now().toJSDate().getTime()]: zocker(places)
            .array({ min: 3, max: 5 })
            .supply(placeSchema.options[0].shape.icon, 'place')
            .generate()
        }))
        .generate();
      delete touring.id;
      delete touring.createdAt;
      delete touring.updatedAt;
      const user = zocker(userSchema).generate();
      const doc = firestore.collection('tourings').doc();
      await doc.set({ ...touring, userId: faker.string.uuid() });

      const results = await findById(user, doc.id);

      expect(results).toBeUndefined();
    });
    it('ツーリングIDが存在しないとき', async () => {
      const places = z.array(placeSchema);
      const touring = zocker(touringSchema)
        .supply(touringSchema.shape.touring, () => ({
          [DateTime.now().toJSDate().getTime()]: zocker(places)
            .array({ min: 3, max: 5 })
            .supply(placeSchema.options[0].shape.icon, 'place')
            .generate()
        }))
        .generate();
      delete touring.id;
      delete touring.createdAt;
      delete touring.updatedAt;
      const user = zocker(userSchema).generate();
      const doc = firestore.collection('tourings').doc();
      await doc.set({ ...touring, userId: user.id });

      const results = await findById(user, faker.string.uuid());

      expect(results).toBeUndefined();
    });
  });
});

describe('findAllByUser', () => {
  it('ユーザーが一致する一覧が取得できること', async () => {
    const places = z.array(placeSchema);
    const tourings = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: zocker(places)
          .array({ min: 3, max: 5 })
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generate()
      }))
      .generateMany(4);
    const users = zocker(userSchema).generateMany(2);
    const batch = firestore.batch();
    users.forEach((user, index) => {
      for (const touring of tourings.slice(index * 2)) {
        delete touring.id;
        delete touring.createdAt;
        delete touring.updatedAt;
        const doc = firestore.collection('tourings').doc();
        batch.set(doc, { ...touring, userId: user.id });
      }
    });
    batch.commit();

    const results = await findAllByUser(users[1]);

    expect(results).toHaveLength(2);
    expect(results[0].name).toEqual(tourings[2].name);
    expect(results[0].touring).toEqual(removeUndefinedObjects(tourings[2].touring));
    expect(results[1].name).toEqual(tourings[3].name);
    expect(results[1].touring).toEqual(removeUndefinedObjects(tourings[3].touring));
  });
});

describe('removve', () => {
  it('登録ユーザーのツーリングが削除できること', async () => {
    const places = z.array(placeSchema);
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: zocker(places)
          .array({ min: 3, max: 5 })
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generate()
      }))
      .generate();
    delete touring.id;
    delete touring.createdAt;
    delete touring.updatedAt;
    const user = zocker(userSchema).generate();

    const created = await store(user, touring);
    expect(created.id).not.toBeUndefined();

    await remove(user, created.id!);

    const actual = await firestore.collection('tourings').doc(created.id!).get();
    expect(actual.exists).toBeFalsy();
  });

  it('異なるユーザーのツーリングは削除できないこと', async () => {
    const places = z.array(placeSchema);
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: zocker(places)
          .array({ min: 3, max: 5 })
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generate()
      }))
      .generate();
    delete touring.id;
    delete touring.createdAt;
    delete touring.updatedAt;
    const users = zocker(userSchema).generateMany(2);

    const created = await store(users[0], touring);
    expect(created.id).not.toBeUndefined();

    await expect(() => remove(users[1], created.id!)).rejects.toThrowError();
  });
  it('存在しないツーリングは削除できないこと', async () => {
    const places = z.array(placeSchema);
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: zocker(places)
          .array({ min: 3, max: 5 })
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generate()
      }))
      .generate();
    delete touring.id;
    delete touring.createdAt;
    delete touring.updatedAt;
    const user = zocker(userSchema).generate();

    const created = await store(user, touring);
    expect(created.id).not.toBeUndefined();

    await expect(() => remove(user, faker.string.uuid())).rejects.toThrowError();
  });
});
