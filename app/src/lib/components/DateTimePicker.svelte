<script lang="ts">
  import '@siemens/ix/dist/siemens-ix/theme/classic-light.css';
  import { applyPolyfills, defineCustomElements } from '@siemens/ix/loader';
  import { defineCustomElements as ixIconsDefineCustomElements } from '@siemens/ix-icons/loader';
  import type { IxDatetimePicker } from '@siemens/ix/components/ix-datetime-picker';
  import Dialog, { Content } from '@smui/dialog';
  import { DateTime } from 'luxon';
  import { createEventDispatcher } from 'svelte';

  (async () => {
    await applyPolyfills();
    await ixIconsDefineCustomElements();
    await defineCustomElements();
  })();

  /** DateTimePicker の表示状態。true で表示する */
  let isOpen = false;
  /** ix-datetime-picker タグ */
  let picker: IxDatetimePicker;
  let from: string;
  let time: string;

  const dispatch = createEventDispatcher();

  export function open(date:Date) {
    from = DateTime.fromJSDate(date).setZone('Asia/Tokyo').toFormat('yyyy-MM-dd');
    time = DateTime.fromJSDate(date).setZone('Asia/Tokyo').toFormat('HH:mm');
    isOpen = true;
  }

  function selected(e: CustomEvent<{ from?: string, time?: string}>) {
    const date = new Date(`${e.detail!.from || picker.from}T${e.detail!.time || picker.time}+09:00`);
    dispatch('selected', date);
    isOpen = false;
  }
</script>

<style>
  ix-datetime-picker {
    --theme-z-index-dropdown: 1000;
  }
</style>

<Dialog
  bind:open={isOpen}
  noContentPadding
  sheet
  aria-describedby="sheet-no-padding-content"
>
  <Content id="sheet-no-padding-content">
    {#if isOpen}
      <ix-datetime-picker
        class="theme-classic-light"
        range="false"
        show-hour="true"
        show-minutes="true"
        text-select-date="変更"
        date-format="yyyy-MM-dd"
        time-format="HH:mm"
        from={from}
        time={time}
        bind:this={picker}
        on:dateSelect={selected}></ix-datetime-picker>
    {/if}
  </Content>
</Dialog>
