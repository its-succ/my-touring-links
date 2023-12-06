<script lang="ts">
  import { type Place, type Location, formatLocation } from '$lib/models/place';
  import { Icon } from '@smui/fab';

  /** 場所 */
  export let place: Place;
  /** スポット */
  let location: Location;
  $: location = <Location>place;
</script>

<div class="place">
  <div class="icon">
    <Icon class="material-icons" style="font-size:30px">assistant_navigation</Icon>
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
    padding: 5px 5px 5px 40px;
    border-radius: 4px;
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
