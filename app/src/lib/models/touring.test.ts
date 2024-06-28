import { beforeEach, describe, expect, it, vi } from 'vitest';
import { v4 as uuidv4 } from 'uuid';
import { Touring } from './touring';
import { Settings } from 'luxon';
import { Route } from './route';
import { DEFAULT_STAYING_TIME, type Spot } from './place';
import { faker } from '@faker-js/faker';

vi.mock('$lib/utils/googlemaps-util', () => ({
  travelMode: () => ({ DRIVING: 'DRIVING' })
}));

vi.mock('uuid', () => ({ v4: vi.fn() }));

const spot: Spot = {
  id: faker.string.uuid(),
  stayingTime: DEFAULT_STAYING_TIME,
  placeId: 'ChIJp2YSkviJGGARyhnZ3I29Gzo',
  latLng: { lat: 35.6842334, lng: 139.7718872 }
};

beforeEach(() => {
  vi.mocked(uuidv4).mockClear();
});

describe('Touring', () => {
  describe('constructor', () => {
    it('現在日時で空のルートが生成されること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      // action
      const touring = new Touring();
      // assert
      const days = touring.getDepartureDateTimes();
      expect(days).toEqual([now]);
      expect(touring.findTouringByDepartureDateTime(now)).toBeInstanceOf(Route);
    });
  });

  describe('getDepartureDateTimes', () => {
    it('日付の古い順に出発日時が取得できること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      const added = new Date('2023-12-23T10:00+09:00');
      touring.addDepartureDateTimeToTouring(added);
      // action
      const days = touring.getDepartureDateTimes();
      // assert
      expect(days).toEqual([added, now]);
    });
  });

  describe('findTouringByDepartureDateTime', () => {
    it('存在する日付のルートが取得できること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      const added = new Date('2023-12-23T10:00+09:00');
      touring.addDepartureDateTimeToTouring(added);
      // action & assert
      expect(touring.findTouringByDepartureDateTime(added)).toBeInstanceOf(Route);
    });
    it('存在しない日付の場合はundefinedになること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const touring = new Touring();
      // action & assert
      expect(
        touring.findTouringByDepartureDateTime(new Date('2023-12-20T12:00+09:00'))
      ).toBeUndefined();
    });
  });
});

describe('removeDepartureDateTimeFromTouring', () => {
  it('存在する日付のルートを削除できること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const touring = new Touring();
    const added = new Date('2023-12-23T10:00+09:00');
    touring.addDepartureDateTimeToTouring(added);
    // action
    expect(touring.removeDepartureDateTimeFromTouring(added)).toBeTruthy();
    // assert
    expect(touring.getDepartureDateTimes()).toEqual([now]);
  });
  it('存在しない日付の場合はfalseになること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const touring = new Touring();
    // action & assert
    expect(
      touring.removeDepartureDateTimeFromTouring(new Date('2023-12-20T12:00+09:00'))
    ).toBeFalsy();
  });
});

describe('addPlaceByDepartureDateTimeToTouring', () => {
  it('存在する日付のルートに場所が追加できること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const id = faker.string.uuid();
    vi.mocked(uuidv4).mockReturnValue(id);
    const touring = new Touring();
    // action & assert
    expect(touring.addPlaceByDepartureDateTimeToTouring(now, spot)).toBeInstanceOf(Route);
    expect(touring.findTouringByDepartureDateTime(now)?.get()).toEqual([{ ...spot, id }]);
  });
  it('存在しない日付の場合はundefinedになること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const touring = new Touring();
    // action & assert
    expect(
      touring.addPlaceByDepartureDateTimeToTouring(new Date('2023-12-20T12:00+09:00'), spot)
    ).toBeUndefined();
  });
});

describe('changeDepartureDateTimeToTouring', () => {
  it('存在する日付が変更できること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const id = faker.string.uuid();
    vi.mocked(uuidv4).mockReturnValue(id);
    const touring = new Touring();
    touring.addPlaceByDepartureDateTimeToTouring(now, spot);
    const to = new Date('2023-12-24T10:00+09:00');
    // action & assert
    expect(touring.changeDepartureDateTimeToTouring(now, to)).toBeTruthy();
    expect(touring.findTouringByDepartureDateTime(to)?.get()).toEqual([{ ...spot, id }]);
  });
  it('存在しない日付の場合はfalseになること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const touring = new Touring();
    const to = new Date('2023-12-24T10:00+09:00');
    // action & assert
    expect(
      touring.changeDepartureDateTimeToTouring(new Date('2023-12-20T12:00+09:00'), to)
    ).toBeFalsy();
  });
  it('変更後の日付が存在する場合はfalseになること', () => {
    // arrange
    const now = new Date('2023-12-24T12:00+09:00');
    Settings.now = () => now.getTime();
    const touring = new Touring();
    const added = new Date('2023-12-23T10:00+09:00');
    touring.addDepartureDateTimeToTouring(added);
    // action & assert
    expect(touring.changeDepartureDateTimeToTouring(now, added)).toBeFalsy();
  });

  describe('toJSON', () => {
    it('JSON形式で出力できること', () => {
      // arrange
      const now = new Date('2023-12-24T12:00+09:00');
      Settings.now = () => now.getTime();
      const id = faker.string.uuid();
      vi.mocked(uuidv4).mockReturnValue(id);
      const touring = new Touring();
      const added = new Date('2023-12-23T10:00+09:00');
      touring.addDepartureDateTimeToTouring(added);
      touring.addPlaceByDepartureDateTimeToTouring(added, spot);
      // action & assert
      expect(touring.toJSON()).toEqual({
        [now.toISOString()]: [],
        [added.toISOString()]: [{ ...spot, id }]
      });
    });
  });

  describe('fromJSON', () => {
    it('JSON形式から復元できること', () => {
      // arrange
      const touring = new Touring();
      const now = new Date('2023-12-24T12:00+09:00');
      const added = new Date('2023-12-23T10:00+09:00');
      // action
      touring.fromJSON({
        [added.toISOString()]: [spot],
        [now.toISOString()]: []
      });
      // assert
      const days = touring.getDepartureDateTimes();
      expect(days).toEqual([added, now]);
      expect(touring.findTouringByDepartureDateTime(added)?.get()).toEqual([spot]);
      expect(touring.findTouringByDepartureDateTime(now)?.get()).toEqual([]);
    });
  });
});
