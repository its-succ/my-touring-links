<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Dialog, { Content } from '@smui/dialog';
  import SveltyPicker from 'svelty-picker';

  /** DateTimePicker の表示状態。true で表示する */
  let isOpen = false;
  /** 初期表示日時 */
  let initialDate: Date;
  /** DateTimePiker のローカライズ */
  let jp = {
    days:        ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
    daysShort:   ['日曜', '月曜', '火曜', '水曜', '木曜', '金曜', '土曜', '日曜'],
    daysMin:     ['日', '月', '火', '水', '木', '金', '土', '日'],
    months:      ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    meridiem:    ['am', 'pm'],
    suffix:      ['', '', '', ''],
    todayBtn:    '今日',
    clearBtn:    'クリア',
    okBtn:       'OK',
    cancelBtn:   'Cancel',
    timeView:    '時刻を選択',
    backToDate:  'カレンダーに戻る'
  }

  /**
   * DateTimePickerを開く
   * @param date - 選択する日時
   */
  export function open(date:Date) {
    initialDate = date;
    isOpen = true;
  }

  /** イベントディスパッチャー */
  const dispatch = createEventDispatcher();

  /**
   * OKボタンが押された時の処理。
   * ダイアログを閉じて `selected` イベントを送信する
   * @param e - OKボタンイベント
   */
  function selected(e: CustomEvent) {
    isOpen = false;
    dispatch('selected', new Date(e.detail));
  }

  /**
   * Cancel ボタンが押された時の処理
   * ダイアログを閉じる
   */
  function cancel() {
    isOpen = false;
  }
</script>

<Dialog
  bind:open={isOpen}
  noContentPadding
  sheet
  aria-describedby="sheet-no-padding-content"
>
  <Content id="sheet-no-padding-content">
    {#if isOpen}
    <SveltyPicker autocommit={false} pickerOnly={true} mode="datetime" format="yyyy-mm-dd hh:ii" todayBtn={false} clearBtn={false}  i18n={jp} {initialDate} on:change={selected} on:cancel={cancel}  />
    {/if}
  </Content>
</Dialog>
