<script lang="ts">
  import type { Place } from '$lib/models/place';
  import Chip from './Chip.svelte';

  /** Place */
  export let place: Place;
</script>

<div>
  <div class="flex flex-row">
    <Chip
      name="滞在時間"
      icon="local_parking"
      text="{place.stayingTime}分"
      style="margin:2px 4px;padding:0 8px;height:26px"
    />
  </div>
</div>
