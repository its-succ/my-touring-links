<script lang="ts">
  import { PUBLIC_GMAP_API_KEY } from '$env/static/public';
  import { onMount } from 'svelte';
  import Map from './Map.svelte';
  import Tabs from './Tabs.svelte';
  import RouteElement from './Route.svelte';
  import Progress from './Progress.svelte';
  import Button, { Icon, Label } from '@smui/button';
  import elementResizeDetectorMaker from '@andybeersdev/element-resize-detector';
  import { Touring, type EditTouringEntity } from '$lib/models/touring';
  import type { Route } from '$lib/models/route';
  import type { Place } from '$lib/models/place';
  import { DateTime } from 'luxon';

  /** Map コンポーネント */
  let map: Map;
  /** Map で選択されている場所 */
  let selectedPlace: Place;
  /** 追加ボタン のエレメント。スクロール用に利用 */
  let addButton: HTMLElement;
  /** gmpx-split-layout の固定情報エレメント。ルート一覧の内容が変わったときに高さの変更を検知する用 */
  let fixed: HTMLElement;
  /** 出発日時別ルート */
  let touring = new Touring();
  /** 編集中のエンティティ */
  let entity: EditTouringEntity = {
    name: '',
    touring: touring.toJSON()
  };
  /** 出発日時タブの一覧。工程を管理できるようになるとエンティティのリストになる */
  let tabs = touring.getDepartureDateTimes();
  /** アクティブなタブ */
  let active = tabs[0];
  /** アクティブなタブのルート */
  let route: Route | undefined;
  $: route = active instanceof Date ? touring.findTouringByDepartureDateTime(active) : route;
  /** ルートエレメント */
  let routeElement: RouteElement;
  /** プログレスダイアログの表示状態 */
  let progressOpen: boolean;

  /**
   * コンポーネントがロードされたら、ルート一覧の内容が変わった(高さに変化があった)ときに
   * 常に一番下(追加ボタン)にスクロールするように設定する。
   */
  onMount(async () => {
    const erdUltraFast = elementResizeDetectorMaker({ strategy: 'scroll' });
    erdUltraFast.listenTo(fixed, () => {
      addButton.scrollIntoView(false);
    });
  });

  /**
   * 場所をアクティブなルートに追加する
   */
  function addPlaceToRoute() {
    route = touring.addPlaceByDepartureDateTimeToTouring(active, selectedPlace);
  }

  /**
   * ルートをプレビューする
   * @param e - DirectionsResult を含むイベント
   */
  async function previewRoute(e: CustomEvent<google.maps.DirectionsResult>) {
    await map.previewRoute(e.detail);
  }

  /**
   * ルート計算できないかどうか
   * @param route - ルート
   * @returns ルート計算できないときは true
   */
  function routeDisable(route?: Route) {
    if (route === undefined) return true;
    if (route.get().length < 2) return true;
    return false;
  }

  /**
   * ルートを計算する
   */
  async function calcRoute() {
    progressOpen = true;
    await routeElement.calc(active);
    progressOpen = false;
  }

  /**
   * 編集中のツーリングを取得する
   * @returns 編集中のツーリングオブジェクト
   */
  export function getTouring(): EditTouringEntity {
    return { ...entity, touring: touring.toJSON() };
  }

  /**
   * 編集対象のツーリングを設定する。
   * ページリロード時など、セッションから復帰するときに呼び出される
   * 復帰オブジェクトが空の場合は何もしない
   * @param touring - 編集するツーリングエンティティ
   */
  export function setTouring(value: EditTouringEntity) {
    if (Object.keys(value.touring).length === 0 && value.touring.constructor === Object) return;
    entity = value;
    touring.fromJSON(value.touring);
    tabs = touring.getDepartureDateTimes();
    setTimeout(() => (active = tabs[0]));
  }

  /**
   * ツーリングを保存する
   */
  async function saveTouring() {
    if (!entity.id) {
      const placeholder = `${DateTime.fromJSDate(tabs[0]).setZone('Asia/Tokyo').toFormat('MM/dd', { locale: 'ja' })}出発ツーリング`;
      const name = prompt('保存するツーリングに名前をつけてください', placeholder);
      entity.name = name || placeholder;
      fetch('/api/tourings', { method: 'POST', body: JSON.stringify(entity) });
    }
  }
</script>

<gmpx-api-loader key={PUBLIC_GMAP_API_KEY}></gmpx-api-loader>
<gmpx-split-layout column-reverse row-reverse row-layout-min-width="640">
  <div slot="main">
    <Map bind:selected={selectedPlace} bind:this={map}></Map>
  </div>
  <div slot="fixed" bind:this={fixed}>
    <Tabs planDates={tabs} bind:active on:saveTouring={saveTouring}></Tabs>
    <RouteElement value={route} on:previewRoute={previewRoute} bind:this={routeElement}
    ></RouteElement>
    <div id="add-route-wrapper" bind:this={addButton}>
      <Button
        variant="outlined"
        color="primary"
        class="button-shaped-round"
        on:click={addPlaceToRoute}
      >
        <Icon class="material-icons">add</Icon>
        <Label>場所を追加する</Label>
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        class="button-shaped-round"
        disabled={routeDisable(route)}
        on:click={calcRoute}
      >
        <Icon class="material-icons">alt_route</Icon>
        <Label>ルートを計算する</Label>
      </Button>
    </div>
  </div>
</gmpx-split-layout>
<Progress bind:open={progressOpen}></Progress>

<style>
  [slot='main'] {
    height: 100%;
  }
  [slot='fixed'] {
    min-height: 100%;
  }
  gmpx-split-layout {
    --gmpx-fixed-panel-width-row-layout: 50%;
    --gmpx-fixed-panel-height-column-layout: 50%;
  }
  #add-route-wrapper {
    padding: 1.5em 0;
    text-align: center;
  }
  * :global(.button-shaped-round) {
    border-radius: 36px;
  }
  @media screen and (min-width: 640px) {
    [slot='fixed'] {
      padding-left: 4em;
    }
  }
</style>
