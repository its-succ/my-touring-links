<script lang="ts">
  import DateTimePicker from './DateTimePicker.svelte';
  import { Touring, type EditTouringEntity } from '$lib/models/touring';
  import type { Route } from '$lib/models/route';
  import IconButton from '@smui/icon-button';
  import DataTable, { Head, Body, Row, Cell } from '@smui/data-table';
  import { DateTime } from 'luxon';
  import Button, { Icon, Label } from '@smui/button';

  /** DateTimePicker タグ */
  let dateTimePicker: DateTimePicker;
  /** 新規タブ追加中の場合はコールバックが設定される */
  let addTabCallback: ((date: Date) => void) | undefined;
  /** 出発日時別ルート */
  let touring = new Touring();
  /** 編集中のエンティティ */
  let entity: EditTouringEntity = {
    name: '',
    touring: touring.toJSON(),
  };
  /** 出発日時の一覧 */
  let departureDateTimes: Date[] = [];
  /** 変更中のインデックス */
  let updateIndex: number;

  /**
   * 出発日時を変更がクリックされたときのアクション
   * DateTimePicker を表示する
   * @param index - 編集対象の出発日時一覧のインデックス
   */
  function change(index: number) {
    updateIndex = index;
    dateTimePicker.open(departureDateTimes[index]);
  }

  /**
   * タブを閉じるがクリックされたときのアクション
   * - アクティブタブを切り替える（通常は1つ手間だが、先頭の場合はそのまま）
   * - ルート一覧から出発日時を削除する
   * - 出発日時一覧を更新する
   * @param index - 編集対象の出発日時一覧のインデックス
   */
  function remove(index: number) {
    touring.removeDepartureDateTimeFromTouring(departureDateTimes[index]);
    departureDateTimes = touring.getDepartureDateTimes();
  }

  /**
   * 出発日時が変更された後に呼び出される
   *
   * ### 新規追加のとき
   *
   * - コールバックを呼び出す
   *
   * ### 日時変更のとき
   *
   * - ルートの出発日を変更する
   * - 出発日時一覧を更新する
   */
  function changedDepartureDateTime(e: CustomEvent) {
    if (addTabCallback) {
      addTabCallback(e.detail);
    } else {
      touring.changeDepartureDateTimeToTouring(departureDateTimes[updateIndex], e.detail);
      departureDateTimes = touring.getDepartureDateTimes();
    }
  }

  /**
   * 新規日時追加がクリックされたときのアクション
   * DateTimePicker を現在日時で開いて、設定後に呼び出されるコールバック関数を設定する
   *
   * ### コールバック
   *
   * - 出発日時一覧に追加する
   * - コールバックの無効化
   */
  function add() {
    dateTimePicker.open(new Date());
    addTabCallback = (date: Date) => {
      touring.addDepartureDateTimeToTouring(date);
      departureDateTimes = touring.getDepartureDateTimes();
      addTabCallback = undefined;
    };
  }

  /**
   * 編集中のツーリングを取得する
   * @returns 編集中のツーリングオブジェクト
   */
  export function getTouring(): EditTouringEntity {
    return { ...entity, touring: touring.toJSON() };
  }

  /**
   * 編集対象のツーリングを設定する。
   * ページリロード時など、セッションから復帰するときに呼び出される
   * 復帰オブジェクトが空の場合は何もしない
   * @param touring - 編集するツーリングエンティティ
   */
  export function setTouring(value: EditTouringEntity) {
    if (Object.keys(value.touring).length === 0 && value.touring.constructor === Object) return;
    entity = value;
    touring.fromJSON(value.touring);
    departureDateTimes = touring.getDepartureDateTimes();
  }
</script>

<div class="departureDateTimes">
  <DataTable table$aria-label="ツーリング出発日時の設定" style="width: 100%;">
    <Head>
      <Row>
        <Cell>出発日時</Cell>
        <Cell class="operation"></Cell>
      </Row>
    </Head>
    <Body>
      {#each departureDateTimes as departureDateTime, index}
        <Row>
          <Cell>{DateTime.fromJSDate(departureDateTime)
            .setZone('Asia/Tokyo')
            .toFormat('yyyy/MM/dd（EEEEE）HH:mm', { locale: 'ja' })}</Cell>
          <Cell class="operation">
            <IconButton  class="material-icons" on:click={() => change(index)} aria-label="編集" size="mini">edit</IconButton>
            <IconButton  class="material-icons" on:click={() => remove(index)} aria-label="削除" size="mini" disabled={departureDateTimes.length === 1}>delete</IconButton>
          </Cell>
        </Row>
      {/each}
    </Body>
  </DataTable>
</div>
<div class="buttons">
  <Button
    variant="unelevated"
    color="primary"
    class="button-shaped-round button"
    on:click={add}
    >
    <Icon class="material-icons">add</Icon>
    <Label>出発日時を追加する</Label>
  </Button>
</div>

<DateTimePicker bind:this={dateTimePicker} on:selected={changedDepartureDateTime}></DateTimePicker>

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
  .departureDateTimes :global(.operation) {
    text-align: right;
  }
</style>
