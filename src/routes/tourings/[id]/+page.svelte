<script lang="ts">
  import { writable } from 'svelte/store';
  import { persistBrowserSession } from '@macfja/svelte-persistent-store';
  import Edit from 'components/Edit.svelte';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { backButton } from '$lib/store/back-button';
  import { page } from '$app/stores';

  /** セッションストア */
  let unsaved = persistBrowserSession(writable('UnsavedTouring'), 'unsaved-touring');
  /** ルート編集コンポーネント */
  let edit: Edit;

  let left = false;
  beforeNavigate(async ({ to, cancel }) => {
    if (!left) {
      cancel();
      const touring = await edit.getTouring();
      $unsaved = JSON.stringify(touring);
      left = true;
      goto(to!.url);
    }
  });

  afterNavigate(async () => {
    try {
      const session = JSON.parse($unsaved);
      if ($page.data.touring === undefined) {
        await edit.setTouring(session);
      } else {
        if (Object.keys(session).length === 0) {
          await edit.setTouring($page.data.touring);
        } else {
          await edit.setTouring(session);
        }
      }
    } catch (e) {
      // ignore error
    }
  });

  backButton.set(false);
</script>

<Edit bind:this={edit} />
