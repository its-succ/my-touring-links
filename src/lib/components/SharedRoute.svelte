<script lang="ts">
  import SharedPlaceElement from './SharedPlace.svelte';
  import type { SharedPlace } from '$lib/models/shared';
  import type { Spot } from '$lib/models/place';

  /**  場所一覧 */
  export let places: SharedPlace[];

  /**
   * 現在地からのルート案内をする
   *
   * @param e 目的場所 `to` へのデータを含むイベント
   * @param index 目的地のindex
   */
  function directions(e: CustomEvent<{ to: SharedPlace }>, index: number): void {
    const placeLatLng = (place: SharedPlace) => `${place.latLng.lat},${place.latLng.lng}`;
    const url = new URL('https://www.google.com/maps/dir/?api=1');
    const appendPlace = (place: SharedPlace, dir: 'origin' | 'destination') => {
      const spot = place as Spot;
      if (spot.placeId) {
        url.searchParams.append(dir, spot.displayName!);
        url.searchParams.append(`${dir}_place_id`, spot.placeId);
      } else {
        url.searchParams.append(dir, placeLatLng(place));
      }
    };
    appendPlace(e.detail.to, 'destination');
    url.searchParams.append('travelmode', 'driving');
    url.searchParams.append('dir_action', 'navigate');
    const waypoints: SharedPlace[] = [];
    for (let i = index - 1; i >= 0; i--) {
      if (!places[i].waypoint) {
        appendPlace(places[i], 'origin');
        break;
      }
      waypoints.push(places[i]);
    }
    if (waypoints.length > 0) {
      url.searchParams.append(
        'waypoints',
        waypoints
          .reverse()
          .map((place) => placeLatLng(place))
          .join('|')
      );
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }
</script>

<ul class="routes">
  {#each places as place, index (place.id)}
    <li data-index={index} data-id={place.id}>
      <SharedPlaceElement
        {place}
        origin={index === 0}
        destination={index === places.length - 1}
        on:directions={(e) => directions(e, index)}
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
