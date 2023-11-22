<script lang="ts">
  import PlaceElement from './Place.svelte';
  import { isLatLng, isPlace, isSpot, type Place } from '$lib/models/place';
  import type { Route } from '$lib/models/route';
  import { createEventDispatcher } from 'svelte';

  /**  ルート */
  export let value: Route | undefined;
  /** 場所一覧 */
  let places: Place[];
  $: places = value ? value.get() : [];
  /** 場所をソートするハンドルアイコンが押されているかどうか */
  let handlePressed: boolean;
  /** ルート計算結果 */
  let directionsResults: google.maps.DirectionsResult[] | undefined;

  /** イベントディスパッチャー */
  const dispatch = createEventDispatcher();

  /**
   * ルートを計算する
   * @param departureTime - 出発日時
   */
  export async function calc(departureTime: Date) {
    directionsResults = await value?.calc(departureTime);
    places = places;
  }

  /**
   * ルートをリセットする
   */
  export function reset() {
    directionsResults = undefined;
    places = places;
  }

  /**
   * リストアイテム (li タグ) のデータセットを取得する
   * @param node - イベントが検知されたノード（子ノードの場合は li タグになるまで親ノードを探索する）
   * @returns li タグのデータセット
   */
  function findListItemDataset(node: EventTarget) {
    if (!((<HTMLElement>node).dataset && (<HTMLElement>node).dataset.index)) {
      return findListItemDataset((<Node>node).parentNode!);
    } else {
      return { ...(<HTMLElement>node).dataset };
    }
  }

  /**
   * 場所のソートを開始する。
   * もしハンドラアイコンが掴まれていないときはソートを開始しない
   * @param e - DragEvent
   */
  function onDragStart(e: DragEvent) {
    if (!handlePressed) {
      e.stopPropagation();
      e.preventDefault();
      return false;
    }
    const dragged = findListItemDataset(e.target!);
    e.dataTransfer?.setData('source', dragged?.index!.toString());
    e.dataTransfer?.setData('text/plain', 'handle');
  }

  /**
   * drop イベントが発生したときに呼ばれ、場所一覧を更新する
   * @param e - DragEvent
   */
  function onDrop(e: DragEvent) {
    const dragged = findListItemDataset(e.target!);
    const source = e.dataTransfer?.getData('source');
    if (source === undefined || source === '') return false;
    const from = Number(source);
    const to = Number(dragged.index);
    const newList = [...places];
    directionsResults = undefined;
    places = newList.toSpliced(from, 1).toSpliced(to, 0, places[from]);
    value?.set(places);
  }

  /**
   * ルート計算結果をプレビューする
   * 編集画面にルート計算結果を含む previewRoute イベントを発行する
   * もしルート計算結果が見つからない場合は何もしない
   * @param e - 場所IDを含むカスタムイベント
   */
  function previewRoute(e: CustomEvent<string>) {
    const id = e.detail;
    const place = places.find((p) => id === p.id);
    if (place === undefined) return false;
    const directionsResult = getDirectionsResult(place);
    if (directionsResult === undefined) return false;
    dispatch('previewRoute', directionsResult);
  }

  /**
   * ルートから場所を削除する
   * @param e - 場所IDを含むカスタムイベント
   */
  function deleteFromRoute(e: CustomEvent<string>) {
    const id = e.detail;
    const to = places.findIndex((p) => id === p.id);
    directionsResults = undefined;
    places = places.toSpliced(to, 1);
    value?.set(places);
  }

  /**
   * 滞在時間を更新する
   * @param e - 場所IDと滞在時間を含むカスタムイベント
   */
  function changeStayingTime(e: CustomEvent<{ id: string; value: number }>) {
    const { id, value: stayingTime } = e.detail;
    const target = places.findIndex((p) => id === p.id);
    places[target].stayingTime = stayingTime;
    directionsResults = undefined;
    places = places;
    value?.set(places);
  }

  /**
   * 経由地の設定を更新する
   * @param e - 場所IDと経由地フラグを含むカスタムイベント
   */
  function changeWaypoint(e: CustomEvent<{ id: string; value: boolean }>) {
    const { id, value: waypoint } = e.detail;
    const target = places.findIndex((p) => id === p.id);
    places[target].waypoint = waypoint;
    directionsResults = undefined;
    places = places;
    value?.set(places);
  }

  /**
   * 到着場所が一致するルート計算結果を取得する
   * @param place - 場所
   * @returns 指定した到着場所のルート計算結果がない場合は undefined
   */
  function getDirectionsResult(place: Place) {
    const getLatLng = (
      destination: Parameters<typeof isPlace>[0] | string
    ): google.maps.LatLng | null => {
      if (typeof destination === 'string') return null;
      if (isPlace(destination)) destination = (<google.maps.Place>destination).location!;
      if (isLatLng(destination)) return <google.maps.LatLng>destination;
      return null;
    };
    return directionsResults?.find((res) =>
      place.latLng!.equals(getLatLng(res.request.destination))
    );
  }
</script>

<ul class="routes">
  {#each places as place, index (place.id)}
    <li
      data-index={index}
      data-id={place.id}
      draggable="true"
      on:dragstart={onDragStart}
      on:dragover|preventDefault={() => {}}
      on:drop|preventDefault={onDrop}
    >
      <PlaceElement
        {place}
        directionsResult={getDirectionsResult(place)}
        origin={index === 0}
        destination={index === places.length - 1}
        bind:pressed={handlePressed}
        on:previewRouteTo={previewRoute}
        on:deleteFromRoute={deleteFromRoute}
        on:changeStayingTime={changeStayingTime}
        on:changeWaypoint={changeWaypoint}
      ></PlaceElement>
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
