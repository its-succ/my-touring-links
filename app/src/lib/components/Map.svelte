<script lang="ts">
  import { PUBLIC_GMAP_API_KEY } from '$env/static/public';
  import { onMount } from "svelte";
  import { DateTime } from 'luxon';
  import pWaitFor from 'p-wait-for';
  import Place from './Place.svelte';
  import Tabs from './Tabs.svelte';

  let map: google.maps.MapElement;
  let marker: google.maps.marker.AdvancedMarkerElement;
  let placePicker: { value: google.maps.places.Place; };
  let place: google.maps.places.Place | undefined;
  let placeId = 'ChIJp2YSkviJGGARyhnZ3I29Gzo';
  let tabs = [new Date('2023-11-02T08:00+09:00')];
  let active = tabs[0];

  onMount(async () => {
    await pWaitFor(() => map.innerMap !== undefined);
    map.innerMap.addListener('click', onCLickMap);
  });

  function placechange() {
    place = placePicker.value;
    marker.position = map.center = place.location!;
    placeId = place.id;
  }

  function onCLickMap(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
    if ((<google.maps.IconMouseEvent>event).placeId) {
      const iconMouseEvent = <google.maps.IconMouseEvent>event;
      placeId = iconMouseEvent.placeId!;
      marker.position = map.center = iconMouseEvent.latLng!;
    }
  }

  function changeDepartureDateTime() {
    console.log('change datetime');
  }

  function addTab() {
    tabs = [...tabs, DateTime.fromJSDate(tabs[tabs.length - 1]).plus({ days: 1 }).toJSDate()];
  }

  function closeTab() {
    const activeIndex = tabs.indexOf(active);
    tabs = tabs.filter((p) => p !== active);
    setTimeout(() => active = tabs[activeIndex] ?? tabs[activeIndex - 1]);
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
    <gmp-map center="35.684022,139.774474" zoom="13" map-id="DEMO_MAP_ID" bind:this={map} >
      <gmp-advanced-marker position="35.684022,139.774474" bind:this={marker}></gmp-advanced-marker>
    </gmp-map>
  </div>
  <div slot="fixed">
    <Tabs planDates={tabs} bind:active={active} on:add={addTab} on:close={closeTab} on:changeDepartureDateTime={changeDepartureDateTime}></Tabs>
    <div class="places">
      <Place placeId="{placeId}"></Place>
    </div>
  </div>
</gmpx-split-layout>
