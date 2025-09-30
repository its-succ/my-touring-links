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
  <ul class="menu dropdown-content bg-base-100 rounded-box shadow-sm">
    <li>
      <button class="whitespace-nowrap" on:click={() => dispatch('deleteFromRoute', place.id)}>ルートから削除</button>
    </li>
    <li>
      <button class="whitespace-nowrap" on:click={() => dispatch('editPlace', {
            place,
            displayNameOnly: origin === true || destination === true
          })}
          >場所の編集</button>
    </li>
    <li class={hasDirectionsResult === false || origin === true ? 'menu-disabled': 'text-neutral'}>
      <button class="whitespace-nowrap" on:click={() => dispatch('previewRouteTo', place.id)} disabled={hasDirectionsResult === false || origin === true}>1つ前の場所からのルートを確認</button>
    </li>
    {#if isSpot(place)}
      <li >
        <a class="whitespace-nowrap" href={googleMapURI(place)} target="_blank">
          スポットの詳細を見る
          <span class="mdc-typography--caption material-icons">open_in_new</span>
        </a>
      </li>
    {/if}
  </ul>
</div>
