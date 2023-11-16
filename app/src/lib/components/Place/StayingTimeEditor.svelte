<script lang="ts">
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import Button, { Label } from '@smui/button';
  import Slider from '@smui/slider';
  import FormField from '@smui/form-field';
  import { createEventDispatcher } from 'svelte';

  /** ダイアログの開閉状態 */
  export let open = false;
  /** 滞在時間(分) */
  export let value: number;

  /** イベントディスパッチャー */
  let dispatch = createEventDispatcher();
</script>

<Dialog
  bind:open
  aria-labelledby="滞在時間の変更"
  aria-describedby="滞在時間(分)"
>
  <Title id="滞在時間の変更">滞在時間の変更</Title>
  <Content id="滞在時間(分)">
    <div>
      <FormField style="display: flex; flex-direction: column-reverse;">
        <Slider bind:value min={0} max={300} step={10} input$aria-label="滞在時間(分)" style="width: 100%;" />
        <span slot="label">滞在時間({value}分)</span>
      </FormField>
    </div>
  </Content>
  <Actions>
    <Button action="accept" on:click={() => dispatch('change', value)}>
      <Label>変更</Label>
    </Button>
  </Actions>
</Dialog>
