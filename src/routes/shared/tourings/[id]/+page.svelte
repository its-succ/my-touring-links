<script lang="ts">
  import { page } from '$app/stores';
  import type { SharedTouringEntity } from '$lib/models/entity';
  import Select, { Option } from '@smui/select';
  import { DateTime } from 'luxon';
  import SharedRouteElement from '$lib/components/SharedRoute.svelte';

  let touring: SharedTouringEntity = $page.data.touring;
  let departureTimes = Object.keys(touring.touring);
  let updatedAt = touring.updatedAt as Date;

  const today = DateTime.now().setZone('Asia/Tokyo').toFormat('yyyyMMdd');
  let selectedDepartureDateTime =
    departureTimes.find((iso) => {
      const dt = DateTime.fromISO(iso).setZone('Asia/Tokyo').toFormat('yyyyMMdd');
      return Number(dt) >= Number(today);
    }) ?? departureTimes.slice(0, -1)[0];
</script>

<div class="contents">
  <h2 class="mdc-typography--headline5">{touring.name}</h2>
  <p class="mdc-typography--body2 text-right">
    @{touring.sharedBy} が {DateTime.fromJSDate(updatedAt)
      .setZone('Asia/Tokyo')
      .toFormat('MM/dd（EEEEE）HH:mm', { locale: 'ja' })} に共有
  </p>

  <Select bind:value={selectedDepartureDateTime} label="出発日時">
    {#each departureTimes as departureTime}
      <Option value={departureTime}
        >{DateTime.fromISO(departureTime)
          .setZone('Asia/Tokyo')
          .toFormat('MM/dd（EEEEE）HH:mm', { locale: 'ja' })}</Option
      >
    {/each}
  </Select>

  <SharedRouteElement places={touring.touring[selectedDepartureDateTime].places}
  ></SharedRouteElement>

  <p class="mdc-typography--body2 text-right">
    ルート計算日時: {DateTime.fromISO(touring.touring[selectedDepartureDateTime].calcedAt)
      .setZone('Asia/Tokyo')
      .toFormat('MM/dd（EEEEE）HH:mm', { locale: 'ja' })}
  </p>
</div>

<style>
  .contents {
    padding: 1em;
    display: flex;
    flex-direction: column;
    gap: 1em;
  }
  .text-right {
    text-align: right;
  }
</style>
