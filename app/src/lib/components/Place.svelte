<script lang="ts">
  import IconButton from '@smui/icon-button';

  /** Place ID */
  export let placeId: string | undefined;
  /** ソートハンドルアイコンが押されているかどうか */
  export let pressed: boolean;
</script>

<style>
  gmpx-place-data-provider {
    display: grid;
    grid-template:
      "img name meta" auto
      "img address meta" auto
      /50px 1fr
    ;
    gap: 0 10px;
    padding: 5px;
    border-radius: 4px;
    background-color: #f0f1f1;
  }

  gmpx-place-photo-gallery {
    grid-area: img;
  }

  gmpx-place-photo-gallery::part(tile) {
    max-width: 40px;
    max-height: 40px;
    margin: 5px;
    border-radius: 100%;
  }

  header {
    grid-area: name;
    align-self: end;
    font-size: 1em;
    font-weight: bold;
  }

  p {
    grid-area: address;
    align-self: start;
    font-size: 0.7em;
    margin: 0;
    padding: 5px 0;
  }
  div.meta {
    grid-area: meta;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>

<gmpx-place-data-provider place="{placeId}">
  <gmpx-place-photo-gallery max-tiles="1"></gmpx-place-photo-gallery>
  <header>
    <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
  </header>
  <p><gmpx-place-field-text field="formattedAddress"></gmpx-place-field-text></p>
  <div class="meta">
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div on:pointerdown={() => pressed = true} on:pointerleave={() => pressed = false}><IconButton class="material-icons" ripple={false}>drag_handle</IconButton></div>
  </div>
</gmpx-place-data-provider>
