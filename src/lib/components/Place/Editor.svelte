<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { formatLocation, type Place } from '$lib/models/place';
  import { filterIcons, type IconElement } from '$lib/models/material-icons';
  import { icons } from '$lib/models/material-icons.json';

  /**
   * 場所の編集を開始する
   * @param target - 対象の場所
   * @param displayNameOnly - 表示名の編集のみ可能なモードかどうか
   */
  export function edit(target: Place, displayNameOnly = false) {
    place = target;
    displayName = place.displayName || formatLocation(place);
    stayingTime = place.stayingTime;
    waypoint = place.waypoint || false;
    searchIcon = place.icon || 'location_on';
    icon = icons.filter((icon) => icon.name === searchIcon)[0];
    displayNameOnlyEdit = displayNameOnly;
    formValidity = true;
    editorModal.showModal();
  }
  /** ダイアログ */
  let editorModal: HTMLDialogElement;
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
  /** フォームのバリデーション状態 */
  let formValidity: boolean;

  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();

  function validate() {
    formValidity = form.checkValidity();
  }
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

<dialog class="modal"  aria-labelledby="place-editor-title" aria-describedby="place-editor-content" bind:this={editorModal}>
  <h3 id="place-editor-title" class="text-lg font-bold">場所の編集!</h3>
  <div id="place-editor-content" class="modal-box w-[95%] lg:w-[850px] ">
    <form bind:this={form} on:submit|preventDefault={handleSubmit}>
      <fieldset class="fieldset w-full mb-4 pt-0 pb-4 px-4">
        <legend class="fieldset-legend">表示名</legend>
        <label class="input">
          <span class="material-symbols-outlined">{icon?.name}</span>
          <input type="text" required on:change={validate} bind:value={displayName} />
        </label>
      </fieldset>
      <div>
        <fieldset class="fieldset w-full mb-4 pt-0 pb-4 px-4">
          <legend class="fieldset-legend">表示名のアイコン</legend>
          <input class="input w-full" type="search" bind:value={searchIcon}  />
          <div class="min-h-[1rem] max-h-20 overflow-y-scroll">
            <div>
              {#each filterIcons(icons, searchIcon) as segment}
                <button on:click={() => icon = segment}>
                  <span class="material-icons size-[1em] ">{segment.name}</span>
                </button>
              {/each}
            </div>
          </div>
        </fieldset>
      </div>
      {#if !displayNameOnlyEdit}
        <label class="label p-4">
          <input type="checkbox" bind:checked={waypoint} class="checkbox" />
          <span class="fieldset-legend">経由値</span>
        </label>
        <fieldset class="fieldset w-full mb-4 pt-0 pb-4 px-4 flex">
          <legend class="fieldset-legend">滞在時間</legend>
          {#if !waypoint}
            <input type="range" min="0" max="300" step="10" bind:value={stayingTime} class="range range-primary glow ml-2" />
          {:else}
            <input type="range" disabled bind:value={stayingTime} class="range range-primary glow ml-2" />
          {/if}
          <span class="whitespace-nowrap">
            {#if !waypoint}
              ({stayingTime}分)
            {:else}
              経由値には滞在時間を設定できません
            {/if}
          </span>
        </fieldset>
      {/if}
    </form>
    <div class="modal-action">
      <form method="dialog">
        <button type="button" class="btn" on:click={() => editorModal.close()}>キャンセル</button>
        <button type="submit" class="btn btn-primary" on:click={handleSubmit} disabled={!formValidity}>適用</button>
      </form>
    </div>
  </div>
</dialog>
