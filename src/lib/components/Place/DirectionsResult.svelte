<script lang="ts">
  import { DateTime } from 'luxon';
  import { Set } from '@smui/chips';
  import type { Place } from '$lib/models/place';
  import Chip from './Chip.svelte';

  /** Place */
  export let place: Place;
  /** 到着予定時刻 */
  export let arrivalTime: Date;
  /** 最終目的地かどうか */
  export let destination: boolean = false;
</script>

<div>
  <Set chips={['ルート情報']} nonInteractive style="padding:0">
    <Chip
      name="到着時刻"
      icon="check_circle"
      text={DateTime.fromJSDate(arrivalTime).setZone('Asia/Tokyo').toFormat('HH:mm')}
      style="margin:2px 4px;padding:0 8px;height:26px"
    />
    {#if !destination}
      <Chip
        name="滞在時間"
        icon="local_parking"
        text="{place.stayingTime}分"
        style="margin:2px 4px;padding:0 8px;height:26px"
      />
      <Chip
        name="出発時刻"
        icon="forward"
        text={DateTime.fromJSDate(arrivalTime)
          .setZone('Asia/Tokyo')
          .plus({ minutes: place.stayingTime })
          .toFormat('HH:mm')}
        style="margin:2px 4px;margin-right:0;padding:0 8px;height:26px"
      />
    {/if}
  </Set>
</div>
