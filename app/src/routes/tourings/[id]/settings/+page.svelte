<script lang="ts">
  import { writable } from 'svelte/store';
  import { persistBrowserSession } from '@macfja/svelte-persistent-store';
  import { beforeNavigate } from '$app/navigation';
  import { onMount } from 'svelte';
  import TouringSettings from 'components/TouringSettings.svelte';
  import { backButton } from '$lib/store/back-button';

  /** セッションストア */
  let unsaved = persistBrowserSession(writable('UnsavedTouring'), 'unsaved-touring');
  /** ツーリング設定コンポーネント */
  let settings: TouringSettings;

  beforeNavigate(() => {
    $unsaved = JSON.stringify(settings.getTouring());
  });

  onMount(async () => {
    try {
      settings.setTouring(JSON.parse($unsaved));
    } catch (e) {
      // ignore error
    }
  });

  backButton.set(true);
</script>

<TouringSettings bind:this={settings} />
