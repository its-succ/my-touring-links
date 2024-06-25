<script lang="ts">
  import PlaceElement from './Place.svelte';
  import type { Place } from '$lib/models/place';
  import type { Route } from '$lib/models/route';
  import { createEventDispatcher } from 'svelte';
  import Editor from './Place/Editor.svelte';

  /**  ルート */
  export let value: Route | undefined;
  /** 場所一覧 */
  let places: Place[];
  $: places = value ? value.get() : [];
  /** 場所をソートするハンドルアイコンが押されているかどうか */
  let handlePressed: boolean;
  /** 場所編集ダイアログ */
  let placeEditor: Editor;

  /** イベントディスパッチャー */
  const dispatch = createEventDispatcher();

  /**
   * ルートを計算する
   * @param departureTime - 出発日時
   */
  export async function calc(departureTime: Date) {
    await value?.calc(departureTime);
    places = places;
  }

  /**
   * ルートをリセットする
   */
  export function reset() {
    value?.resetCalculated();
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
    value?.resetCalculated();
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
    const directionsResult = value?.getDirectionsResult(place);
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
    value?.resetCalculated();
    places = places.toSpliced(to, 1);
    value?.set(places);
  }

  /**
   * 場所の変更を開始する
   */
  function editPlace(e: CustomEvent<{ place: Place; displayNameOnly: boolean }>) {
    placeEditor.edit(e.detail.place, e.detail.displayNameOnly);
  }

  /**
   * 場所を更新する
   * @param e - 場所IDと場所の変更内容を含むカスタムイベント
   */
  function placeChanged(
    e: CustomEvent<{
      id: string;
      value: Pick<Place, 'displayName' | 'stayingTime' | 'waypoint' | 'icon'>;
    }>
  ) {
    const { id, value: changed } = e.detail;
    const target = places.findIndex((p) => id === p.id);
    places[target].displayName = changed.displayName;
    places[target].icon = changed.icon;
    if (
      places[target].stayingTime !== changed.stayingTime ||
      places[target].waypoint !== changed.waypoint
    ) {
      places[target].stayingTime = changed.stayingTime;
      places[target].waypoint = changed.waypoint;
      value?.resetCalculated();
    }
    places = places;
    value?.set(places);
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
        hasDirectionsResult={value?.getDirectionsResult(place) !== undefined}
        arrivalTime={value?.getArrivalTime(place)}
        origin={index === 0}
        destination={index === places.length - 1}
        bind:pressed={handlePressed}
        on:previewRouteTo={previewRoute}
        on:deleteFromRoute={deleteFromRoute}
        on:editPlace={editPlace}
      ></PlaceElement>
    </li>
  {/each}
</ul>
<Editor bind:this={placeEditor} on:change={placeChanged}></Editor>

<style>
  ul.routes,
  ul.routes > li {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
</style>
