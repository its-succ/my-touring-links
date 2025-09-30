<script lang="ts">
  import "../app.css"
  import AppHeader from 'components/AppHeader.svelte';
  import { onMount } from 'svelte';
  import { userStore } from '$lib/models/user';
  import { page } from '$app/stores';

  onMount(async () => {
    const user = $page.data.session?.user;
    const loggedIn = !!user;
    userStore.update((cur) => ({ ...cur, user, loggedIn }));
  });
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
</svelte:head>

<AppHeader />
<main class="bg-base-200">
  <article>
    <slot />
  </article>
</main>
<footer class="footer sm:footer-horizontal footer-center bg-base-300 text-base-content px-4 py-1"><aside><p>@ESM.Inc ITS SUCC Community</p></aside></footer>

<style lang="postcss">
  @reference "tailwindcss";

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
  @media screen and (min-width: 650px) {
    article {
      padding: 8px;
    }
  }
</style>
