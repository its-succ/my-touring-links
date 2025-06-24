<script lang="ts">
  import { writable } from 'svelte/store';
  import { persistBrowserSession } from '@macfja/svelte-persistent-store';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import type { TouringEntity } from '$lib/models/entity';

  /** セッションストア */
  const unsaved = persistBrowserSession(writable('UnsavedTouring'), 'unsaved-touring');

  onMount(async () => {
    let touringEntity: TouringEntity | undefined;
    let id = 'new';
    try {
      touringEntity = JSON.parse($unsaved);
      if (touringEntity?.id) id = touringEntity.id;
    } catch (e) {
      // ignore error
    }
    await goto(`/tourings/${id}`, { replaceState: true });
  });
</script>
