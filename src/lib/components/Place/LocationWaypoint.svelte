<script lang="ts">
  import { type Place, type Location, formatLocation } from '$lib/models/place';

  /** 場所 */
  export let place: Place;
  /** スポット */
  let location: Location;
  $: location = <Location>place;
</script>

<div class="place">
  <div class="icon">
    <span class="material-symbols-outlined" style="font-size:30px">go_to_line</span>
  </div>
  <header class="text-base leading-7 font-normal">
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
    background-color: var(--color-base-200);
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
