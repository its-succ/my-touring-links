<script lang="ts">
  import { onMount } from "svelte";
  import pWaitFor from 'p-wait-for';
  import { v4 as uuidv4 } from "uuid";
  import { DEFAULT_STAYING_TIME, type Place } from "$lib/models/place";

  /**
   * 選択されている場所
   * デフォルトは日本橋の国道道路元標
   */
  export let selected: Place;

  /** gmp-map タグ */
  let map: google.maps.MapElement;
  /** gmp-advanced-marker タグ */
  let marker: google.maps.marker.AdvancedMarkerElement;
  /** gmpx-place-picker タグ */
  let placePicker: { value: google.maps.places.Place; };
  /** ルート描画 */
  let directionsRenderer: google.maps.DirectionsRenderer | undefined;

  /**
   * コンポーネントがマウントされたら、google Map が利用可能になるまで待って、クリックイベントのハンドラをセットする
  */
  onMount(async () => {
    await pWaitFor(() => map.innerMap !== undefined);
    map.innerMap.addListener('click', onCLickMap);
    selected =  { id: uuidv4(), stayingTime: DEFAULT_STAYING_TIME,  placeId: 'ChIJp2YSkviJGGARyhnZ3I29Gzo', latLng: new google.maps.LatLng({  lat: 35.684022, lng: 139.774474 }) };
  });

  /**
   * 入力によってスポットが確定したとき呼び出されるコールバック.
   * マーカーの位置と、地図の中心を更新する。
   * 現在の選択場所も変更する。
   */
  function placechange() {
    const place = placePicker.value;
    if (place === undefined) return;
    marker.position = map.center = place.location!;
    selected = { id: uuidv4(), stayingTime: DEFAULT_STAYING_TIME, placeId: place.id, latLng: place.location! };
    removeRoute();
  }

  /**
   * 地図がクリックされたときのコールバック
   * マーカーの位置と、地図の中心を更新する。
   * 現在の選択場所も変更する。
   * @param event イベント
   */
  function onCLickMap(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent) {
    if ((<google.maps.IconMouseEvent>event).placeId) {
      const iconMouseEvent = <google.maps.IconMouseEvent>event;
      selected = { ...iconMouseEvent,  id: uuidv4(), stayingTime: DEFAULT_STAYING_TIME };
      marker.position = map.center = iconMouseEvent.latLng!;
      removeRoute();
    }
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
    marker.position = null;
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

<style>
	section {
    display:flex;
    flex-direction: column;
    height: 100%;
  }
  gmp-map {
    flex-grow: 1;
    overflow-y: auto;
  }
</style>

<section>
  <gmpx-place-picker placeholder="Enter a place" id="place-picker" style="width: 100%" on:gmpx-placechange={placechange} bind:this={placePicker}></gmpx-place-picker>
  <gmp-map center="35.684022,139.774474" zoom="13" map-id="DEMO_MAP_ID" bind:this={map} >
    <gmp-advanced-marker position="35.684022,139.774474" bind:this={marker}></gmp-advanced-marker>
  </gmp-map>
</section>
