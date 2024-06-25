<script lang="ts">
  import { Set } from '@smui/chips';
  import type { Place } from '$lib/models/place';
  import Chip from './Chip.svelte';

  /** Place */
  export let place: Place;
</script>

<div>
  <Set chips={['ルート計算前']} nonInteractive style="padding:0">
    <Chip
      name="滞在時間"
      icon="local_parking"
      text="{place.stayingTime}分"
      style="margin:2px 4px;padding:0 8px;height:26px"
    />
  </Set>
</div>
