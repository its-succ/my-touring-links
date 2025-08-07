import { Firestore } from '@google-cloud/firestore';
import { afterEach, describe, expect, it } from 'vitest';
import { sharedTouringSchema, touringSchema } from '$lib/models/entity';
import { placeSchema } from '$lib/models/place';
import { zocker } from 'zocker';
import { DateTime } from 'luxon';
import z from 'zod';
import { userSchema } from '$lib/models/user';
import removeUndefinedObjects from 'remove-undefined-objects';
import { faker } from '@faker-js/faker/locale/ja';
import { findById, remove, store } from './shared';
import type { ArrivalTimeJSON } from '$lib/models/touring';
import { sharedPlaceSchema } from '$lib/models/shared';

const firestore = new Firestore({
  ignoreUndefinedProperties: true
});

afterEach(async () => {
  const tourings = await firestore.collection('tourings').get();
  await deleteAll(tourings);
  const sharedTourings = await firestore.collection('shared-tourings').get();
  await deleteAll(sharedTourings);
});

describe('store', () => {
  it('新規保存できること', async () => {
    const departureDateTime = DateTime.now().toJSDate().getTime();
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.id, faker.string.uuid())
      .supply(touringSchema.shape.touring, () => ({
        [departureDateTime]: zocker(placeSchema)
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generateMany(3)
      }))
      .supply(touringSchema.shape.sharedTouringId, faker.string.uuid())
      .generate();
    const user = zocker(userSchema).supply(userSchema.shape.email, 'hoge@example.com').generate();
    const calcedAt = faker.date.recent().toISOString();
    const arrivalTimes: ArrivalTimeJSON = { [departureDateTime]: { arrivalTimes: {}, calcedAt } };
    touring.touring[departureDateTime].forEach((place, index) => {
      if (index > 0)
        arrivalTimes[departureDateTime].arrivalTimes[place.id] = departureDateTime + index * 600000;
    });

    await store(user, touring, arrivalTimes);

    const actual = await firestore
      .collection('shared-tourings')
      .doc(touring.sharedTouringId!)
      .get();
    expect(actual.createTime?.toDate()).toBeInstanceOf(Date);
    expect(actual.data()).toEqual({
      name: touring.name,
      sharedBy: 'hoge',
      touring: {
        [departureDateTime]: {
          places: [
            { ...touring.touring[departureDateTime][0] },
            { ...touring.touring[departureDateTime][1], arrivalTime: departureDateTime + 600000 },
            { ...touring.touring[departureDateTime][2], arrivalTime: departureDateTime + 1200000 }
          ],
          calcedAt
        }
      }
    });
  });

  it('更新できること', async () => {
    const departureDateTime = DateTime.now().toJSDate().getTime();
    const touring = zocker(touringSchema)
      .supply(touringSchema.shape.id, faker.string.uuid())
      .supply(touringSchema.shape.touring, () => ({
        [departureDateTime]: zocker(placeSchema)
          .supply(placeSchema.options[0].shape.icon, 'place')
          .generateMany(3)
      }))
      .supply(touringSchema.shape.sharedTouringId, faker.string.uuid())
      .generate();
    const user = zocker(userSchema).supply(userSchema.shape.email, 'hoge@example.com').generate();
    const calcedAt = faker.date.recent().toISOString();
    const arrivalTimes: ArrivalTimeJSON = { [departureDateTime]: { arrivalTimes: {}, calcedAt } };
    touring.touring[departureDateTime].forEach((place, index) => {
      if (index > 0)
        arrivalTimes[departureDateTime].arrivalTimes[place.id] = departureDateTime + index * 600000;
    });

    await store(user, touring, arrivalTimes);

    touring.touring[departureDateTime].forEach((place, index) => {
      if (index > 0)
        arrivalTimes[departureDateTime].arrivalTimes[place.id] = departureDateTime + index * 800000;
    });

    await store(user, touring, arrivalTimes);

    const actual = await firestore
      .collection('shared-tourings')
      .doc(touring.sharedTouringId!)
      .get();
    expect(actual.createTime?.toDate()).toBeInstanceOf(Date);
    expect(actual.data()).toEqual({
      name: touring.name,
      sharedBy: 'hoge',
      touring: {
        [departureDateTime]: {
          places: [
            { ...touring.touring[departureDateTime][0] },
            { ...touring.touring[departureDateTime][1], arrivalTime: departureDateTime + 800000 },
            { ...touring.touring[departureDateTime][2], arrivalTime: departureDateTime + 1600000 }
          ],
          calcedAt
        }
      }
    });
  });
});

describe('findById', () => {
  it('共有ツーリングのIDが一致する登録が取得できること', async () => {
    const places = z.array(sharedPlaceSchema);
    const touring = zocker(sharedTouringSchema)
      .supply(sharedTouringSchema.shape.id, faker.string.uuid())
      .supply(sharedTouringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: {
          places: zocker(places)
            .array({ min: 3, max: 5 })
            .supply(sharedPlaceSchema.options[0].shape.icon, 'place')
            .generate(),
          calcedAt: faker.date.recent().toISOString()
        }
      }))
      .generate();
    const id = touring.id;
    delete touring.id;
    delete touring.createdAt;
    delete touring.updatedAt;
    const doc = firestore.collection('shared-tourings').doc(id!);
    await doc.set(touring);

    const results = await findById(id!);

    expect(results).not.toBeUndefined();
    expect(results?.id).toEqual(id);
    expect(results?.createdAt).toBeInstanceOf(Date);
    expect(results?.updatedAt).toBeInstanceOf(Date);
    expect(results?.name).toEqual(touring.name);
    expect(results?.touring).toEqual(removeUndefinedObjects(touring.touring));
    expect(results?.sharedBy).toEqual(touring.sharedBy);
  });

  describe('条件に一致しない場合は undefined が戻ること', () => {
    it('共有ツーリングIDが存在しないとき', async () => {
      const places = z.array(sharedPlaceSchema);
      const touring = zocker(sharedTouringSchema)
        .supply(sharedTouringSchema.shape.id, faker.string.uuid())
        .supply(sharedTouringSchema.shape.touring, () => ({
          [DateTime.now().toJSDate().getTime()]: {
            places: zocker(places)
              .array({ min: 3, max: 5 })
              .supply(sharedPlaceSchema.options[0].shape.icon, 'place')
              .generate(),
            calcedAt: faker.date.recent().toISOString()
          }
        }))
        .generate();
      const id = touring.id;
      delete touring.id;
      delete touring.createdAt;
      delete touring.updatedAt;
      const doc = firestore.collection('shared-tourings').doc(id!);
      await doc.set(touring);

      const results = await findById(faker.string.uuid());

      expect(results).toBeUndefined();
    });
  });
});

describe('removve', () => {
  it('共有ツーリングが削除できること', async () => {
    const places = z.array(sharedPlaceSchema);
    const touring = zocker(sharedTouringSchema)
      .supply(sharedTouringSchema.shape.id, faker.string.uuid())
      .supply(sharedTouringSchema.shape.touring, () => ({
        [DateTime.now().toJSDate().getTime()]: {
          places: zocker(places)
            .array({ min: 3, max: 5 })
            .supply(sharedPlaceSchema.options[0].shape.icon, 'place')
            .generate(),
          calcedAt: faker.date.recent().toISOString()
        }
      }))
      .generate();
    const id = touring.id;
    delete touring.id;
    delete touring.createdAt;
    delete touring.updatedAt;
    const doc = firestore.collection('shared-tourings').doc(id!);
    await doc.set(touring);

    await remove(id!);

    const actual = await firestore.collection('shared-tourings').doc(id!).get();
    expect(actual.exists).toBeFalsy();
  });
});

async function deleteAll(
  snapshot: FirebaseFirestore.QuerySnapshot<
    FirebaseFirestore.DocumentData,
    FirebaseFirestore.DocumentData
  >
) {
  const batch = firestore.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}
