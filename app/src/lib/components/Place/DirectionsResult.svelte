<script lang="ts">
  import { DateTime } from 'luxon';
  import Chip, { Set, LeadingIcon, Text } from '@smui/chips';
	import type { Place } from '$lib/models/place';

  /** Place */
  export let place: Place;
  /** ルート計算結果 */
  export let directionsResult: google.maps.DirectionsResult;
  /** 最終目的地かどうか */
  export let isLatest: boolean = false;

  /**
   * 出発日時を計算する
   * @returns 出発日時
   */
  function arrivalTime() {
    const duration = directionsResult.routes[0].legs.map((l) => l.duration!.value).reduce((sum, val) => sum + val, 0);
    return DateTime.fromJSDate(directionsResult.request.drivingOptions!.departureTime)
      .setZone('Asia/Tokyo')
      .plus({ seconds: duration });
  }
</script>

<Set chips={['ルート情報']} nonInteractive style="padding:0">
  <Chip chip="到着時刻" style="margin-left:0;padding:0 8px">
    <LeadingIcon class="material-icons">check_circle</LeadingIcon>
    <Text class="mdc-typography--body2">{arrivalTime().toFormat('HH:mm')}</Text>
  </Chip>
  {#if !isLatest}
  <Chip chip="滞在時間" style="margin-left:0;padding:0 8px">
    <LeadingIcon class="material-icons">local_parking</LeadingIcon>
    <Text class="mdc-typography--body2">{place.stayingTime}分</Text>
  </Chip>
  <Chip chip="出発時刻" style="margin-left:0;margin-right:0;padding:0 8px">
    <LeadingIcon class="material-icons">forward</LeadingIcon>
    <Text class="mdc-typography--body2" >{arrivalTime().plus({ minutes: place.stayingTime }).toFormat('HH:mm')}</Text>
  </Chip>
  {/if}
</Set>
