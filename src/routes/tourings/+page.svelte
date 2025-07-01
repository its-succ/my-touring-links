<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import TouringLists from 'components/TouringLists.svelte';
  import type { TouringEntity } from '$lib/models/entity';

  let tourings: TouringEntity[] = [];

  onMount(async () => {
    tourings = $page.data.tourings;
  });
</script>

<TouringLists {tourings} />
