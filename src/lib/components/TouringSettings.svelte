<script lang="ts">
  import DateTimePicker from './DateTimePicker.svelte';
  import { Touring } from '$lib/models/touring';
  import { DateTime } from 'luxon';
  import type { EditTouringEntity } from '$lib/models/entity';

  /** DateTimePicker タグ */
  let dateTimePicker: DateTimePicker;
  /** 新規タブ追加中の場合はコールバックが設定される */
  let addTabCallback: ((_date: Date) => void) | undefined;
  /** 出発日時別ルート */
  let touring = new Touring();
  /** 編集中のエンティティ */
  let entity: EditTouringEntity = {
    name: '',
    touring: {}
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
  export async function getTouring(): Promise<EditTouringEntity> {
    const serialized = await touring.serialize();
    return { ...entity, touring: serialized };
  }

  /**
   * 編集対象のツーリングを設定する。
   * ページリロード時など、セッションから復帰するときに呼び出される
   * 復帰オブジェクトが空の場合は何もしない
   * @param touring - 編集するツーリングエンティティ
   */
  export async function setTouring(value: EditTouringEntity) {
    if (Object.keys(value.touring).length === 0 && value.touring.constructor === Object) return;
    await touring.deserialize(value.touring);
    entity = {
      ...value
    };
    departureDateTimes = touring.getDepartureDateTimes();
  }
</script>

<div class="w-full overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
  <table class="table" aria-label="ツーリング出発日時の設定" >
    <thead>
      <tr>
        <th>出発日時</th>
        <th class="text-right"></th>
      </tr>
    </thead>
    <tbody>
      {#each departureDateTimes as departureDateTime, index}
        <tr>
          <td
            >{DateTime.fromJSDate(departureDateTime)
              .setZone('Asia/Tokyo')
              .toFormat('yyyy/MM/dd（EEEEE）HH:mm', { locale: 'ja' })}</td
          >
          <td class="text-right">
            <button on:click={() => change(index)} aria-label="編集">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button on:click={() => remove(index)} aria-label="削除" disabled={departureDateTimes.length === 1}>
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
    出発日時を追加する
  </button>
</div>

<DateTimePicker bind:this={dateTimePicker} on:selected={changedDepartureDateTime}></DateTimePicker>
