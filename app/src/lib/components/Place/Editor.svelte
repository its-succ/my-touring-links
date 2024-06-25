<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Slider from '@smui/slider';
  import FormField from '@smui/form-field';
  import Textfield from '@smui/textfield';
  import TextIcon from '@smui/textfield/icon';
  import Checkbox from '@smui/checkbox';
  import SegmentedButton, { Segment, Icon } from '@smui/segmented-button';
  import Wrapper from '@smui/touch-target';
  import { createEventDispatcher } from 'svelte';
  import type { Place } from '$lib/models/place';
  import { filterIcons, type IconElement } from '$lib/models/material-icons';
  import { icons } from '$lib/models/material-icons.json';

  /**
   * 場所の編集を開始する
   * @param target - 対象の場所
   * @param displayNameOnly - 表示名の編集のみ可能なモードかどうか
   */
  export function edit(target: Place, displayNameOnly = false) {
    place = target;
    displayName = place.displayName || '';
    stayingTime = place.stayingTime;
    waypoint = place.waypoint || false;
    searchIcon = place.icon || 'location_on';
    icon = icons.filter((icon) => icon.name === searchIcon)[0];
    displayNameOnlyEdit = displayNameOnly;
    open = true;
  }
  /** ダイアログの開閉状態 */
  let open = false;
  /** 編集対象の場所 */
  let place: Place;
  /** 表示名 */
  let displayName: string;
  /** 表示名のみの編集モード*/
  let displayNameOnlyEdit: boolean;
  /** 滞在時間(分) */
  let stayingTime: number;
  /** 経由地 */
  let waypoint: boolean;
  /** アイコン */
  let searchIcon = '';
  let icon: IconElement | undefined;
  /** フォーム */
  let form: HTMLFormElement;

  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();

  /**
   * フォームを実行する
   */
  function handleSubmit() {
    dispatch('change', {
      id: place.id,
      value: { displayName, stayingTime, waypoint, icon: icon?.name }
    });
    return false;
  }
</script>

{#if open}
  <Dialog
    bind:open
    aria-labelledby="place-editor-title"
    aria-describedby="place-editor-content"
    surface$style="width: 850px"
  >
    <Title id="place-editor-title">場所の編集</Title>
    <Content id="place-editor-content">
      <form bind:this={form} on:submit|preventDefault={handleSubmit}>
        <Textfield
          bind:value={displayName}
          label="表示名"
          variant="outlined"
          required
          helperLine$style="width: 100%;"
          class="form-field"
        >
          <TextIcon class="material-icons" slot="leadingIcon">{icon?.name}</TextIcon>
          <div slot="helper">
            <fieldset>
              <legend>表示名のアイコン</legend>
              <Textfield bind:value={searchIcon} style="width: 100%;" />
              <div class="icons">
                <SegmentedButton
                  segments={filterIcons(icons, searchIcon)}
                  let:segment
                  singleSelect
                  bind:selected={icon}
                  key={(segment) => segment.name}
                >
                  <Wrapper>
                    <Segment {segment} touch title={segment.name}>
                      <Icon class="material-icons" style="width: 1em; height: auto;"
                        >{segment.name}</Icon
                      >
                    </Segment>
                  </Wrapper>
                </SegmentedButton>
              </div>
            </fieldset>
          </div>
        </Textfield>
        {#if !displayNameOnlyEdit}
          <FormField class="form-field">
            <Checkbox bind:checked={waypoint} />
            <span slot="label">経由値</span>
          </FormField>
          <FormField style="display: flex" class="form-field staying-time">
            {#if !waypoint}
              <Slider bind:value={stayingTime} min={0} max={300} step={10} class="slider" />
            {:else}
              <Slider bind:value={stayingTime} disabled class="slider" />
            {/if}
            <p slot="label">
              {#if !waypoint}
                滞在時間({stayingTime}分)
              {:else}
                経由値には滞在時間を設定できません
              {/if}
            </p>
          </FormField>
        {/if}
      </form>
    </Content>
    <Actions>
      <Button action="cancel">
        <Label>キャンセル</Label>
      </Button>
      <Button action="accept" on:click={handleSubmit}>
        <Label>適用</Label>
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
  fieldset {
    padding: 0 1em 1em 1em;
    width: 100%;
    margin-bottom: 1em;
  }
  legend {
    font-size: 0.75rem;
    padding: 0 0.25rem;
  }
  .icons {
    min-height: 1em;
    max-height: 5em;
    overflow-y: scroll;
  }
</style>
