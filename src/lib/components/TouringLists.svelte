<script lang="ts">
  import { DateTime } from 'luxon';
  import type { EntityDate, TouringEntity } from '$lib/models/entity';
  import { goto } from '$app/navigation';
  import { writable } from 'svelte/store';
  import { persistBrowserSession } from '@macfja/svelte-persistent-store';
  import status from 'http-status';

  /** セッションストア */
  let unsaved = persistBrowserSession(writable('UnsavedTouring'), 'unsaved-touring');

  /** ツーリングの一覧 */
  export let tourings: TouringEntity[];

  /**
   * 追加がクリックされたときのアクション
   * `/tourings/new` へ遷移する
   */
  async function add() {
    $unsaved = JSON.stringify({});
    await goto(`/tourings/new`);
  }

  /**
   * 編集がクリックされたときのアクション
   * `/tourings/選択したID` へ遷移する
   * @param id - 編集対象のツーリングID
   */
  async function change(id?: string) {
    $unsaved = JSON.stringify({});
    await goto(`/tourings/${id}`);
  }

  /**
   * 削除がクリックされたときのアクション
   * @param id - 削除対象のツーリングID
   * @param name - 削除対象のツーリング名
   */
  async function remove(id: string | undefined, name: string) {
    if (id === undefined) return;
    if (confirm(`${name}を削除しても良いですか？`) === false) return;
    const response = await fetch(`/api/tourings/${id}`, { method: 'DELETE' });
    if (response.status !== status.OK) return alert('削除に失敗しました');
    tourings = tourings.filter((touring) => touring.id !== id);
  }

  function formatDate(param?: EntityDate) {
    if (param === undefined) return '--';
    const date = param instanceof Date ? param : param.toDate();
    return DateTime.fromJSDate(date)
      .setZone('Asia/Tokyo')
      .toFormat('yyyy/MM/dd（EEEEE）HH:mm', { locale: 'ja' });
  }
</script>

<div class="w-full overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
  <table class="table" aria-label="ツーリング一覧" >
    <thead>
      <tr>
        <th>更新日時</th>
        <th>名前</th>
        <th class="text-right"></th>
      </tr>
    </thead>
    <tbody>
      {#each tourings as touring}
        <tr>
          <td>{formatDate(touring.updatedAt)}</td>
          <td>{touring.name}</td>
          <td class="text-right">
            <button on:click={() => change(touring.id)} aria-label="編集">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button on:click={() => remove(touring.id, touring.name)} aria-label="削除">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </td>
        </tr>
      {/each}
      </tbody>
    </table>
</div>
<div class="p-4">
  <button class="btn btn-primary w-full rounded-[36px]" on:click={add}>
    <span class="material-symbols-outlined">add</span>
    新しいツーリングを追加する
  </button>
</div>
