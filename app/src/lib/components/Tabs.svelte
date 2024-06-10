<script lang="ts">
  import { DateTime } from 'luxon';
  import Button from '@smui/button';
  import Tab, { Label, Icon } from '@smui/tab';
  import TabBar from '@smui/tab-bar';
  import { createEventDispatcher } from 'svelte';

  /** PlanDates */
  export let planDates: Date[];
  export let active: Date;

  const dispatch = createEventDispatcher();

  /**
   * アクティブなタブの出発日時を変更する
   */
  function changeDepartureDateTime() {
    dispatch('changeDepartureDateTime');
  }
  /**
   * タブを追加する
   */
  function add() {
    dispatch('add');
  }
  /**
   * タブを閉じる
   */
  function close() {
    dispatch('close');
  }
</script>

<header>
  <TabBar tabs={planDates} let:tab bind:active>
    <Tab {tab} minWidth>
      <Label class="tab-label"
        >{DateTime.fromJSDate(tab)
          .setZone('Asia/Tokyo')
          .toFormat('yyyy/MM/dd（EEEEE）HH:mm', { locale: 'ja' })}</Label
      >
    </Tab>
    {#if tab === planDates[planDates.length - 1]}
      <Tab tab={'+'} minWidth on:click={add} indicatorSpanOnlyContent>
        <Icon class="material-icons tab-label">add</Icon>
      </Tab>
    {/if}
  </TabBar>
  <nav>
    <Button color="secondary" on:click={changeDepartureDateTime}>
      <Label>出発日時を変更する</Label>
      <Icon class="material-icons navicon">settings</Icon>
    </Button>
    <Button color="secondary" disabled={planDates.length === 1} on:click={close}>
      <Label>タブを閉じる</Label>
      <Icon class="material-icons navicon">close</Icon>
    </Button>
  </nav>
</header>

<style>
  header {
    position: sticky;
    background-color: var(--mdc-theme-background);
    top: 0;
    z-index: 3;
  }
  nav {
    display: block;
    text-align: right;
    padding: 1em;
  }
  * :global(.tab-label) {
    color: var(--mdc-theme-on-surface);
  }
</style>
