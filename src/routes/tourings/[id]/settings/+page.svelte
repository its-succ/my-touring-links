<script lang="ts">
  import { writable } from 'svelte/store';
  import { persistBrowserSession } from '@macfja/svelte-persistent-store';
  import { afterNavigate, beforeNavigate, goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import TouringSettings from 'components/TouringSettings.svelte';
  import { backButton } from '$lib/store/back-button';

  /** セッションストア */
  let unsaved = persistBrowserSession(writable('UnsavedTouring'), 'unsaved-touring');
  /** ツーリング設定コンポーネント */
  let settings: TouringSettings;

  let left = false;
  beforeNavigate(async ({ to, cancel }) => {
    if (!left) {
      cancel();
      const touring = await settings.getTouring();
      $unsaved = JSON.stringify(touring);
      left = true;
      goto(to!.url);
    }
  });

  afterNavigate(async () => {
    try {
      await settings.setTouring(JSON.parse($unsaved));
    } catch (e) {
      // ignore error
    }
  });

  backButton.set(true);
</script>

<TouringSettings bind:this={settings} />
