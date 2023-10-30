<script lang="ts">
  import { PUBLIC_GMAP_API_KEY } from '$env/static/public';
  import { onMount } from "svelte";
  import Map from './Map.svelte';
  import Tabs from './Tabs.svelte';
  import DateTimePicker from "./DateTimePicker.svelte";
	import RouteElement from './Route.svelte';
  import Button, { Icon, Label } from '@smui/button';
  import elementResizeDetectorMaker from '@andybeersdev/element-resize-detector';
  import {
    addDepartureDateTimeToRoutes,
    addPlaceByDepartureDateTimeToRoutes,
    changeDepartureDateTimeToRoutes,
    findRoutesByDepartureDateTime,
    getDepartureDateTimes,
    initialRoutes,
    removeDepartureDateTimeFromRoutes
  } from '$lib/models/routes';
  import type { Route } from '$lib/models/route';
  import type { Place } from "$lib/models/place";

  /** DateTimePicker タグ */
  let dateTimePicker: DateTimePicker;
  /** 新規タブ追加中の場合はコールバックが設定される */
  let addTabCallback: ((date: Date) => void)  | undefined;
  /** Map コンポーネント */
  let selectedPlace: Place;
  /** 追加ボタン のエレメント。スクロール用に利用 */
  let addButton: HTMLElement;
  /** gmpx-split-layout の固定情報エレメント。ルート一覧の内容が変わったときに高さの変更を検知する用 */
  let fixed: HTMLElement;
  /** 出発日時別ルート */
  let routes = initialRoutes();
  /** 出発日時タブの一覧。工程を管理できるようになるとエンティティのリストになる */
  let tabs = getDepartureDateTimes(routes);
  /** アクティブなタブ */
  let active = tabs[0];
  /** アクティブなタブのルート */
  let route: Route | undefined;
  $: route = findRoutesByDepartureDateTime(routes, active);

  /**
   * コンポーネントがロードされたら、ルート一覧の内容が変わった(高さに変化があった)ときに
   * 常に一番下(追加ボタン)にスクロールするように設定する。
   */
  onMount(async () => {
    const erdUltraFast = elementResizeDetectorMaker({ strategy: "scroll" });
    erdUltraFast.listenTo(fixed, ()  => {
      addButton.scrollIntoView(false);
    });
  });

  /**
   * 出発日時を変更がクリックされたときのアクション
   * DateTimePicker を表示する
   */
  function changeDepartureDateTime() {
    dateTimePicker.open(active);
  }

  /**
   * 出発日時が変更された後に呼び出される
   *
   * ### 新規タブ追加のとき
   *
   * - コールバックを呼び出す
   *
   * ### 日時変更のとき
   *
   * - ルートの出発日を変更する
   * - 出発日時一覧を更新する
   * - アクティブタブを更新する
   */
   function changedDepartureDateTime(e: CustomEvent) {
    if (addTabCallback) {
      addTabCallback(e.detail);
    } else {
      changeDepartureDateTimeToRoutes(routes, active, e.detail);
      tabs = getDepartureDateTimes(routes);
      setTimeout(() => active = e.detail);
    }
  }

  /**
   * 新規タブ追加がクリックされたときのアクション
   * DateTimePicker を現在日時で開いて、設定後に呼び出されるコールバック関数を設定する
   *
   * ### コールバック
   *
   * - ルート一覧に追加する
   * - 出発日時一覧を更新する
   * - アクティブタブを更新する
   * - コールバックの無効化
   */
  function addTab() {
    dateTimePicker.open(new Date());
    addTabCallback = (date: Date) => {
      route = addDepartureDateTimeToRoutes(routes, date);
      tabs = getDepartureDateTimes(routes);
      setTimeout(() => active = date);
      addTabCallback = undefined;
    };
  }

  /**
   * タブを閉じるがクリックされたときのアクション
   * - アクティブタブを切り替える（通常は1つ手間だが、先頭の場合はそのまま）
   * - ルート一覧から出発日時を削除する
   * - 出発日時一覧を更新する
   */
  function closeTab() {
    const activeIndex = tabs.indexOf(active);
    removeDepartureDateTimeFromRoutes(routes, active);
    tabs = getDepartureDateTimes(routes);
    setTimeout(() => active = tabs[activeIndex] ?? tabs[activeIndex - 1]);
  }

  /**
   * 場所をアクティブなルートに追加する
   */
  function addPlaceToRoute() {
    route = addPlaceByDepartureDateTimeToRoutes(routes, active, selectedPlace);
  }
</script>

<style>
  [slot='main'] {
    height: 100%;
  }
  [slot='fixed'] {
    min-height: 100%;
  }
  gmpx-split-layout {
    --gmpx-fixed-panel-width-row-layout: 50%;
    --gmpx-fixed-panel-height-column-layout: 40%;
  }
  #add-route-wrapper {
    padding: 1.5em 0;
    text-align: center;
  }
 :global(.button-shaped-round) {
    border-radius: 36px;
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
    <Map bind:selected={selectedPlace}></Map>
  </div>
  <div slot="fixed" bind:this={fixed}>
    <Tabs  planDates={tabs} bind:active={active} on:add={addTab} on:close={closeTab} on:changeDepartureDateTime={changeDepartureDateTime}></Tabs>
    <RouteElement value={route}></RouteElement>
    <div id="add-route-wrapper" bind:this={addButton}>
      <Button variant="outlined" color="secondary" class="button-shaped-round" on:click={addPlaceToRoute}>
        <Icon class="material-icons">add</Icon>
        <Label>選択されている場所を追加する</Label>
      </Button>
    </div>
    <DateTimePicker bind:this={dateTimePicker} on:selected={changedDepartureDateTime}></DateTimePicker>
  </div>
</gmpx-split-layout>
