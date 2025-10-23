<script lang="ts">
  import { DateTime } from 'luxon';
  import { userStore } from '$lib/models/user';
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';

  /** PlanDates */
  export let planDates: Date[];
  export let active: Date;

  let loggedIn: boolean = false;
  let actions = [
    { name: '設定', icon: 'settings', disabled: false },
    { name: '保存', icon: 'save', disabled: !loggedIn }
  ];

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
  <div role="tablist" class="tabs tabs-lift overflow-x-scroll bg-base-200">
    {#each planDates as tab}
      <button role="tab" class={"tab" + ((active.getTime() === tab.getTime()) ? " bg-base-100 tab-active" : " bg-base-300")} on:click={() => active = tab}>
        {DateTime.fromJSDate(tab)
          .setZone('Asia/Tokyo')
          .toFormat('MM/dd（EEEEE）HH:mm', { locale: 'ja' })}
      </button>
    {/each}
  </div>
  <div class="dropdown dropdown-end grow text-right bg-base-200">
    <button  aria-label="メニュー">
      <span class="material-symbols-outlined">more_vert</span>
    </button>
    <ul class="menu dropdown-content bg-base-100 rounded-box w-56 shadow-sm">
      <li>
        <a href={`${$page.url.href}/settings`} class="text-nowrap">
          <span class="material-symbols-outlined">settings</span>
          出発日時の設定
        </a>
      </li>
      <li>
        <button disabled={!loggedIn} on:click={() => saveTouring()} class="text-nowrap">
          <span class="material-symbols-outlined">bookmark</span>
          保存と共有
        </button>
      </li>
    </ul>
  </div>
</nav>

<style>
  nav {
    position: sticky;
    background-color: var(--color-base-200);
    top: 0;
    z-index: 3;
    display: flex;
    flex-direction: row;
    align-items: center;
  }
</style>
