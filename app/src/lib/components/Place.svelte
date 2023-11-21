<script lang="ts">
  import type { ComponentType, SvelteComponent } from 'svelte';
  import IconButton from '@smui/icon-button';
  import type { Place } from '$lib/models/place';
  import DirectionsResult from './Place/DirectionsResult.svelte';
  import Menu from './Place/Menu.svelte';
  import Spot from './Place/Spot.svelte';
  import SpotWaypoint from './Place/SpotWaypoint.svelte';

  /** Place */
  export let place: Place;
  /** ソートハンドルアイコンが押されているかどうか */
  export let pressed: boolean;
  /** ルート計算結果 */
  export let directionsResult: google.maps.DirectionsResult | undefined;
  /** 出発地かどうか */
  export let origin: boolean = false;
  /** 最終目的地かどうか */
  export let destination: boolean = false;

  type Constraint = SvelteComponent<{ place: Place }>;
  let component: ComponentType<Constraint>;
  $: component = place.waypoint && !origin && !destination ? SpotWaypoint : Spot;
</script>

<svelte:component this={component} {place}>
  <div slot="detail">
    {#if directionsResult !== undefined}
      <DirectionsResult {place} {directionsResult} {destination}></DirectionsResult>
    {/if}
  </div>
  <div slot="meta">
    <Menu
      {place}
      {directionsResult}
      {origin}
      {destination}
      on:previewRouteTo
      on:deleteFromRoute
      on:changeStayingTime
      on:changeWaypoint
    ></Menu>
    <div on:pointerdown={() => (pressed = true)} on:pointerleave={() => (pressed = false)}>
      <IconButton class="material-icons" size="button" ripple={false}>drag_handle</IconButton>
    </div>
  </div>
</svelte:component>

<style>
  [slot='meta'] {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
</style>
