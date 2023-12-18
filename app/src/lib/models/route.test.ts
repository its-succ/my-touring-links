import { beforeEach, describe, expect, it, vi } from "vitest";
vi.stubGlobal('jest', vi);
import { JSDOM } from "jsdom";
import { DEFAULT_STAYING_TIME, type Spot } from "./place";
const fakedom = new JSDOM();
const { window } = fakedom;
vi.stubGlobal('HTMLElement', window.HTMLElement);
vi.stubGlobal('customElements', window.customElements);
const { initialize, DirectionsService } = await import("@googlemaps/jest-mocks");
import { faker } from '@faker-js/faker/locale/ja';
import { DirectionsResultCache, Route } from "./route";
import { latLngToString } from "$lib/utils/googlemaps-util";

const fakeSpot = (args: Partial<Spot> = {}): Spot => {
  return {
    id: faker.string.uuid(),
    stayingTime: DEFAULT_STAYING_TIME,
    placeId: faker.string.uuid(),
    latLng: { lat: faker.location.latitude(), lng: faker.location.longitude() },
    ...args
  };
};

const routeMock = vi.fn<[google.maps.DirectionsRequest], Promise<google.maps.DirectionsResult>>();
class MockDirectionsService extends DirectionsService {
  constructor() {
    super();

    this.route = routeMock;
  }
}

beforeEach(() => {
  initialize();
  vi.mock('$lib/utils/googlemaps-util', () => ({
    TravelMode: { DRIVING: 'DRIVING' },
    latLngToString: (data: google.maps.LatLngLiteral ) => `${data.lat, data.lng}`,
  }))
});

beforeEach(() => {
  routeMock.mockClear();
});

describe("add", () => {
  it("ルートの最後に場所を追加できること", () => {
    const route = new Route();
    expect(route.get()).toEqual([]);
    const spot1 = fakeSpot();
    route.add(spot1);
    expect(route.get()).toEqual([spot1]);
    const spot2 = fakeSpot();
    route.add(spot2);
    expect(route.get()).toEqual([spot1, spot2]);
  });
});

describe("set", () => {
  it("ルートの上書きができること", () => {
    const route = new Route();
    route.add(fakeSpot());
    route.add(fakeSpot());
    const places = [fakeSpot(), fakeSpot(), fakeSpot()];
    route.set(places);
    expect(route.get()).toEqual(places);
  });
});

describe("calc", () => {
  it("ルートの計算ができること", async () => {
    // arrange
    const route = new Route();
    const places = [fakeSpot(), fakeSpot(), fakeSpot()];
    route.set(places);
    const legsMap = {
      // 最初から2番目への所要時間
      [latLngToString(places[0].latLng)]: [ { duration: { value: 30 * 60 } }, { duration: { value: 10 * 60 } } ],
      // 2番目から3番目への所要時間
      [latLngToString(places[1].latLng)]: [ { duration: { value: 5 * 60 } }, { duration: { value: 60 * 60 } } ],
    };
    google.maps.DirectionsService = MockDirectionsService;
    routeMock.mockImplementation((request: google.maps.DirectionsRequest) => Promise.resolve({
      available_travel_modes: ['DRIVING'],
      request,
      routes: [{
        legs: legsMap[ latLngToString(request.origin)]
      }]
    } as google.maps.DirectionsResult));
    // action
    await route.calc(new Date('2024-12-25T10:00+09:00'));
    // assert
    //  スポット1 -> スポット2 と スポット2 -> スポット3 への2つのルートが計算される
    expect(routeMock).toHaveBeenCalledTimes(2);
    //  スポット1 -> スポット2へ 2024/12/25 10:00 に出発するリクエストが送信される
    expect(routeMock).toHaveBeenNthCalledWith(1, {
      origin: places[0].latLng,
      destination: places[1].latLng,
      waypoints: [],
      travelMode: 'DRIVING',
      drivingOptions: { departureTime: new Date('2024-12-25T10:00+09:00') }
    });
    //  スポット2 -> スポット3へ 2024/12/25 10:50 に出発する（所要時間40分と滞在時間10分）
    expect(routeMock).toHaveBeenNthCalledWith(2, {
      origin: places[1].latLng,
      destination: places[2].latLng,
      waypoints: [],
      travelMode: 'DRIVING',
      drivingOptions: { departureTime: new Date('2024-12-25T10:50+09:00') }
    });
  });

  it("経由地を含めたルートの計算ができること", async () => {
    // arrange
    const route = new Route();
    // 出発地 -> 経由地1 -> 経由地2 -> 立ち寄り場所 -> 経由地3 -> 目的地
    const places = [fakeSpot(), fakeSpot({ waypoint: true }), fakeSpot({ waypoint: true }), fakeSpot(), fakeSpot({ waypoint: true }), fakeSpot()];
    route.set(places);
    const legsMap = {
      // 出発地から立ち寄り場所への所要時間（90分）
      [latLngToString(places[0].latLng)]: [ { duration: { value: 60 * 60 } }, { duration: { value: 30 * 60 } } ],
      // 立ち寄り場所から目的地への所要時間（65分）
      [latLngToString(places[3].latLng)]: [ { duration: { value: 5 * 60 } }, { duration: { value: 60 * 60 } } ],
    };
    google.maps.DirectionsService = MockDirectionsService;
    routeMock.mockImplementation((request: google.maps.DirectionsRequest) => Promise.resolve({
      available_travel_modes: ['DRIVING'],
      request,
      routes: [{
        legs: legsMap[ latLngToString(request.origin)]
      }]
    } as google.maps.DirectionsResult));
    // action
    await route.calc(new Date('2024-12-25T10:00+09:00'));
    // assert
    //  出発地から立ち寄り場所 と 立ち寄り場所から目的地 への2つのルートが計算される
    expect(routeMock).toHaveBeenCalledTimes(2);
    //  出発地から立ち寄り場所 へ 2024/12/25 10:00 に出発するリクエストが送信される
    expect(routeMock).toHaveBeenNthCalledWith(1, {
      origin: places[0].latLng,
      destination: places[3].latLng,
      waypoints: [{ location: places[1].latLng }, { location: places[2].latLng }],
      travelMode: 'DRIVING',
      drivingOptions: { departureTime: new Date('2024-12-25T10:00+09:00') }
    });
    //  立ち寄り場所から目的地へ 2024/12/25 11:40 に出発する
    expect(routeMock).toHaveBeenNthCalledWith(2, {
      origin: places[3].latLng,
      destination: places[5].latLng,
      waypoints: [{ location: places[4].latLng }],
      travelMode: 'DRIVING',
      drivingOptions: { departureTime: new Date('2024-12-25T11:40+09:00') }
    });
  });

  it("キャッシュが存在する場合はルートの計算が呼ばれないこと", async () => {
    // arrange
    const route = new Route();
    const places = [fakeSpot(), fakeSpot(), fakeSpot()];
    route.set(places);
    const legsMap = {
      // 最初から2番目への所要時間
      [latLngToString(places[0].latLng)]: [ { duration: { value: 30 * 60 } }, { duration: { value: 10 * 60 } } ],
      // 2番目から3番目への所要時間
      [latLngToString(places[1].latLng)]: [ { duration: { value: 5 * 60 } }, { duration: { value: 60 * 60 } } ],
    };
    google.maps.DirectionsService = MockDirectionsService;
    routeMock.mockImplementation((request: google.maps.DirectionsRequest) => Promise.resolve({
      available_travel_modes: ['DRIVING'],
      request,
      routes: [{
        legs: legsMap[ latLngToString(request.origin)]
      }]
    } as google.maps.DirectionsResult));
    // action
    await route.calc(new Date('2024-12-25T10:00+09:00'));
    // assert
    //  スポット1 -> スポット2 と スポット2 -> スポット3 への2つのルートが計算される
    expect(routeMock).toHaveBeenCalledTimes(2);

    // ルートに場所を追加して再計算したときは、追加前のルート計算が実行されないことを確認する

    // arrange
    route.add(fakeSpot());
    // 3番目から4番目への所要時間
    legsMap [latLngToString(places[2].latLng)] = [ { duration: { value: 30 * 60 } } ];
    // action
    await route.calc(new Date('2024-12-25T10:00+09:00'));
    // assert
    //  スポット3 -> スポット4 へのルートが計算回数が1追加されて計3回呼び出されたことになる
    expect(routeMock).toHaveBeenCalledTimes(3);
    //  スポット3 -> スポット4へ 2024/12/25 12:05 に出発する
    expect(routeMock).toHaveBeenNthCalledWith(3, {
      origin: places[2].latLng,
      destination: places[3].latLng,
      waypoints: [],
      travelMode: 'DRIVING',
      drivingOptions: { departureTime: new Date('2024-12-25T12:05+09:00') }
    });
  });
});

describe("DirectionsResultCache", () => {
  describe('経由地なしの場合', () => {
    it('出発地/目的地/出発時間が一致する場合はキャッシュから取得できる', () => {
      // arrange
      const cache = new DirectionsResultCache();
      const request: google.maps.DirectionsRequest = {
        origin: { lat: faker.location.latitude(), lng: faker.location.longitude() },
        destination: { lat: faker.location.latitude(), lng: faker.location.longitude() },
        waypoints: [],
        travelMode: 'DRIVING' as google.maps.TravelMode,
        drivingOptions: { departureTime: new Date('2024-12-25T10:00+09:00') }
      };
      const results = {
        available_travel_modes: ['DRIVING'],
        request,
        routes: [{
          legs: [ { duration: { value: 30 * 60 } }, { duration: { value: 10 * 60 } } ]
        }]
      } as google.maps.DirectionsResult;
      cache.set(request, results);
      // action & assert
      expect(cache.get({ ...request })).toEqual(results);
    });
  });
  it.each([
    { origin: { lat: faker.location.latitude(), lng: faker.location.longitude() } },
    { destination: { lat: faker.location.latitude(), lng: faker.location.longitude() } },
    { drivingOptions: { departureTime: new Date('2024-10-25T10:00+09:00') }},
  ])('出発地/目的地/出発時間のいずれかが一致しない場合はキャッシュから取得できない', (args: Partial<google.maps.DirectionsRequest>) => {
    // arrange
    const cache = new DirectionsResultCache();
    const request: google.maps.DirectionsRequest = {
      origin: { lat: faker.location.latitude(), lng: faker.location.longitude() },
      destination: { lat: faker.location.latitude(), lng: faker.location.longitude() },
      waypoints: [],
      travelMode: 'DRIVING' as google.maps.TravelMode,
      drivingOptions: { departureTime: new Date('2024-12-25T10:00+09:00') }
    };
    const results = {
      available_travel_modes: ['DRIVING'],
      request,
      routes: [{
        legs: [ { duration: { value: 30 * 60 } }, { duration: { value: 10 * 60 } } ]
      }]
    } as google.maps.DirectionsResult;
    cache.set(request, results);
    // action & assert
    expect(cache.get({ ...request, ...args })).toBeUndefined();
  });

  describe('経由地ありの場合', () => {
    it('出発地/経由地/目的地/出発時間が一致する場合はキャッシュから取得できる', () => {
      // arrange
      const cache = new DirectionsResultCache();
      const request: google.maps.DirectionsRequest = {
        origin: { lat: faker.location.latitude(), lng: faker.location.longitude() },
        destination: { lat: faker.location.latitude(), lng: faker.location.longitude() },
        waypoints: [{ location: { lat: faker.location.latitude(), lng: faker.location.longitude() } }, { location: { lat: faker.location.latitude(), lng: faker.location.longitude() } }],
        travelMode: 'DRIVING' as google.maps.TravelMode,
        drivingOptions: { departureTime: new Date('2024-12-25T10:00+09:00') }
      };
      const results = {
        available_travel_modes: ['DRIVING'],
        request,
        routes: [{
          legs: [ { duration: { value: 30 * 60 } }, { duration: { value: 10 * 60 } } ]
        }]
      } as google.maps.DirectionsResult;
      cache.set(request, results);
      // action & assert
      expect(cache.get({ ...request })).toEqual(results);
    });
  });
  it.each([
    { origin: { lat: faker.location.latitude(), lng: faker.location.longitude() } },
    { destination: { lat: faker.location.latitude(), lng: faker.location.longitude() } },
    { waypoints: [] },
    { waypoints: [{ location: { lat: faker.location.latitude(), lng: faker.location.longitude() } }, { location: { lat: faker.location.latitude(), lng: faker.location.longitude() } }] },
    { drivingOptions: { departureTime: new Date('2024-10-25T10:00+09:00') }},
  ])('出発地/経由地/目的地/出発時間のいずれかが一致しない場合はキャッシュから取得できない', (args: Partial<google.maps.DirectionsRequest>) => {
    // arrange
    const cache = new DirectionsResultCache();
    const request: google.maps.DirectionsRequest = {
      origin: { lat: faker.location.latitude(), lng: faker.location.longitude() },
      destination: { lat: faker.location.latitude(), lng: faker.location.longitude() },
      waypoints: [{ location: { lat: faker.location.latitude(), lng: faker.location.longitude() } }, { location: { lat: faker.location.latitude(), lng: faker.location.longitude() } }],
      travelMode: 'DRIVING' as google.maps.TravelMode,
      drivingOptions: { departureTime: new Date('2024-12-25T10:00+09:00') }
    };
    const results = {
      available_travel_modes: ['DRIVING'],
      request,
      routes: [{
        legs: [ { duration: { value: 30 * 60 } }, { duration: { value: 10 * 60 } } ]
      }]
    } as google.maps.DirectionsResult;
    cache.set(request, results);
    // action & assert
    expect(cache.get({ ...request, ...args })).toBeUndefined();
  });
});
