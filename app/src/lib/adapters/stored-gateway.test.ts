import { type Firestore, setLogLevel } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { createStoredGateway } from './stored-gateway';
import { DEFAULT_STAYING_TIME, type Spot } from '$lib/models/place';
import { faker } from '@faker-js/faker/locale/ja';
import { Touring } from '$lib/models/touring';
import { Settings } from 'luxon';
import { readFileSync } from 'node:fs';
import appRoot from 'app-root-path';
import {
  expectFirestorePermissionDenied,
  expectFirestorePermissionUpdateSucceeds,
  expectPermissionGetSucceeds
} from '$lib/utils/test-helper';

vi.mock('$lib/utils/googlemaps-util', () => ({
  travelMode: () => ({ DRIVING: 'DRIVING' })
}));

let testEnv: RulesTestEnvironment;
const PROJECT_ID = 'fakeproject2';

beforeAll(async () => {
  setLogLevel('error');
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      // @see https://github.com/firebase/firebase-tools/issues/4741
      host: '127.0.0.1',
      port: 8082,
      rules: readFileSync(`${appRoot}/firestore.rules`, 'utf8')
    }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

const fakeSpot = (args: Partial<Spot> = {}): Spot => {
  return {
    id: faker.string.uuid(),
    stayingTime: DEFAULT_STAYING_TIME,
    placeId: faker.string.uuid(),
    latLng: { lat: faker.location.latitude(), lng: faker.location.longitude() },
    ...args
  };
};

describe('FirestoreTouringGateway', () => {
  describe('save', () => {
    it('認証されていない場合はエラーになる', async () => {
      // arrange
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const target = createStoredGateway(unauthedDb as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      // action & assert
      await expectFirestorePermissionDenied(
        target.save({
          name: 'テストルート',
          touring: touring.toJSON(),
          userId: 'test-user'
        })
      );
    });

    it('他人では追加できない', async () => {
      // arrange
      const alice = testEnv.authenticatedContext('alice').firestore();
      const target = createStoredGateway(alice as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      // action & assert
      await expectFirestorePermissionDenied(
        target.save({
          name: 'テストルート',
          touring: touring.toJSON(),
          userId: 'bob'
        })
      );
    });

    it('認証されている場合は追加できる', async () => {
      // arrange
      const db = testEnv.authenticatedContext('alice').firestore();
      const target = createStoredGateway(db as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      // action
      const results = await expectFirestorePermissionUpdateSucceeds(
        target.save({
          name: 'テストツーリング',
          touring: touring.toJSON(),
          userId: 'alice'
        })
      );
      // assert
      expect(results.id).not.toBeUndefined();
      const actual = (await db.collection('tourings').doc(results.id).get()).data();
      actual!.id = results.id;
      actual!.createdAt = actual?.createdAt.toDate();
      actual!.updatedAt = actual?.updatedAt.toDate();
      expect(actual).toEqual(results);
    });

    it('他人のツーリングは更新できない', async () => {
      // arrange
      const alice = testEnv.authenticatedContext('alice').firestore();
      const bob = testEnv.authenticatedContext('bob').firestore();
      const target = createStoredGateway(alice as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      const entity = {
        name: 'テストツーリング',
        touring: touring.toJSON(),
        userId: 'bob',
        createdAt: now,
        updatedAt: now
      };
      const { id } = await bob.collection('tourings').add(entity);
      // action & assert
      await expectFirestorePermissionDenied(
        target.save({ ...entity, name: 'ツーリング変更', userId: 'alice', id })
      );
    });

    it('自分のツーリングは更新できる', async () => {
      // arrange
      const db = testEnv.authenticatedContext('alice').firestore();
      const target = createStoredGateway(db as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      const entity = {
        name: 'テストツーリング',
        touring: touring.toJSON(),
        userId: 'alice',
        createdAt: now,
        updatedAt: now
      };
      const { id } = await db.collection('tourings').add(entity);
      // action
      const results = await expectFirestorePermissionUpdateSucceeds(
        target.save({ ...entity, name: 'ツーリング変更', userId: 'alice', id })
      );
      // assert
      const actual = (await db.collection('tourings').doc(results.id).get()).data();
      actual!.id = results.id;
      actual!.createdAt = actual?.createdAt.toDate();
      actual!.updatedAt = actual?.updatedAt.toDate();
      expect(actual).toEqual(results);
    });
  });

  describe('findById', () => {
    it('認証していない場合は取得できない', async () => {
      // arrange
      const alice = testEnv.authenticatedContext('alice').firestore();
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const target = createStoredGateway(unauthedDb as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      const entity = {
        name: 'テストツーリング',
        touring: touring.toJSON(),
        userId: 'alice',
        createdAt: now,
        updatedAt: now
      };
      const saved = await alice.collection('tourings').add(entity);
      // action & assert
      await expectFirestorePermissionDenied(target.findById(saved.id));
    });

    it('他人のツーリングは取得できない', async () => {
      // arrange
      const alice = testEnv.authenticatedContext('alice').firestore();
      const bob = testEnv.authenticatedContext('bob').firestore();
      const target = createStoredGateway(alice as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      const entity = {
        name: 'テストツーリング',
        touring: touring.toJSON(),
        userId: 'bob',
        createdAt: now,
        updatedAt: now
      };
      const saved = await bob.collection('tourings').add(entity);
      // action & assert
      await expectFirestorePermissionDenied(target.findById(saved.id));
    });

    it('自分のツーリングが取得できる', async () => {
      // arrange
      const alice = testEnv.authenticatedContext('alice').firestore();
      const target = createStoredGateway(alice as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      const entity = {
        name: 'テストツーリング',
        touring: touring.toJSON(),
        userId: 'alice',
        createdAt: now,
        updatedAt: now
      };
      const saved = await alice.collection('tourings').add(entity);
      // action
      const results = await expectPermissionGetSucceeds(target.findById(saved.id));
      // assert
      expect({ ...entity, id: saved.id }).toEqual(results);
    });

    it('公開指定されている場合はURLを知っている誰でもツーリングが取得できる', async () => {
      // arrange
      const alice = testEnv.authenticatedContext('alice').firestore();
      const unauthedDb = testEnv.unauthenticatedContext().firestore();
      const target = createStoredGateway(unauthedDb as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'spot1' }));
      touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
      const entity = {
        name: 'テストツーリング',
        touring: touring.toJSON(),
        publish: true,
        userId: 'alice',
        createdAt: now,
        updatedAt: now
      };
      const saved = await alice.collection('tourings').add(entity);
      // action
      const results = await expectPermissionGetSucceeds(target.findById(saved.id));
      // assert
      expect({ ...entity, id: saved.id }).toEqual(results);
    });
  });

  describe('findAllByUserId', () => {
    it('自分のツーリングがすべて取得できる', async () => {
      // arrange
      const alice = testEnv.authenticatedContext('alice').firestore();
      const bob = testEnv.authenticatedContext('bob').firestore();
      const target = createStoredGateway(alice as unknown as Firestore, 'tourings');
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const all = [
        { db: alice, user: 'alice', from: '2024-01-10T10:00+09:00' },
        { db: bob, user: 'bob', from: '2024-01-10T10:00+09:00' },
        { db: alice, user: 'alice', from: '2024-01-11T10:00+09:00' },
        { db: bob, user: 'bob', from: '2024-01-11T10:00+09:00' },
        { db: alice, user: 'alice', from: '2024-01-20T10:00+09:00' }
      ];
      all.forEach(async (data, index) => {
        const touring = new Touring();
        touring.changeDepartureDateTimeToTouring(now, new Date(data.from));
        touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'start' }));
        touring.addPlaceByDepartureDateTimeToTouring(now, fakeSpot({ placeId: 'goal' }));
        const entity = {
          name: `${data.user}のツーリング${index}`,
          touring: touring.toJSON(),
          userId: data.user,
          createdAt: now,
          updatedAt: now
        };
        await data.db.collection('tourings').add(entity);
      });
      // action
      const results = await expectPermissionGetSucceeds(target.findAllByUserId('alice'));
      // assert
      expect(results).toHaveLength(3);
      expect(results.map((r) => r.name).sort()).toEqual([
        'aliceのツーリング0',
        'aliceのツーリング2',
        'aliceのツーリング4'
      ]);
    });
  });
});
