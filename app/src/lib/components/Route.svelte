<script lang="ts">
	import PlaceElement from "./Place.svelte";
	import { isSpot, type Place, type Spot } from "$lib/models/place";
	import type { Route } from "$lib/models/route";

  /**  ルート */
  export let value: Route | undefined;
  /** 場所一覧 */
  let places: Place[];
  $: places = value ? value.get() : [];

  /** スポットの placeId を取得する */
  function getPlaceId(place: Place)  {
    return (<Spot>place).placeId!;
  }
</script>

<section>
  {#each places as place}
    {#if isSpot(place)}
      <PlaceElement placeId={getPlaceId(place)}></PlaceElement>
    {/if}
  {/each}
</section>
