<script lang="ts">
  import type { Place, Spot } from '$lib/models/place';

  /** 場所 */
  export let place: Place;
  /** スポット */
  let spot: Spot;
  $: spot = <Spot>place;
</script>

<gmpx-place-data-provider place={spot.placeId}>
  <gmpx-place-photo-gallery max-tiles="1"></gmpx-place-photo-gallery>
  <header class="mdc-typography--subtitle1">
    <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
  </header>
  <p class="detail">
    <slot name="detail" />
  </p>
  <div class="meta">
    <slot name="meta" />
  </div>
</gmpx-place-data-provider>

<style>
  gmpx-place-data-provider {
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
