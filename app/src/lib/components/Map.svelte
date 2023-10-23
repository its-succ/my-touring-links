<script lang="ts">
  import { PUBLIC_GMAP_API_KEY } from '$env/static/public';
  import { onMount } from "svelte";
  import pWaitFor from 'p-wait-for';
  import Place from './Place.svelte';

  let map: google.maps.MapElement;
  let placePicker: { value: google.maps.places.Place; };
  let center: string | google.maps.LatLng = '35.684022,139.774474';
  let place: google.maps.places.Place | undefined;
  let placeId = 'ChIJp2YSkviJGGARyhnZ3I29Gzo';

  onMount(async () => {
    await pWaitFor(() => map.innerMap !== undefined);
    map.innerMap.addListener('click', onCLickMap);
  });

  function placechange() {
    place = placePicker.value;
    center = place.location!;
    placeId = place.id;
  }

  function onCLickMap(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
    if ((<google.maps.IconMouseEvent>event).placeId) {
      const iconMouseEvent = <google.maps.IconMouseEvent>event;
      placeId = iconMouseEvent.placeId!;
      center = iconMouseEvent.latLng!;
    }
  }
</script>

<style>
  gmpx-split-layout {
    --gmpx-fixed-panel-width-row-layout: 50%;
    --gmpx-fixed-panel-height-column-layout: 30%;
  }
	[slot='main'] {
    display:flex;
    flex-direction: column;
    height: 100%;
  }
  gmp-map {
    flex-grow: 1;
    overflow-y: auto;
  }

  @media screen and (min-width: 640px) {
    [slot='fixed'] {
      padding-left: 4em;
    }
  }
</style>

<gmpx-api-loader key="{PUBLIC_GMAP_API_KEY}"></gmpx-api-loader>
<gmpx-split-layout column-reverse row-reverse row-layout-min-width="640">
  <div slot="main">
    <gmpx-place-picker placeholder="Enter a place" id="place-picker" style="width: 100%" on:gmpx-placechange={placechange} bind:this={placePicker}></gmpx-place-picker>
    <gmp-map center="{center}" zoom="13" map-id="DEMO_MAP_ID" bind:this={map} >
      <gmp-advanced-marker position="{center}"></gmp-advanced-marker>
    </gmp-map>
  </div>
  <div slot="fixed">
    <h3>More information</h3>
    <Place placeId="{placeId}"></Place>
  </div>
</gmpx-split-layout>
