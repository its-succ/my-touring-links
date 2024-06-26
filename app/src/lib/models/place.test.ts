import {
  type Spot,
  type Location,
  isSpot,
  DEFAULT_STAYING_TIME,
  formatLocation
} from '$lib/models/place';
import { describe, expect, it } from 'vitest';
import { v4 as uuidv4 } from 'uuid';

const spot: Spot = {
  id: uuidv4(),
  stayingTime: DEFAULT_STAYING_TIME,
  placeId: 'ChIJp2YSkviJGGARyhnZ3I29Gzo',
  displayName: '日本国道路元標・道路元標地点碑',
  latLng: { lat: 35.6842334, lng: 139.7718872 }
};
const location: Location = {
  id: uuidv4(),
  stayingTime: DEFAULT_STAYING_TIME,
  latLng: { lat: 35.6842334, lng: 139.7718872 }
};

describe('isSpot', () => {
  it('スポットの場合はtrueが戻る', () => {
    expect(isSpot(spot)).toBeTruthy();
  });

  it('位置の場合はfalseが戻る', () => {
    expect(isSpot(location)).toBeFalsy();
  });
});

describe('formatLocation', () => {
  it('小数点6桁のカンマ区切りでフォーマットされること', () => {
    expect(formatLocation(location)).toEqual('35.684233, 139.771887');
  });
  it('表示名が設定されているときは、名前が戻ること', () => {
    const withName: Location = { ...location, displayName: '表示名を設定した' };
    expect(formatLocation(withName)).toEqual('表示名を設定した');
  });
});
