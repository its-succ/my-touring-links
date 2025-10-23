<script lang="ts">
  import type { EditTouringEntity } from '$lib/models/entity';
  import { DateTime } from 'luxon';
  import status from 'http-status';
  import { createEventDispatcher } from 'svelte';

  /**
   * ツーリングの保存を開始する
   */
  export function save(entity: EditTouringEntity) {
    saveTarget = entity;
    const placeholder = `${DateTime.fromISO(Object.keys(entity.touring)[0]).setZone('Asia/Tokyo').toFormat('MM/dd', { locale: 'ja' })}出発ツーリング`;
    touringName = entity.name || placeholder;
    formValidity = true;
    saveModal.showModal();
  }
  /** ダイアログ */
  let saveModal: HTMLDialogElement;
  /** フォーム */
  let form: HTMLFormElement;
  /** ツーリング名 */
  let touringName: string;
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
    saveTarget.name = touringName;
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
    saveModal.close();
  }
</script>

<dialog class="modal" aria-labelledby="save-modal-title"  aria-describedby="save-modal-content" bind:this={saveModal}>
  <h3 id="save-modal-title" class="text-lg font-bold">保存!</h3>
  <div id="save-modal-content" class="modal-box w-[850px]">
    <form bind:this={form} on:submit|preventDefault={handleSubmit}>
      <fieldset class="fieldset w-full form-field">
        <legend class="fieldset-legend">ツーリング名</legend>
        <input type="text" class="input" on:change={validate} bind:value={touringName} />
      </fieldset>
    </form>
    <div class="modal-action">
      <form method="dialog">
        <button type="button" class="btn" on:click={() => saveModal.close()}>閉じる</button>
        <button type="submit" class="btn" on:click={handleSubmit} disabled={!formValidity}>保存する</button>
      </form>
    </div>
  </div>
</dialog>

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
