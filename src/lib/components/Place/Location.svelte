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
    <span class="material-icons" style="font-size:30px;color:white;margin:5px;"
      >{place.icon ?? 'location_on'}</span
    >
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
      'img address meta' auto
      / 50px 1fr;
    gap: 0 10px;
    padding: 5px;
    border-radius: 4px;
    background-color: #f0f1f1;
  }

  .icon {
    grid-area: img;
    max-width: 40px;
    max-height: 40px;
    margin: 5px;
    border-radius: 100%;
    background-color: black;
  }

  header {
    grid-area: name;
    align-self: end;
  }

  .detail {
    grid-area: address;
    align-self: start;
    margin: 0;
    padding: 0;
    min-height: 30px;
  }

  .meta {
    grid-area: meta;
  }
</style>
