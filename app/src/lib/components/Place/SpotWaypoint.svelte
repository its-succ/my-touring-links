<script lang="ts">
	import type { Place, Spot } from '$lib/models/place';
	import { Icon } from '@smui/button';

  /** 場所 */
  export let place: Place;
  /** スポット */
  let spot: Spot;
  $: spot = <Spot>place;
</script>

<style>
  gmpx-place-data-provider {
    display: grid;
    grid-template:
      "img name meta" auto
      /30px 1fr
    ;
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

  gmpx-place-field-text {
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

<gmpx-place-data-provider place="{spot.placeId}">
  <div class="icon"><Icon class="material-icons" style="font-size:30px">assistant_navigation</Icon></div>
  <gmpx-place-field-text field="displayName" class="mdc-typography--subtitle1"></gmpx-place-field-text>
  <p class="detail">
    <slot name="detail"></slot>
  </p>
  <div class="meta">
    <slot name="meta"></slot>
  </div>
</gmpx-place-data-provider>
