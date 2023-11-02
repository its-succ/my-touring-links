<script lang="ts">
	import PlaceElement from "./Place.svelte";
	import { isSpot, type Place, type Spot } from "$lib/models/place";
	import type { Route } from "$lib/models/route";

  /**  ルート */
  export let value: Route | undefined;
  /** 場所一覧 */
  let places: Place[];
  $: places = value ? value.get() : [];
  /** 場所をソートするハンドルアイコンが押されているかどうか */
  let handlePressed: boolean;

  /** スポットの placeId を取得する */
  function getPlaceId(place: Place)  {
    return (<Spot>place).placeId!;
  }

  /**
   * ドラッグ中のリストアイテム (li タグ) のデータセットを取得する
   * @param node - ドラッグされたノード（子ノードの場合は li タグになるまで親ノードを探索する）
   * @returns li タグのデータセット
   */
  function getDraggedParent(node: any) {
    if (!node.dataset.index) {
      return getDraggedParent(node.parentNode);
    } else {
      return { ...node.dataset };
    }
  }

  /**
   * 場所のソートを開始する。
   * もしハンドラアイコンが掴まれていないときはソートを開始しない
   * @param e - DragEvent
   */
  function onDragStart(e: DragEvent) {
    if (!handlePressed) {
      e.preventDefault();
      return;
    }
    const dragged = getDraggedParent(e.target);
    e.dataTransfer?.setData("source", dragged?.index.toString());
    e.dataTransfer?.setData('text/plain', 'handle');
  }

  /**
   * drop イベントが発生したときに呼ばれ、場所一覧を更新する
   * @param e - DragEvent
   */
  function onDrop(e: DragEvent) {
    const dragged = getDraggedParent(e.target);
    const from = Number(e.dataTransfer?.getData("source"));
    const to = dragged.index;
    const newList = [...places];
    newList[from] = [newList[to], (newList[to] = newList[from])][0];
    places = newList;
  }
</script>

<style>
  :global(ul.routes, ul.routes li) {
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
        <PlaceElement placeId={getPlaceId(place)} bind:pressed={handlePressed}></PlaceElement>
      </li>
    {/if}
  {/each}
</ul>
