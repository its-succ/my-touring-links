<script lang="ts">
  import Dialog, { Content } from '@smui/dialog';
  import anime from '$lib/assets/car.gif';

  export let open: boolean = false;
</script>

<Dialog
  bind:open
  scrimClickAction=""
  escapeKeyAction=""
  aria-describedby="mandatory-content"
>
  <Content id="mandatory-content">
    <img alt="running...." src={anime} width="250px" />
  </Content>
</Dialog>
