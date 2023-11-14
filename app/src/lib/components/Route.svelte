<script lang="ts">
	import PlaceElement from "./Place.svelte";
	import { isSpot, type Place, type Spot } from "$lib/models/place";
	import type { Route } from "$lib/models/route";
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

  /** スポットの placeId を取得する */
  function getPlaceId(place: Place)  {
    return (<Spot>place).placeId!;
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
    e.dataTransfer?.setData("source", dragged?.index!.toString());
    e.dataTransfer?.setData('text/plain', 'handle');
  }

  /**
   * drop イベントが発生したときに呼ばれ、場所一覧を更新する
   * @param e - DragEvent
   */
  function onDrop(e: DragEvent) {
    const dragged = findListItemDataset(e.target!);
    const source = e.dataTransfer?.getData("source");
    if (source === undefined  || source === '') return false;
    const from = Number(source);
    const to = Number(dragged.index);
    const newList = [...places];
    newList[from] = [newList[to], (newList[to] = newList[from])][0];
    directionsResults = undefined;
    places = newList;
    value?.set(places);
  }

  /**
   * ルート計算結果をプレビューする
   * 編集画面にルート計算結果を含む previewRoute イベントを発行する
   * もしルート計算結果が見つからない場合は何もしない
   * @param e - 場所IDを含むカスタムイベント
   */
  function previewRoute(e: CustomEvent<string>) {
    const placeId = e.detail;
    const to = places.findIndex((p) => placeId === (<Spot>p).placeId );
    if (to === undefined || to === 0) return false;
    if (directionsResults === undefined) return false;
    dispatch('previewRoute', directionsResults[to - 1]);
  }

  /**
   * ルートから場所を削除する
   * @param e - 場所IDを含むカスタムイベント
   */
   function deleteFromRoute(e: CustomEvent<string>) {
    const placeId = e.detail;
    const to = places.findIndex((p) => placeId === (<Spot>p).placeId );
    directionsResults = undefined;
    places = places.toSpliced(to, 1);
    value?.set(places);
  }

  /**
   * 指定番目のルート計算結果を取得する
   * @param index - 場所の繰り返しindex
   * @returns ルート計算結果の0番目は、場所[1]のルート計算結果なので、 index - 1 番目の計算結果が戻る
   */
  function getDirectionsResult(index: number) {
    if (index === 0) return undefined;
    return directionsResults ? directionsResults[index - 1] : undefined;
  }
</script>

<style>
  :global(ul.routes, ul.routes > li) {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
</style>

<ul class="routes">
  {#each places as place, index (place.id)}
    {#if isSpot(place)}
      <li
        data-index={index}
        data-id={place.id}
        draggable="true"
        on:dragstart={onDragStart}
        on:dragover|preventDefault={() => {}}
        on:drop|preventDefault={onDrop}
      >
        <PlaceElement placeId={getPlaceId(place)} directionsResult={getDirectionsResult(index)} isLatest={index === (places.length - 1)} bind:pressed={handlePressed} on:previewRouteTo={previewRoute} on:deleteFromRoute={deleteFromRoute}></PlaceElement>
      </li>
    {/if}
  {/each}
</ul>
