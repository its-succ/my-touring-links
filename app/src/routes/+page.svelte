<script lang="ts">
  import { writable } from 'svelte/store';
  import { persistBrowserSession } from '@macfja/svelte-persistent-store'
  import Edit from 'components/Edit.svelte';
  import { beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';

  /** セッションストア */
  let unsaved = persistBrowserSession(writable('UnsavedRoute'), 'unsaved-route');
  /** ルート編集コンポーネント */
  let edit: Edit;

  beforeNavigate(() => {
    $unsaved = JSON.stringify(edit.getRoutes().toJSON());
  });

  onMount(async () => {
    edit.setRoutes(JSON.parse($unsaved));
  });
</script>

<Edit bind:this={edit} />
