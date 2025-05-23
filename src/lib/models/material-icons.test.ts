import { describe, expect, it } from 'vitest';
import { icons } from './material-icons.json';
import { filterIcons } from './material-icons';

describe('filterIcons', () => {
  it('名前に一致するアイコンが取得できる', () => {
    const results = filterIcons(icons, 'location_on');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('location_on');
  });
  it('タグに一致するアイコンが取得できる', () => {
    const results = filterIcons(icons, 'amusement');
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('attractions');
  });
});
