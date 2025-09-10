<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import type { EditTouringEntity } from '$lib/models/entity';
  import copy from 'copy-to-clipboard';
  import IconButton from '@smui/icon-button';
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
    open = true;
  }
  /** ダイアログの開閉状態 */
  let open = false;
  /** 共有対象のツーリング */
  let shareTarget: EditTouringEntity;
  /** 共有URL */
  let shareUrl: string;

  const copyToClipbord = () => {
    copy(shareUrl);
  };
</script>

{#if open}
  <Dialog
    bind:open
    aria-labelledby="share-modal-title"
    aria-describedby="share-modal-content"
    surface$style="width: 850px"
  >
    <Title id="share-modal-title">共有</Title>
    <Content id="save-modal-content">
      <div>
        <strong>以下のURLをツーリング参加者に共有してください。</strong>
      </div>
      <div class="shareUrl">
        <IconButton class="material-icons" on:click={copyToClipbord}>content_copy</IconButton>
        <a href={shareUrl}>{shareUrl}</a>
      </div>
    </Content>
    <Actions>
      <Button action="cancel">
        <Label>閉じる</Label>
      </Button>
    </Actions>
  </Dialog>
{/if}

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
