<script lang="ts">
  import type { EditTouringEntity } from '$lib/models/entity';
  import copy from 'copy-to-clipboard';
  import type { ArrivalTimeJSON } from '$lib/models/touring';
  import status from 'http-status';

  /**
   * ツーリングの共有
   */
  export async function share(id: string, entity: ArrivalTimeJSON) {
    const response = await fetch(`/api/tourings/${id}/share`, {
      method: 'PUT',
      body: JSON.stringify(entity)
    });
    if (response.status !== status.OK) alert('共有に失敗しました');

    const sharedTouring = await response.json();
    shareUrl = `${location.origin}/shared/tourings/${sharedTouring.id}`;
    shareModal.showModal();
  }
  /** ダイアログ */
  let shareModal: HTMLDialogElement;
  /** 共有対象のツーリング */
  let shareTarget: EditTouringEntity;
  /** 共有URL */
  let shareUrl: string;

  const copyToClipbord = () => {
    copy(shareUrl);
  };
</script>

<dialog class="modal"  aria-labelledby="share-modal-title" aria-describedby="share-modal-content" bind:this={shareModal}>
  <h3 id="save-modal-title" class="text-lg font-bold">共有!</h3>
  <div id="share-modal-content" class="modal-box w-[850px]">
    <div>
      <strong>以下のURLをツーリング参加者に共有してください。</strong>
    </div>
    <div class="shareUrl">
      <button  on:click={copyToClipbord}>
        <span class="material-symbols-outlined">content_copy</span>
      </button>
      <a href={shareUrl}>{shareUrl}</a>
    </div>
    <div class="modal-action">
      <form method="dialog">
        <button type="button" class="btn" on:click={() => shareModal.close()}>閉じる</button>
      </form>
    </div>
  </div>
</dialog>

<style>
  .shareUrl {
    margin: 1rem;
    padding: 20px;
    box-shadow: 2px 2px 8px gray;
  }

  .shareUrl * {
    display: inline-block;
  }
</style>
