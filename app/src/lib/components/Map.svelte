<script lang="ts">
  import { onMount } from 'svelte';
  import pWaitFor from 'p-wait-for';
  import { v4 as uuidv4 } from 'uuid';
  import { DEFAULT_STAYING_TIME, type Place } from '$lib/models/place';
  import { initThemeChanger } from '$lib/utils/theme';
  import { createSimpleMarker } from '$lib/utils/googlemaps-util';

  /**
   * 選択されている場所
   * デフォルトは日本橋の国道道路元標
   */
  export let selected: Place;

  /** gmp-map タグ */
  let map: google.maps.MapElement;
  /** マーカー */
  let marker: google.maps.Marker;
  /** gmpx-place-picker タグ */
  let placePicker: { value: google.maps.places.Place };
  /** ルート描画 */
  let directionsRenderer: google.maps.DirectionsRenderer | undefined;

  /**
   * コンポーネントがマウントされたら、google Map が利用可能になるまで待って、クリックイベントのハンドラをセットする
   */
  onMount(async () => {
    await pWaitFor(() => map.innerMap !== undefined);
    map.innerMap.addListener('click', onCLickMap);
    initThemeChanger(map);
    map.center = { lat: 35.684022, lng: 139.774474 };
    marker = createSimpleMarker(map, map.center);
    selected = {
      id: uuidv4(),
      stayingTime: DEFAULT_STAYING_TIME,
      placeId: 'ChIJp2YSkviJGGARyhnZ3I29Gzo',
      latLng: { lat: 35.684022, lng: 139.774474 }
    };
  });

  /**
   * 入力によってスポットが確定したとき呼び出されるコールバック.
   * マーカーの位置と、地図の中心を更新する。
   * 現在の選択場所も変更する。
   */
  function placechange() {
    const place = placePicker.value;
    if (place === undefined) return;
    map.center = place.location!;
    marker.setPosition(place.location);
    selected = {
      id: uuidv4(),
      stayingTime: DEFAULT_STAYING_TIME,
      placeId: place.id,
      latLng: place.location!.toJSON()
    };
    removeRoute();
  }

  /**
   * 地図がクリックされたときのコールバック
   * マーカーの位置と、地図の中心を更新する。
   * 現在の選択場所も変更する。
   * @param event イベント
   */
  function onCLickMap(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
    selected = {
      ...event,
      id: uuidv4(),
      stayingTime: DEFAULT_STAYING_TIME,
      latLng: event.latLng!.toJSON()
    };
    map.center = event.latLng!;
    marker.setPosition(event.latLng);
    removeRoute();
  }

  /**
   * ルートを地図から消す
   */
  function removeRoute() {
    if (directionsRenderer && directionsRenderer.getMap() !== null) {
      directionsRenderer.setMap(null);
    }
  }

  /**
   * マーカーを削除する
   */
  function removeMarker() {
    marker.setPosition(null);
  }

  /**
   * ルートをプレビューする
   * @param param - google.maps.DirectionsResult
   * @returns ルート取得結果
   */
  export function previewRoute(param: google.maps.DirectionsResult) {
    directionsRenderer = directionsRenderer ?? new google.maps.DirectionsRenderer();
    directionsRenderer.setDirections(param);
    directionsRenderer.setMap(map.innerMap);
    removeMarker();
  }
</script>

<section>
  <gmpx-place-picker
    placeholder="Enter a place"
    id="place-picker"
    style="width: 100%"
    on:gmpx-placechange={placechange}
    bind:this={placePicker}
  ></gmpx-place-picker>
  <gmp-map zoom={13} bind:this={map} map-id="DEMO_MAP_ID">
  </gmp-map>
</section>

<style>
  section {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  gmp-map {
    flex-grow: 1;
    overflow-y: auto;
  }
  gmpx-place-picker {
    --gmpx-color-surface: var(--mdc-theme-surface);
    --gmpx-color-on-surface: var(--mdc-theme-on-surface);
    --gmpx-color-on-primary: var(--mdc-theme-on-primary);
    --gmpx-color-on-surface-variant: var(--mdc-theme-on-secondary);
  }
  /**
   * @see https://developers.google.com/maps/documentation/javascript/places-autocomplete?hl=ja#style-autocomplete
   */
  :global(.pac-container) {
    background-color: var(--mdc-theme-background);
  }
  :global(.pac-item) {
    border: 0;
    color:  color-mix(in srgb, var(--mdc-theme-on-surface) 62%, var(--mdc-theme-background));
  }
  :global(.pac-item-selected, .pac-item:hover) {
    background-color: var(--mdc-theme-primary);
    color:  color-mix(in srgb, var(--mdc-theme-on-primary) 62%, var(--mdc-theme-primary));
  }
  :global(.pac-item-query) {
    color:  var(--mdc-theme-on-surface);
  }
  :global(.pac-item-selected > .pac-item-query, .pac-item:hover > .pac-item-query) {
    color:  var(--mdc-theme-on-primary);
  }
</style>
