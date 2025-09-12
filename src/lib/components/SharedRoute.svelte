<script lang="ts">
  import SharedPlaceElement from './SharedPlace.svelte';
  import type { SharedPlace } from '$lib/models/shared';

  /**  場所一覧 */
  export let places: SharedPlace[];
</script>

<ul class="routes">
  {#each places as place, index (place.id)}
    <li data-index={index} data-id={place.id}>
      <SharedPlaceElement {place} origin={index === 0} destination={index === places.length - 1}
      ></SharedPlaceElement>
    </li>
  {/each}
</ul>

<style>
  ul.routes,
  ul.routes > li {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
</style>
