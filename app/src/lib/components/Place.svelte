<script lang="ts">
import { DateTime } from 'luxon';
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Text, Graphic } from '@smui/list';
  import { createEventDispatcher } from 'svelte';

  /** Place ID */
  export let placeId: string | undefined;
  /** ソートハンドルアイコンが押されているかどうか */
  export let pressed: boolean;
  /** ルート計算結果 */
  export let directionsResult: google.maps.DirectionsResult | undefined;
  /** 最終目的地かどうか */
  export let isLatest: boolean = false;

  /** Menu コンポーネント */
  let menu: Menu;
  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();

  /**
   * 出発日時をフォーマットする
   * @returns 出発日時文字列
   */
  function formatedArrivalTime() {
    const duration = directionsResult!.routes[0].legs.map((l) => l.duration!.value).reduce((sum, val) => sum + val, 0);
    return DateTime.fromJSDate(directionsResult!.request.drivingOptions!.departureTime)
      .setZone('Asia/Tokyo')
      .plus({ seconds: duration })
      .toFormat('HH:mm');
  }

  /**
   * 到着日時をフォーマットする
   * @returns 到着日時文字列
   */
   function formatedDepartureTime() {
    const duration = directionsResult!.routes[0].legs.map((l) => l.duration!.value).reduce((sum, val) => sum + val, 0);
    return DateTime.fromJSDate(directionsResult!.request.drivingOptions!.departureTime)
      .setZone('Asia/Tokyo')
      .plus({ seconds: duration })
      .plus({ minutes: 10 }) // TODO: 滞在時間は仮で10分
      .toFormat('HH:mm');
  }
</script>

<style>
  gmpx-place-data-provider {
    display: grid;
    grid-template:
      "img name meta" auto
      "img address meta" auto
      /50px 1fr
    ;
    gap: 0 10px;
    padding: 5px;
    border-radius: 4px;
    background-color: #f0f1f1;
  }

  gmpx-place-photo-gallery {
    grid-area: img;
  }

  gmpx-place-photo-gallery::part(tile) {
    max-width: 40px;
    max-height: 40px;
    margin: 5px;
    border-radius: 100%;
  }

  header {
    grid-area: name;
    align-self: end;
  }

  p.place-description {
    grid-area: address;
    align-self: start;
    margin: 0;
    padding: 0;
    min-height: 1em;
  }

  :global(.place-description ul) {
    display: flex;
    padding: 0;
  }

  :global(.place-description ul li) {
    padding-left: 5px;
    padding-right: 5px;
    height: 24px;
  }

  :global(.place-description .route-icons) {
    margin-right: 5px;
    font-size: 20px;
  }

  div.meta {
    grid-area: meta;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<gmpx-place-data-provider place="{placeId}">
  <gmpx-place-photo-gallery max-tiles="1"></gmpx-place-photo-gallery>
  <header class="mdc-typography--subtitle1">
    <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
  </header>
  <p class="place-description">
    {#if directionsResult !== undefined}
    <List>
      <Item>
        <Graphic class="material-icons route-icons">check_circle</Graphic>
        <Text class="mdc-typography--body2">{formatedArrivalTime()}</Text>
      </Item>
      {#if !isLatest}
      <Item>
        <Graphic class="material-icons route-icons">local_parking</Graphic>
        <Text class="mdc-typography--body2">10分</Text>
      </Item>
      <Item>
        <Graphic class="material-icons route-icons">forward</Graphic>
        <Text class="mdc-typography--body2">{formatedDepartureTime()}</Text>
      </Item>
      {/if}
    </List>
    {/if}
  </p>
  <div class="meta">
    <IconButton class="material-icons" on:click={() => menu.setOpen(true)}>more_vert</IconButton>
    <Menu bind:this={menu}>
      <List>
        <Item on:SMUI:action={() => dispatch('deleteFromRoute', placeId)}>
          <Text class="mdc-typography--caption">ルートから削除</Text>
        </Item>
        <Item on:SMUI:action={() => dispatch('previewRouteTo', placeId)} disabled={directionsResult === undefined}>
          <Text class="mdc-typography--caption">1つ前の場所からのルートを確認</Text>
        </Item>
        <Item>
          <gmpx-place-field-link href-field="googleMapsURI" class="mdc-typography--caption">スポットの詳細を見る</gmpx-place-field-link>
          <Graphic class="mdc-typography--caption material-icons">open_in_new</Graphic>
        </Item>
      </List>
    </Menu>
    <div on:pointerdown={() => pressed = true} on:pointerleave={() => pressed = false}><IconButton class="material-icons" ripple={false}>drag_handle</IconButton></div>
  </div>
</gmpx-place-data-provider>
