<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Textfield from '@smui/textfield';
  import type { ArrivalTimeJSON } from '$lib/models/touring';
  import type { EditTouringEntity } from '$lib/models/entity';
  import { DateTime } from 'luxon';
  import status from 'http-status';
  import { goto } from '$app/navigation';
  import { createEventDispatcher } from 'svelte';

  /**
   * ツーリングの保存を開始する
   */
  export function save(entity: EditTouringEntity) {
    saveTarget = entity;
    const placeholder = `${DateTime.fromISO(Object.keys(entity.touring)[0]).setZone('Asia/Tokyo').toFormat('MM/dd', { locale: 'ja' })}出発ツーリング`;
    saveTarget.name = entity.name || placeholder;
    formValidity = true;
    open = true;
  }
  /** ダイアログの開閉状態 */
  let open = false;
  /** フォーム */
  let form: HTMLFormElement;
  /** フォームのバリデーション状態 */
  let formValidity: boolean;
  /** 保存対象のツーリング */
  let saveTarget: EditTouringEntity;
  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();

  function validate() {
    formValidity = form.checkValidity();
  }
  /**
   * フォームを実行する
   */
  async function handleSubmit() {
    if (!saveTarget.id) {
      const response = await fetch('/api/tourings', {
        method: 'POST',
        body: JSON.stringify(saveTarget)
      });
      if (response.status !== status.OK) alert('保存に失敗しました');
      const { id } = await response.json();
      dispatch('saved', { id, name: saveTarget.name });
    } else {
      const { createdAt: _createdAt, updatedAt: _updatedAt, ...updates } = saveTarget;
      const response = await fetch(`/api/tourings/${saveTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (response.status !== status.OK) alert('保存に失敗しました');
      dispatch('saved', { id: saveTarget.id, name: saveTarget.name });
    }
    open = false;
  }
</script>

{#if open}
  <Dialog
    bind:open
    aria-labelledby="save-modal-title"
    aria-describedby="save-modal-content"
    surface$style="width: 850px"
  >
    <Title id="save-modal-title">保存</Title>
    <Content id="save-modal-content">
      <form bind:this={form} on:submit|preventDefault={handleSubmit}>
        <Textfield
          bind:value={saveTarget.name}
          label="ツーリング名"
          variant="outlined"
          required
          helperLine$style="width: 100%;"
          class="form-field"
          on:change={validate}
        ></Textfield>
      </form>
    </Content>
    <Actions>
      <Button action="cancel">
        <Label>閉じる</Label>
      </Button>
      <Button action="accept" on:click={handleSubmit} disabled={!formValidity}>
        <Label>保存する</Label>
      </Button>
    </Actions>
  </Dialog>
{/if}

<style>
  form :global(.form-field) {
    margin-top: 1em;
    margin-bottom: 1em;
    width: 100%;
  }
  form :global(.staying-time) {
    display: flex;
  }
  form :global(.staying-time .slider) {
    flex-grow: 1;
    margin-left: 0.5em;
  }
</style>
