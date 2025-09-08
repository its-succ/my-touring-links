<script lang="ts">
  import { page } from '$app/stores';
  import TouringLists from 'components/TouringLists.svelte';
  import type { TouringEntity } from '$lib/models/entity';
  import { afterNavigate } from '$app/navigation';

  let tourings: TouringEntity[] = [];

  afterNavigate(async () => {
    tourings = $page.data.tourings;
  });
</script>

<TouringLists {tourings} />
