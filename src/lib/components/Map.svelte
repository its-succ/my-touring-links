<script lang="ts">
  import { onMount } from 'svelte';
  import pWaitFor from 'p-wait-for';
  import { v4 as uuidv4 } from 'uuid';
  import { DEFAULT_STAYING_TIME, fetchDisplayName, type Place } from '$lib/models/place';
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
      displayName: '日本国道路元標・道路元標地点碑',
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
      displayName: place.displayName || undefined,
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
  async function onCLickMap(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
    let displayName;
    if ((<google.maps.IconMouseEvent>event).placeId !== undefined) {
      displayName = await fetchDisplayName((<google.maps.IconMouseEvent>event).placeId!);
    }
    selected = {
      ...event,
      id: uuidv4(),
      stayingTime: DEFAULT_STAYING_TIME,
      displayName: displayName || undefined,
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
  <gmp-map zoom={13} rendering-type="raster" bind:this={map}> </gmp-map>
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
    --gmpx-color-surface: var(--color-base-100);
    --gmpx-color-on-surface: var(--color-base-content);
    --gmpx-color-on-primary: var(--color-primary-content);
    --gmpx-color-on-surface-variant: var(--color-neutral-content);
  }
  /**
   * @see https://developers.google.com/maps/documentation/javascript/places-autocomplete?hl=ja#style-autocomplete
   */
  :global(.pac-container) {
    background-color: var(--color-base-200);
  }
  :global(.pac-item) {
    border: 0;
    color: color-mix(in srgb, var(--color-base-content) 62%, var(--color-base-200));
  }
  :global(.pac-item-selected, .pac-item:hover) {
    background-color: var(--color-primary);
    color: color-mix(in srgb, var(--color-primary-content) 62%, var(--color-primary));
  }
  :global(.pac-item-query) {
    color: var(--color-base-content);
  }
  :global(.pac-item-selected > .pac-item-query, .pac-item:hover > .pac-item-query) {
    color: var(--color-primary-content);
  }
</style>
