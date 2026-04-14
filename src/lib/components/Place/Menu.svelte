<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { type Place, isSpot, googleMapURI } from '$lib/models/place';

  /** Place ID */
  export let place: Place;
  /** ルート計算されているかどうか */
  export let hasDirectionsResult: boolean;
  /** 出発地かどうか */
  export let origin: boolean;
  /** 最終目的地かどうか */
  export let destination: boolean;

  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();
</script>

<div class="dropdown dropdown-end">
  <button class="material-icons">more_vert</button>
  <ul class="menu dropdown-content bg-neutral rounded-box shadow-sm">
    <li class="text-neutral-content">
      <button class="whitespace-nowrap text-neutral-content" on:click={() => dispatch('deleteFromRoute', place.id)}>ルートから削除</button>
    </li>
    <li class="text-neutral-content">
      <button class="whitespace-nowrap" on:click={() => dispatch('editPlace', {
            place,
            displayNameOnly: origin === true || destination === true
          })}
          >場所の編集</button>
    </li>
    <li class={hasDirectionsResult === false || origin === true ? 'text-neutral-500': 'text-neutral-content'}>
      <button class="whitespace-nowrap" on:click={() => dispatch('previewRouteTo', place.id)} disabled={hasDirectionsResult === false || origin === true}>1つ前の場所からのルートを確認</button>
    </li>
    {#if isSpot(place)}
    <li class="text-neutral-content">
        <a class="whitespace-nowrap" href={googleMapURI(place)} target="_blank">
          スポットの詳細を見る
          <span class="text-xs leading-5 font-normal material-icons">open_in_new</span>
        </a>
      </li>
    {/if}
  </ul>
</div>
