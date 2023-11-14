<script lang="ts">
  import IconButton from '@smui/icon-button';
	import type { Spot } from '$lib/models/place';
	import DirectionsResult from './Place/DirectionsResult.svelte';
	import Menu from './Place/Menu.svelte';

  /** Place */
  export let place: Spot;
  /** ソートハンドルアイコンが押されているかどうか */
  export let pressed: boolean;
  /** ルート計算結果 */
  export let directionsResult: google.maps.DirectionsResult | undefined;
  /** 最終目的地かどうか */
  export let isLatest: boolean = false;
</script>

<style>
  gmpx-place-data-provider {
    display: grid;
    grid-template:
      "img name meta" auto
      "img address meta" auto
      /50px 1fr
    ;
    gap: 0 10px;
    padding: 5px;
    border-radius: 4px;
    background-color: #f0f1f1;
  }

  gmpx-place-photo-gallery {
    grid-area: img;
  }

  gmpx-place-photo-gallery::part(tile) {
    max-width: 40px;
    max-height: 40px;
    margin: 5px;
    border-radius: 100%;
  }

  header {
    grid-area: name;
    align-self: end;
  }

  p.place-description {
    grid-area: address;
    align-self: start;
    margin: 0;
    padding: 0;
    min-height: 1em;
  }

  div.meta {
    grid-area: meta;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<gmpx-place-data-provider place="{place.placeId}">
  <gmpx-place-photo-gallery max-tiles="1"></gmpx-place-photo-gallery>
  <header class="mdc-typography--subtitle1">
    <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
  </header>
  <p class="place-description">
    {#if directionsResult !== undefined}
      <DirectionsResult {place} {directionsResult} {isLatest}></DirectionsResult>
    {/if}
  </p>
  <div class="meta">
    <Menu
      {place}
      {directionsResult}
      on:previewRouteTo
      on:deleteFromRoute
      on:changeStayingTime
    ></Menu>
    <div on:pointerdown={() => pressed = true} on:pointerleave={() => pressed = false}><IconButton class="material-icons" size="button" ripple={false}>drag_handle</IconButton></div>
  </div>
</gmpx-place-data-provider>
