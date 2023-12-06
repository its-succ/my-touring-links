<script lang="ts">
  import type { Snapshot } from './$types';
  import Edit from 'components/Edit.svelte';

  /** ルート編集コンポーネント */
  let edit: Edit;

  /**
   * ページのSnapshotをSessionStorageに保持する
   */
  export const snapshot: Snapshot<string> = {
    capture: () => JSON.stringify(edit.getRoutes().toJSON()),
    restore: (value) => edit.setRoutes(JSON.parse(value))
  };
</script>

<article>
  <header>
    <h3>Welcome to My Touring Links</h3>
  </header>
  <main>
    <Edit bind:this={edit} />
  </main>
  <footer>@copy-right: ESM</footer>
</article>

<style>
  :global(html, body) {
    height: 100vh;
    margin: 0;
  }
  article {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  header {
    height: 6em;
  }
  main {
    flex-grow: 1;
    overflow-y: auto;
  }
  footer {
    height: 2em;
  }
</style>
