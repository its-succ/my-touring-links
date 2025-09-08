<script lang="ts">
  import { PUBLIC_GMAP_API_KEY } from '$env/static/public';
  import { onMount } from 'svelte';
  import Map from './Map.svelte';
  import Tabs from './Tabs.svelte';
  import RouteElement from './Route.svelte';
  import Progress from './Progress.svelte';
  import Button, { Icon, Label } from '@smui/button';
  import elementResizeDetectorMaker from '@andybeersdev/element-resize-detector';
  import { Touring } from '$lib/models/touring';
  import type { Route } from '$lib/models/route';
  import type { Place } from '$lib/models/place';
  import type { EditTouringEntity } from '$lib/models/entity';
  import SaveModal from './SaveModal.svelte';
  import { Tooltip } from '@svelte-plugins/tooltips';
  import { userStore } from '$lib/models/user';
  import ShareModal from './ShareModal.svelte';

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
    touring: {}
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
  /** 保存ダイアログタグ */
  let saveModal: SaveModal;
  /** 共有ダイアログタグ */
  let shareModal: ShareModal;
  /** 案内ヘルプ */
  let stepHelp = true;
  /** 案内ヘルプ幅 */
  let stepHelpWidth: number;
  /** ログインしているかどうか */
  let loggedIn: boolean = false;

  /**
   * コンポーネントがロードされたら、ルート一覧の内容が変わった(高さに変化があった)ときに
   * 常に一番下(追加ボタン)にスクロールするように設定する。
   */
  onMount(async () => {
    const erdUltraFast = elementResizeDetectorMaker({ strategy: 'scroll' });
    erdUltraFast.listenTo(fixed, () => {
      addButton.scrollIntoView(false);
    });
    stepHelpWidth = Math.min(400, window.innerWidth - 20);
  });

  userStore.subscribe((cur) => {
    loggedIn = cur.loggedIn;
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
   * ルート共有できないかどうか
   * @param loggedIn - ログインしているかどうか
   * @param entity - 編集中のエンティティ
   * @param touring - 出発日時別ルート
   * @returns ルート共有できないときは true
   */
  function shareDisable(loggedIn: boolean, entity: EditTouringEntity, touring: Touring) {
    if (!loggedIn) return true;
    const calcedDepartureDateTime = Object.keys(touring.getArrivalTimeJSON());
    return (
      JSON.stringify(calcedDepartureDateTime.sort()) !==
      JSON.stringify(Object.keys(entity.touring).sort())
    );
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
  export async function getTouring(): Promise<EditTouringEntity> {
    const serialized = await touring.serialize();
    return { ...entity, touring: serialized };
  }

  /**
   * 編集対象のツーリングを設定する。
   * ページリロード時など、セッションから復帰するときに呼び出される
   * 復帰オブジェクトが空の場合は何もしない
   * @param touring - 編集するツーリングエンティティ
   */
  export async function setTouring(value: EditTouringEntity) {
    if (Object.keys(value.touring).length === 0 && value.touring.constructor === Object) return;
    await touring.deserialize(value.touring);
    entity = {
      ...value
    };
    tabs = touring.getDepartureDateTimes();
    setTimeout(() => (active = tabs[0]));
  }

  /**
   * ツーリングを保存する
   */
  async function saveTouring() {
    const serialized = await touring.serialize();
    saveModal.save({ ...entity, touring: serialized });
  }

  /**
   * ツーリングを共有する
   */
  async function shareTouring() {
    if (entity.id === undefined) throw Error('Unsaved touring can not share');
    shareModal.share(entity.id, touring.getArrivalTimeJSON());
  }

  /**
   * ルート情報に応じてヘルプメッセージを変更する
   * @param route - ルート
   * @param progressOpen - 計算中かどうか
   * @returns ルート計算できないときは true
   */
  function helpMessage(route?: Route, progressOpen?: boolean) {
    if (routeDisable(route)) {
      return '出発地、立ち寄り場所、目的地を追加してルートを作成してみましょう';
    }
    if (route?.getCalcedDate()) {
      if (loggedIn) {
        return 'ルートの共有準備が完了しました！ ルートを保存すると共有できます。';
      }
      return 'ルートの共有準備が完了しました！ Googleアカウントでログインすると、ルートの保存や共有ができるようになります';
    }
    return 'ルートが作成できたら、出発日時や経由値の滞在時間を設定して、ルート計算してみましょう';
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
      <Tooltip
        content={helpMessage(route, progressOpen)}
        position="bottom"
        bind:show={stepHelp}
        arrow={true}
        maxWidth={stepHelpWidth}
        action="prop"
      >
        <Button
          variant="outlined"
          color="primary"
          class="button-shaped-round"
          on:click={addPlaceToRoute}
        >
          <Icon class="material-icons">add</Icon>
          <Label>場所を追加</Label>
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          class="button-shaped-round"
          disabled={routeDisable(route)}
          on:click={calcRoute}
        >
          <Icon class="material-icons">alt_route</Icon>
          <Label>ルート計算</Label>
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          class="button-shaped-round"
          disabled={!loggedIn}
          on:click={saveTouring}
        >
          <Icon class="material-icons">bookmark</Icon>
          <Label>保存</Label>
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          class="button-shaped-round"
          disabled={shareDisable(loggedIn, entity, touring)}
          on:click={shareTouring}
        >
          <Icon class="material-icons">share</Icon>
          <Label>共有</Label>
        </Button>
      </Tooltip>
    </div>
  </div>
</gmpx-split-layout>
<Progress bind:open={progressOpen}></Progress>
<SaveModal bind:this={saveModal}></SaveModal>
<ShareModal bind:this={shareModal}></ShareModal>

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
    position: relative;
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
