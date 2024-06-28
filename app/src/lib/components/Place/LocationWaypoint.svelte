<script lang="ts">
  import { type Place, type Location, formatLocation } from '$lib/models/place';
  import { Graphic } from '@smui/list';

  /** 場所 */
  export let place: Place;
  /** スポット */
  let location: Location;
  $: location = <Location>place;
</script>

<div class="place">
  <div class="icon">
    <Graphic class="material-symbols-outlined" style="font-size:30px">go_to_line</Graphic>
  </div>
  <header class="mdc-typography--subtitle1">
    {formatLocation(location)}
  </header>
  <p class="detail">
    <slot name="detail" />
  </p>
  <div class="meta">
    <slot name="meta" />
  </div>
</div>

<style>
  .place {
    display: grid;
    grid-template:
      'img name meta' auto
      / 30px 1fr;
    gap: 0 10px;
    padding: 0px 5px 0px 40px;
    background-color: white;
  }

  .icon {
    grid-area: img;
    align-self: center;
    height: 30px;
  }

  header {
    grid-area: name;
    align-self: center;
  }

  .detail {
    display: none;
  }

  .meta {
    grid-area: meta;
  }
</style>
