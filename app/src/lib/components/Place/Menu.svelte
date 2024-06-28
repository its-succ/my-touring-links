<script lang="ts">
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item, Text, Graphic } from '@smui/list';
  import { createEventDispatcher } from 'svelte';
  import { type Place, isSpot, googleMapURI } from '$lib/models/place';

  /** Place ID */
  export let place: Place;
  /** ルート計算されているかどうか */
  export let hasDirectionsResult: boolean;
  /** 出発地かどうか */
  export let origin: boolean;
  /** 最終目的地かどうか */
  export let destination: boolean;

  /** Menu コンポーネント */
  let menu: Menu;
  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();
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
        on:SMUI:action={() =>
          dispatch('editPlace', {
            place,
            displayNameOnly: origin === true || destination === true
          })}
      >
        <Text class="mdc-typography--caption">場所の編集</Text>
      </Item>
      <Item
        on:SMUI:action={() => dispatch('previewRouteTo', place.id)}
        disabled={hasDirectionsResult === false || origin === true}
      >
        <Text class="mdc-typography--caption">1つ前の場所からのルートを確認</Text>
      </Item>
      {#if isSpot(place)}
        <Item>
          <a href={googleMapURI(place)} class="mdc-typography--caption" target="_blank"
            >スポットの詳細を見る</a
          >
          <Graphic class="mdc-typography--caption material-icons">open_in_new</Graphic>
        </Item>
      {/if}
    </List>
  </Menu>
</div>

<style>
  * :global(.mdc-typography--caption),
  * :global(.mdc-checkbox__native-control) {
    color: var(--mdc-theme-on-surface);
  }
</style>
