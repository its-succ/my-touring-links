<script lang="ts">
  import { DateTime } from 'luxon';
  import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import Button, { Label as ButtonLabel, Icon } from '@smui/button';
  import { userStore } from '$lib/models/user';
  import { page } from '$app/stores';
  import IconButton from '@smui/icon-button';
  import Menu from '@smui/menu';
  import List, { Item } from '@smui/list';
  import { createEventDispatcher } from 'svelte';

  /** PlanDates */
  export let planDates: Date[];
  export let active: Date;

  let loggedIn: boolean = false;
  let actions = [
    { name: '設定', icon: 'settings', disabled: false },
    { name: '保存', icon: 'save', disabled: !loggedIn }
  ];
  let menu: Menu;

  userStore.subscribe((cur) => {
    loggedIn = cur.loggedIn;
    actions = actions;
  });

  /** イベントディスパッチャー */
  const dispatch = createEventDispatcher();

  function saveTouring(): void {
    dispatch('saveTouring');
  }
</script>

<nav>
  <TabBar tabs={planDates} let:tab bind:active class="tabs">
    <Tab {tab} minWidth>
      <Label class="tab-label"
        >{DateTime.fromJSDate(tab)
          .setZone('Asia/Tokyo')
          .toFormat('MM/dd（EEEEE）HH:mm', { locale: 'ja' })}</Label
      >
    </Tab>
  </TabBar>
  <div>
    <IconButton class="material-icons" on:click={() => menu.setOpen(true)} aria-label="メニュー"
      >more_vert</IconButton
    >
    <Menu bind:this={menu}>
      <List>
        <Item>
          <Button href={`${$page.url.href}/settings`}>
            <Icon class="material-icons">settings</Icon>
            <ButtonLabel class="nowrap">出発日時の設定</ButtonLabel>
          </Button>
        </Item>
        <Item>
          <Button disabled={!loggedIn} on:click={() => saveTouring()}>
            <Icon class="material-icons">save</Icon>
            <ButtonLabel class="nowrap">保存</ButtonLabel>
          </Button>
        </Item>
      </List>
    </Menu>
  </div>
</nav>

<style>
  nav {
    position: sticky;
    background-color: var(--mdc-theme-background);
    top: 0;
    z-index: 3;
    display: flex;
    flex-direction: row;
  }
  nav :global(.tabs) {
    overflow-x: scroll;
  }
  * :global(.tab-label) {
    color: var(--mdc-theme-on-surface);
  }
  * :global(.nowrap) {
    text-wrap: nowrap;
  }
</style>
