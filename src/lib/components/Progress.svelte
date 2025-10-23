<script lang="ts">
  import anime from '$lib/assets/car.gif';
  import animeDark from '$lib/assets/car-dark.gif';
  import { isDarkMode } from '$lib/utils/theme';

  let src: string;
  let progress: HTMLDialogElement;

  export function show() {
    progress.showModal();
  }
   export function close() {
    progress.close();
  }

  $: src = isDarkMode() ? animeDark : anime;
</script>

<dialog class="modal" aria-describedby="mandatory-content" bind:this={progress}>
  <div class="modal-box">
    <img alt="running...." {src} width="250px" />
  </div>
</dialog>
