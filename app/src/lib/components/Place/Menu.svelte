<script lang="ts">
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Text, Graphic } from '@smui/list';
  import { createEventDispatcher } from 'svelte';
  import type { Place } from '$lib/models/place';
	import StayingTimeEditor from './StayingTimeEditor.svelte';

  /** Place ID */
  export let place: Place;
  /** ルート計算結果 */
  export let directionsResult: google.maps.DirectionsResult | undefined;

  /** Menu コンポーネント */
  let menu: Menu;
  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();
  /** 滞在時間編集ダイアログの表示状態 */
  let stayingTimeDialog = false;
</script>

<IconButton class="material-icons" size="button" on:click={() => menu.setOpen(true)}>more_vert</IconButton>
<Menu bind:this={menu}>
  <List>
    <Item on:SMUI:action={() => dispatch('deleteFromRoute', place.id)}>
      <Text class="mdc-typography--caption">ルートから削除</Text>
    </Item>
    <Item on:SMUI:action={() => stayingTimeDialog = true}>
      <Text class="mdc-typography--caption">滞在時間を変更する</Text>
    </Item>
    <Item on:SMUI:action={() => dispatch('previewRouteTo', place.id)} disabled={directionsResult === undefined}>
      <Text class="mdc-typography--caption">1つ前の場所からのルートを確認</Text>
    </Item>
    <Item>
      <gmpx-place-field-link href-field="googleMapsURI" class="mdc-typography--caption">スポットの詳細を見る</gmpx-place-field-link>
      <Graphic class="mdc-typography--caption material-icons">open_in_new</Graphic>
    </Item>
  </List>
</Menu>
<StayingTimeEditor bind:open={stayingTimeDialog} value={place.stayingTime} on:change={(e) => dispatch('changeStayingTime', { id: place.id, value: e.detail })}></StayingTimeEditor>
