import { type Firestore, setLogLevel } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { converter, createStoredGateway } from './stored-gateway';
import { DEFAULT_STAYING_TIME, type Spot } from '$lib/models/place';
import { faker } from '@faker-js/faker/locale/ja';
import { Routes } from '$lib/models/routes';
import { Settings } from 'luxon';
import { readFileSync } from 'node:fs';
import appRoot from 'app-root-path';
import type { RoutesEntity } from '$lib/models/entity';

vi.mock('$lib/utils/googlemaps-util', () => ({
  TravelMode: { DRIVING: 'DRIVING' }
}));

let testEnv: RulesTestEnvironment;
const PROJECT_ID = 'fakeproject2';

beforeAll(async () => {
  setLogLevel('error');
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: 'localhost',
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

describe('StoredGateway<RoutesEntity>', () => {
  it('save', async () => {
    // arrange
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const target = createStoredGateway(unauthedDb as unknown as Firestore, 'routes');
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    routes.addPlaceByDepartureDateTimeToRoutes(now, fakeSpot({ placeId: 'start' }));
    routes.addPlaceByDepartureDateTimeToRoutes(now, fakeSpot({ placeId: 'spot1' }));
    routes.addPlaceByDepartureDateTimeToRoutes(now, fakeSpot({ placeId: 'goal' }));
    // action
    const results = await target.save({
      name: 'テストルート',
      routes: routes.toJSON(),
      userId: 'test-user'
    });
    // assert
    expect(results.id).not.toBeUndefined();
    const actual = (await unauthedDb.collection('routes').doc(results.id).get()).data();
    actual!.id = results.id;
    actual!.createdAt = actual?.createdAt.toDate();
    actual!.updatedAt = actual?.updatedAt.toDate();
    expect(actual).toEqual(results);
  });

  it('findById', async () => {
    // arrange
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const target = createStoredGateway(unauthedDb as unknown as Firestore, 'routes');
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    routes.addPlaceByDepartureDateTimeToRoutes(now, fakeSpot({ placeId: 'start' }));
    routes.addPlaceByDepartureDateTimeToRoutes(now, fakeSpot({ placeId: 'spot1' }));
    routes.addPlaceByDepartureDateTimeToRoutes(now, fakeSpot({ placeId: 'goal' }));
    const entity = {
      name: 'テストルート',
      routes: routes.toJSON(),
      userId: 'test-user',
      createdAt: now,
      updatedAt: now
    };
    const saved = await unauthedDb.collection('routes').add(entity);
    // action
    const results = await target.findById(saved.id);
    // assert
    expect({ ...entity, id: saved.id }).toEqual(results);
  });
});
