<script lang="ts">
  import Dialog, { Content } from '@smui/dialog';
  import anime from '$lib/assets/car.gif';
  import animeDark from '$lib/assets/car-dark.gif';
  import { isDarkMode } from '$lib/utils/theme';

  export let open: boolean = false;
  let src: string;

  $: src = open === true && isDarkMode() ? animeDark : anime;
</script>

<Dialog bind:open scrimClickAction="" escapeKeyAction="" aria-describedby="mandatory-content">
  <Content id="mandatory-content" tabindex="0">
    <img alt="running...." {src} width="250px" />
  </Content>
</Dialog>
