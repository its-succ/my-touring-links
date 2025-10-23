<script lang="ts">
  import type { ComponentType, SvelteComponent } from 'svelte';
  import { type Place } from '$lib/models/place';
  import DirectionsResult from './Place/DirectionsResult.svelte';
  import Menu from './Place/Menu.svelte';
  import Location from './Place/Location.svelte';
  import LocationWaypoint from './Place/LocationWaypoint.svelte';
  import StayingTime from './Place/StayingTime.svelte';

  /** Place */
  export let place: Place;
  /** ソートハンドルアイコンが押されているかどうか */
  export let pressed: boolean;
  /** ルート計算されているかどうか */
  export let hasDirectionsResult: boolean;
  /** 到着予定時刻 */
  export let arrivalTime: Date | undefined;
  /** 出発地かどうか */
  export let origin: boolean = false;
  /** 最終目的地かどうか */
  export let destination: boolean = false;

  type Constraint = SvelteComponent<{ place: Place }>;
  let component: ComponentType<Constraint>;
  $: component = detectPlaceComponent(place, origin, destination);

  function detectPlaceComponent(
    place: Place,
    origin: boolean,
    destination: boolean
  ): ComponentType<Constraint> {
    return place.waypoint && !origin && !destination ? LocationWaypoint : Location;
  }
</script>

<svelte:component this={component} {place}>
  <div slot="detail">
    {#if hasDirectionsResult}
      {#if arrivalTime !== undefined}
        <DirectionsResult {place} {arrivalTime} {destination}></DirectionsResult>
      {/if}
    {:else if !origin && !destination}
      <StayingTime {place}></StayingTime>
    {/if}
  </div>
  <div slot="meta">
    <Menu
      {place}
      {hasDirectionsResult}
      {origin}
      {destination}
      on:previewRouteTo
      on:deleteFromRoute
      on:editPlace
    ></Menu>
    <div on:pointerdown={() => (pressed = true)} on:pointerleave={() => (pressed = false)}>
      <button>
        <span class="material-symbols-outlined">drag_handle</span>
      </button>
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
