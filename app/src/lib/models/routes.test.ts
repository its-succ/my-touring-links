import { describe, expect, it, vi } from "vitest";
import { v4 as uuidv4 } from 'uuid';
import { Routes } from "./routes";
import { Settings } from "luxon";
import { Route } from "./route";
import { DEFAULT_STAYING_TIME, type Spot } from "./place";

vi.mock('$lib/utils/googlemaps-util', () => ({
  TravelMode: { DRIVING: 'DRIVING' },
}));

const spot: Spot = {
  id: uuidv4(),
  stayingTime: DEFAULT_STAYING_TIME,
  placeId: 'ChIJp2YSkviJGGARyhnZ3I29Gzo',
  latLng: { lat: 35.6842334, lng: 139.7718872 },
};

describe("Routes", () => {
  describe('constructor', () => {
    it('現在日時で空のルートが生成されること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      // action
      const routes = new Routes();
      // assert
      const days = routes.getDepartureDateTimes()
      expect(days).toEqual([now]);
      expect(routes.findRoutesByDepartureDateTime(now)).toBeInstanceOf(Route);
    });
  });

  describe('getDepartureDateTimes', () => {
    it('日付の古い順に出発日時が取得できること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const routes = new Routes();
      const added = new Date('2023-12-23T10:00+09:00');
      routes.addDepartureDateTimeToRoutes(added);
      // action
      const days = routes.getDepartureDateTimes()
      // assert
      expect(days).toEqual([added, now]);
    });
  });

  describe('findRoutesByDepartureDateTime', () => {
    it('存在する日付のルートが取得できること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const routes = new Routes();
      const added = new Date('2023-12-23T10:00+09:00');
      routes.addDepartureDateTimeToRoutes(added);
      // action & assert
      expect(routes.findRoutesByDepartureDateTime(added)).toBeInstanceOf(Route);
    });
    it('存在しない日付の場合はundefinedになること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const routes = new Routes();
      // action & assert
      expect(routes.findRoutesByDepartureDateTime(new Date('2023-12-20T12:00+09:00'))).toBeUndefined();
    });
  });
});

describe('removeDepartureDateTimeFromRoutes', () => {
  it('存在する日付のルートを削除できること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    const added = new Date('2023-12-23T10:00+09:00');
    routes.addDepartureDateTimeToRoutes(added);
    // action
    expect(routes.removeDepartureDateTimeFromRoutes(added)).toBeTruthy();
    // assert
    expect(routes.getDepartureDateTimes()).toEqual([now]);
  });
  it('存在しない日付の場合はfalseになること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    // action & assert
    expect(routes.removeDepartureDateTimeFromRoutes(new Date('2023-12-20T12:00+09:00'))).toBeFalsy();
  });
});

describe('addPlaceByDepartureDateTimeToRoutes', () => {
  it('存在する日付のルートに場所が追加できること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    // action & assert
    expect(routes.addPlaceByDepartureDateTimeToRoutes(now, spot)).toBeInstanceOf(Route);
    expect(routes.findRoutesByDepartureDateTime(now)?.get()).toEqual([spot]);
  });
  it('存在しない日付の場合はundefinedになること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    // action & assert
    expect(routes.addPlaceByDepartureDateTimeToRoutes(new Date('2023-12-20T12:00+09:00'), spot)).toBeUndefined();
  });
});

describe('changeDepartureDateTimeToRoutes', () => {
  it('存在する日付が変更できること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    routes.addPlaceByDepartureDateTimeToRoutes(now, spot);
    const to = new Date('2023-12-24T10:00+09:00');
    // action & assert
    expect(routes.changeDepartureDateTimeToRoutes(now, to)).toBeTruthy();
    expect(routes.findRoutesByDepartureDateTime(to)?.get()).toEqual([spot]);
  });
  it('存在しない日付の場合はfalseになること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    const to = new Date('2023-12-24T10:00+09:00');
    // action & assert
    expect(routes.changeDepartureDateTimeToRoutes(new Date('2023-12-20T12:00+09:00'), to)).toBeFalsy();
  });
  it('変更後の日付が存在する場合はfalseになること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const routes = new Routes();
    const added = new Date('2023-12-23T10:00+09:00');
    routes.addDepartureDateTimeToRoutes(added);
  // action & assert
    expect(routes.changeDepartureDateTimeToRoutes(now, added)).toBeFalsy();
  });

  describe('toJSON', () => {
    it('JSON形式で出力できること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const routes = new Routes();
      const added = new Date('2023-12-23T10:00+09:00');
      routes.addDepartureDateTimeToRoutes(added);
      routes.addPlaceByDepartureDateTimeToRoutes(added, spot);
      // action & assert
      expect(routes.toJSON()).toEqual({
        [now.toISOString()]: [],
        [added.toISOString()]: [spot]
      });
    });
  });

  describe('fromJSON', () => {
    it('JSON形式から復元できること', () => {
      // arrange
      const routes = new Routes();
      const now = new Date('2023-12-24T12:00+09:00');
      const added = new Date('2023-12-23T10:00+09:00');
      // action
      routes.fromJSON({
        [added.toISOString()]: [spot],
        [now.toISOString()]: [],
      });
      // assert
      const days = routes.getDepartureDateTimes();
      expect(days).toEqual([added, now]);
      expect(routes.findRoutesByDepartureDateTime(added)?.get()).toEqual([spot])
      expect(routes.findRoutesByDepartureDateTime(now)?.get()).toEqual([]);
    });
  });
});
