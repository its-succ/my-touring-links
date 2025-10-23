<script lang="ts">
  import { createEventDispatcher, type ComponentType, type SvelteComponent } from 'svelte';
  import type { SharedPlace } from '$lib/models/shared';
  import DirectionsResult from './Place/DirectionsResult.svelte';
  import Location from './Place/Location.svelte';
  import LocationWaypoint from './Place/LocationWaypoint.svelte';
  import type { Place } from '$lib/models/place';

  /** SharedPlace */
  export let place: SharedPlace;
  /** 出発地かどうか */
  export let origin: boolean = false;
  /** 最終目的地かどうか */
  export let destination: boolean = false;

  type Constraint = SvelteComponent<{ place: Place }>;
  let component: ComponentType<Constraint>;
  $: component = detectPlaceComponent(place, origin, destination);
  /** イベントディスパッチャー */
  const dispatch = createEventDispatcher();

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
    {#if !origin && place.arrivalTime}
      <DirectionsResult {place} arrivalTime={new Date(place.arrivalTime)} {destination} parkingDisplayed={false}
      ></DirectionsResult>
    {/if}
  </div>
  <div slot="meta">
    {#if !place.waypoint}
      <button class="btn btn-circle" on:click={() => dispatch('directions', { to: place })}>
        <span class="material-symbols-outlined" style="font-size:30px">directions</span>
      </button>
    {/if}
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
