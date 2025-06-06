<script lang="ts">
  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import Menu from '@smui/menu';
  import { Anchor } from '@smui/menu-surface';
  import List, { Item, Subheader, Text } from '@smui/list';
  import { userStore } from '$lib/models/user';
  import IconButton from '@smui/icon-button';
  import { backButton } from '$lib/store/back-button';
  import { signIn, signOut } from "@auth/sveltekit/client";
  import type { User } from '@auth/sveltekit';

  /** アカウントメニュー */
  let accoutMenu: Menu;
  let anchor: HTMLDivElement;
  let anchorClasses: { [k: string]: boolean } = {};
  let loggedIn: boolean = false;
  let user: User | undefined;

  userStore.subscribe((cur) => {
    loggedIn = cur.loggedIn;
    user = cur.user;
  });

  async function login() {
    return signIn("google")
  }
  async function logout() {
    await signOut()
    loggedIn = false;
  }
  function accountButtonClassName(loggedIn: boolean) {
    if (loggedIn && user?.image) {
      return 'photo';
    } else {
      return 'material-symbols-outlined';
    }
  }
  $: bgImage =
    loggedIn && user?.image
      ? `background-image: url("${user?.image}");background-size: 32px 32px;height: 32px;width: 32px;`
      : '';
</script>

<TopAppBar variant="static" color="primary" style="z-index: 7">
  <Row>
    <Section>
      {#if $backButton}
        <IconButton class="material-icons" href=".">arrow_back</IconButton>
      {/if}
      <Title>Welcome to My Touring Links</Title>
    </Section>
    <Section align="end" toolbar>
      <div
        class={Object.keys(anchorClasses).join(' ')}
        use:Anchor={{
          addClass: (className) => {
            if (!anchorClasses[className]) {
              anchorClasses[className] = true;
            }
          },
          removeClass: (className) => {
            if (anchorClasses[className]) {
              delete anchorClasses[className];
              anchorClasses = anchorClasses;
            }
          }
        }}
        bind:this={anchor}
      >
        <button
          class={accountButtonClassName(loggedIn)}
          style={bgImage}
          aria-label="account settings"
          on:click={() => accoutMenu.setOpen(true)}
        >
          {#if !(loggedIn && user?.image)}
            person
          {/if}
        </button>
        <Menu
          bind:this={accoutMenu}
          anchor={false}
          bind:anchorElement={anchor}
          anchorCorner="BOTTOM_LEFT"
        >
          <List>
            {#if loggedIn}
              <Subheader>{user?.name}</Subheader>
            {/if}
            <Item on:SMUI:action={login} disabled={loggedIn} class="menu-item">
              <Text>Googleアカウントでログイン</Text>
            </Item>
            <Item on:SMUI:action={logout} disabled={!loggedIn} class="menu-item">
              <Text>ログアウト</Text>
            </Item>
          </List>
        </Menu>
      </div>
    </Section>
  </Row>
</TopAppBar>

<style>
  button {
    font-size: var(--md-sys-typescale-headline-large-font-size);
    background-color: var(--mdc-theme-background);
    border-radius: 100%;
    color: var(--mdc-theme-primary);
    margin-top: 4px;
    margin-right: 16px;
  }
  :global(.mdc-top-app-bar__title) {
    color: var(--mdc-theme-on-primary);
  }
  * :global(.menu-item) {
    color: var(--mdc-theme-on-surface);
  }
</style>
