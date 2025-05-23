<script lang="ts">
  import { writable } from 'svelte/store';
  import { persistBrowserSession } from '@macfja/svelte-persistent-store';
  import Edit from 'components/Edit.svelte';
  import { beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import { backButton } from '$lib/store/back-button';

  /** セッションストア */
  let unsaved = persistBrowserSession(writable('UnsavedTouring'), 'unsaved-touring');
  /** ルート編集コンポーネント */
  let edit: Edit;

  beforeNavigate(() => {
    $unsaved = JSON.stringify(edit.getTouring());
  });

  onMount(async () => {
    try {
      edit.setTouring(JSON.parse($unsaved));
    } catch (e) {
      // ignore error
    }
  });

  backButton.set(false);
</script>

<Edit bind:this={edit} />
