<script lang="ts">
  import { userStore } from '$lib/models/user';
  import { backButton } from '$lib/store/back-button';
  import { signIn, signOut } from '@auth/sveltekit/client';
  import type { User } from '@auth/sveltekit';

  /** アカウントメニュー */
  let accoutMenu: HTMLUListElement;
  let loggedIn: boolean = false;
  let user: User | undefined;

  userStore.subscribe((cur) => {
    loggedIn = cur.loggedIn;
    user = cur.user;
  });

  async function login() {
    return signIn('google');
  }
  async function logout() {
    await signOut();
    loggedIn = false;
  }
  function accountButtonClassName(loggedIn: boolean) {
    if (loggedIn && user?.image) {
      return 'photo rounded-full';
    } else {
      return 'material-symbols-outlined';
    }
  }
  $: bgImage =
    loggedIn && user?.image
      ? `background-image: url("${user?.image}");background-size: 32px 32px;height: 32px;width: 32px;`
      : '';
</script>

<div class="flex flex-row navbar bg-primary text-primary-content" style="z-index: 7">
    <div class="flex-none">
      {#if $backButton}
        <button class="btn btn-square btn-ghost" on:click={() => location.href="."}>
          <span class="material-symbols-outlined">
            arrow_back
          </span>
          </button>
      {/if}
    </div>
  <div class="flex-1">
    <a class="btn btn-ghost text-xl" href="/tourings">Welcome to My Touring Links</a>
  </div>
  <div class="flex-none">
    <div class="dropdown dropdown-end">
      <button
        class={accountButtonClassName(loggedIn)}
        style={bgImage}
        aria-label="account settings"
      >
        {#if !(loggedIn && user?.image)}
          person
        {/if}
      </button>
      <ul class="menu dropdown-content bg-base-200 rounded-box w-56" bind:this={accoutMenu}>
        {#if loggedIn}
          <li class="menu-title">{user?.name}</li>
        {/if}
        <li class={loggedIn ? 'menu-disabled': 'text-neutral'}><button on:click={login} disabled={loggedIn}>Googleアカウントでログイン</button></li>
        <li class={!loggedIn ? 'menu-disabled': 'text-neutral'}><button on:click={logout} disabled={!loggedIn}>ログアウト</button></li>
      </ul>
    </div>
  </div>
</div>
