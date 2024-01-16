<script lang="ts">
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Text, Graphic, Label, Meta } from '@smui/list';
  import Checkbox from '@smui/checkbox';
  import { createEventDispatcher } from 'svelte';
  import type { Place } from '$lib/models/place';
  import StayingTimeEditor from './StayingTimeEditor.svelte';

  /** Place ID */
  export let place: Place;
  /** ルート計算結果 */
  export let directionsResult: google.maps.DirectionsResult | undefined;
  /** 出発地かどうか */
  export let origin: boolean;
  /** 最終目的地かどうか */
  export let destination: boolean;

  /** Menu コンポーネント */
  let menu: Menu;
  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();
  /** 滞在時間編集ダイアログの表示状態 */
  let stayingTimeDialog = false;
  /** 経由地 */
  let waypoint = place.waypoint || false;
  $: fireChangeWaypoint(waypoint);
  function fireChangeWaypoint(value: boolean) {
    dispatch('changeWaypoint', { id: place.id, value });
  }
</script>

<div>
  <IconButton class="material-icons" size="button" on:click={() => menu.setOpen(true)}
    >more_vert</IconButton
  >
  <Menu bind:this={menu}>
    <List>
      <Item on:SMUI:action={() => dispatch('deleteFromRoute', place.id)}>
        <Text class="mdc-typography--caption">ルートから削除</Text>
      </Item>
      <Item
        on:SMUI:action={() => (stayingTimeDialog = true)}
        disabled={waypoint === true || origin === true || destination === true}
      >
        <Text class="mdc-typography--caption">滞在時間を変更する</Text>
      </Item>
      <Item nonInteractive disabled={origin === true || destination === true}>
        <Label class="mdc-typography--caption">経由地</Label>
        <Meta>
          <Checkbox bind:checked={waypoint} disabled={origin === true || destination === true} />
        </Meta>
      </Item>
      <Item
        on:SMUI:action={() => dispatch('previewRouteTo', place.id)}
        disabled={directionsResult === undefined || origin === true}
      >
        <Text class="mdc-typography--caption">1つ前の場所からのルートを確認</Text>
      </Item>
      <Item>
        <gmpx-place-field-link href-field="googleMapsURI" class="mdc-typography--caption"
          >スポットの詳細を見る</gmpx-place-field-link
        >
        <Graphic class="mdc-typography--caption material-icons">open_in_new</Graphic>
      </Item>
    </List>
  </Menu>
  <StayingTimeEditor
    bind:open={stayingTimeDialog}
    value={place.stayingTime}
    on:change={(e) => dispatch('changeStayingTime', { id: place.id, value: e.detail })}
  ></StayingTimeEditor>
</div>

<style>
  * :global(.mdc-typography--caption), * :global(.mdc-checkbox__native-control) {
    color: var(--mdc-theme-on-surface);
  }
</style>
