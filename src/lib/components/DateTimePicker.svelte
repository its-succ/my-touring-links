<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import SveltyPicker from 'svelty-picker';

  /** DateTimePicker  */
  let dateTimePicker: HTMLDialogElement;
  /** 初期表示日時 */
  let initialDate: Date;
  /** DateTimePiker のローカライズ */
  const jp = {
    days: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
    daysShort: ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'],
    daysMin: ['日', '月', '火', '水', '木', '金', '土', '日'],
    months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthsShort: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月'
    ],
    meridiem: ['am', 'pm'],
    suffix: ['', '', '', ''],
    todayBtn: '今日',
    clearBtn: 'クリア',
    okBtn: 'OK',
    cancelBtn: 'Cancel',
    timeView: '時刻を選択',
    backToDate: 'カレンダーに戻る'
  };

  /**
   * DateTimePickerを開く
   * @param date - 選択する日時
   */
  export function open(date: Date) {
    initialDate = date;
    dateTimePicker.showModal();
  }

  /** イベントディスパッチャー */
  const dispatch = createEventDispatcher();

  /**
   * OKボタンが押された時の処理。
   * ダイアログを閉じて `selected` イベントを送信する
   * @param e - OKボタンイベント
   */
  function selected(e: CustomEvent) {
    dateTimePicker.close();
    dispatch('selected', new Date(e.detail));
  }

  /**
   * Cancel ボタンが押された時の処理
   * ダイアログを閉じる
   */
  function cancel() {
    dateTimePicker.close();
  }
</script>

<dialog id="datetime-picker" class="modal" aria-describedby="sheet-no-padding-content" bind:this={dateTimePicker}>
  <div class="modal-box w-auto">
    <SveltyPicker
      autocommit={false}
      pickerOnly={true}
      mode="datetime"
      format="yyyy-mm-dd hh:ii"
      todayBtn={false}
      clearBtn={false}
      i18n={jp}
      {initialDate}
      on:change={selected}
      on:cancel={cancel}
    />
  </div>
</dialog>

<style>
  :root {
    /* general */
    --sdt-bg-main: var(--color-base-200);
    --sdt-shadow-color: transparent;
    --sdt-color: var(--color-base-content);
    --sdt-color-selected: var(--color-primary-content);
    --sdt-header-color: var(--color-neutral);
    --sdt-btn-header-bg-hover: #dfdfdf; /** header items hover background color */
    --sdt-bg-selected: var(--color-primary);

    /* action buttons */
    --sdt-today-bg: var(--color-primary);
    --sdt-today-color: var(--color-primary-content);
    --sdt-clear-color: var(--color-primary);
    --sdt-clear-bg: transparent;
    --sdt-clear-hover-color: var(--color-primary);
    --sdt-clear-hover-bg: transparent;

    /* time picker */
    --sdt-clock-selected-bg: var(--color-primary); /** selected time background color */
    --sdt-clock-bg: var(--color-base-100); /** time picker inner circle background color */
    --sdt-clock-color: var(
      --color-base-content
    ); /** time picker text color (watch "--sdt-color") */
    --sdt-clock-color-hover: var(
      --sdt-color
    ); /** time picker hover text color (watch "--sdt-color") */
    --sdt-clock-time-bg: transparent; /** time picker time background color */
    --sdt-clock-time-bg-hover: transparent; /** time picker time selection hover background color */
    --sdt-clock-disabled-time: #b22222; /** disabled time picker time text color */
    --sdt-clock-disabled-time-bg: #eee; /** disabled time picker time background color */

    /* date picker */
    --sdt-table-selected-bg: var(--sdt-bg-selected); /** selected date background color */
    --sdt-table-disabled-date: #b22222; /** disabled dates text color */
    --sdt-table-disabled-date-bg: #eee; /** disabled dates background color */
    --sdt-table-bg: transparent; /** date picker inner table background color */
    --sdt-table-data-bg-hover: #eee; /** table selection data hover background color */
    --sdt-table-today-indicator: #ccc; /** date picker current day marker color */
  }
</style>
