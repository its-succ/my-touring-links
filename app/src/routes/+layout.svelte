<script lang="ts">
  import AppHeader from 'components/AppHeader.svelte';
  import { onMount } from 'svelte';
  import type { LayoutData } from './$types';
  import { userStore } from '$lib/models/user';

  export let data: LayoutData;

  onMount(async () => {
    const user = await data.getAuthUser();
    const loggedIn = !!user && user?.emailVerified;
    userStore.update((cur) => ({ ...cur, user, loggedIn }));
  });
</script>

<AppHeader />
<main>
  <article>
    <slot />
  </article>
</main>
<footer><small>@ESM.Inc ITS SUCC Community</small></footer>

<style>
  :global(html, body) {
    height: 100vh;
    margin: 0;
  }
  :global(body) {
    display: flex;
    flex-direction: column;
  }
  main {
    flex-grow: 1;
    overflow-y: auto;
    display: inline-flex;
    flex-direction: column;
  }
  article {
    flex-basis: 0;
    height: 0;
    flex-grow: 1;
    overflow: auto;
  }
  footer {
    height: 2em;
    line-height: 2em;
    background-color: var(--md-ref-palette-primary20);
    color: var(--mdc-theme-on-primary);
    text-align: center;
  }
  @media screen and (min-width: 650px) {
    article {
      padding: 8px;
    }
  }
</style>
