<script lang="ts">
  import IconButton from '@smui/icon-button';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import { DateTime } from 'luxon';
  import Button, { Icon, Label } from '@smui/button';
  import type { TouringEntity } from '$lib/models/entity';
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
</script>

<div class="list">
  <DataTable table$aria-label="ツーリング一覧" style="width: 100%;">
    <Head>
      <Row>
        <Cell>出発日時</Cell>
        <Cell>名前</Cell>
        <Cell class="operation"></Cell>
      </Row>
    </Head>
    <Body>
      {#each tourings as touring}
        <Row>
          <Cell
            >{DateTime.fromISO(Object.keys(touring.touring)[0])
              .setZone('Asia/Tokyo')
              .toFormat('yyyy/MM/dd（EEEEE）HH:mm', { locale: 'ja' })}</Cell
          >
          <Cell>{touring.name}</Cell>
          <Cell class="operation">
            <IconButton
              class="material-icons"
              on:click={() => change(touring.id)}
              aria-label="編集"
              size="mini">edit</IconButton
            >
            <IconButton
              class="material-icons"
              on:click={() => remove(touring.id, touring.name)}
              aria-label="削除"
              size="mini">delete</IconButton
            >
          </Cell>
        </Row>
      {/each}
    </Body>
  </DataTable>
</div>
<div class="buttons">
  <Button variant="unelevated" color="primary" class="button-shaped-round button" on:click={add}>
    <Icon class="material-icons">add</Icon>
    <Label>新しいツーリングを追加する</Label>
  </Button>
</div>

<style>
  .buttons {
    padding: 1rem;
  }
  .buttons :global(.button) {
    width: 100%;
  }
  .buttons :global(.button-shaped-round) {
    border-radius: 36px;
  }
  .list :global(.operation) {
    text-align: right;
  }
</style>
