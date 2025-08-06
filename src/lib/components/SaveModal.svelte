<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import FormField from '@smui/form-field';
  import Textfield from '@smui/textfield';
  import List, { Item, Graphic, Text } from '@smui/list';
  import Checkbox from '@smui/checkbox';
  import type { ArrivalTimeJSON } from '$lib/models/touring';
  import type { EditTouringEntity } from '$lib/models/entity';
  import { DateTime } from 'luxon';
  import status from 'http-status';

  /**
   * ツーリングの保存を開始する
   */
  export function save(entity: EditTouringEntity, arrivalTime: ArrivalTimeJSON) {
    saveTarget = entity;
    const placeholder = `${DateTime.fromISO(Object.keys(entity.touring)[0]).setZone('Asia/Tokyo').toFormat('MM/dd', { locale: 'ja' })}出発ツーリング`;
    saveTarget.name = entity.name || placeholder;
    calcedDepartureDateTime = Object.keys(arrivalTime);
    shareable =
      JSON.stringify(calcedDepartureDateTime.sort()) ===
      JSON.stringify(Object.keys(saveTarget.touring).sort());
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
  /** 出発日時ごとの計算結果 */
  let calcedDepartureDateTime: string[];
  /** 共有できるかどうか */
  let shareable: boolean;

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
    } else {
      const { createdAt: _createdAt, updatedAt: _updatedAt, ...updates } = saveTarget;
      const response = await fetch(`/api/tourings/${saveTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      if (response.status !== status.OK) alert('保存に失敗しました');
    }
    if (saveTarget.publish && shareable) {

    }
  }
</script>

{#if open}
  <Dialog
    bind:open
    aria-labelledby="save-modal-title"
    aria-describedby="save-modal-content"
    surface$style="width: 850px"
  >
    <Title id="save-modal-title">保存と共有</Title>
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
        <fieldset>
          <legend>ツーリング計画の共有</legend>
          <FormField class="form-field">
            <Checkbox bind:checked={saveTarget.publish} disabled={!shareable} />
            <span slot="label"
              >{shareable ? '共有する' : 'ルート計算されていない日があるので共有できません'}</span
            >
          </FormField>
          <List class="calced-statuses" dense>
            {#each Object.keys(saveTarget.touring) as departureDateTime}
              <Item>
                <Graphic class="material-icons"
                  >{calcedDepartureDateTime.includes(departureDateTime)
                    ? 'directions'
                    : 'directions_off'}</Graphic
                >
                <Text
                  >{DateTime.fromISO(departureDateTime)
          .setZone('Asia/Tokyo')
          .toFormat('MM/dd（EEEEE）HH:mm', { locale: 'ja' }) + ':' + (calcedDepartureDateTime.includes(departureDateTime)
                    ? 'ルート計算済'
                    : 'ルート未計算')}</Text
                >
              </Item>
            {/each}
          </List>
        </fieldset>
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
