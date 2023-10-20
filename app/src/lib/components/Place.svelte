<script lang="ts">
  /** Place ID */
  export let placeId: string | undefined;
</script>

<style>
  gmpx-place-data-provider {
    display: grid;
    grid-template:
      "img name" auto
      "img address" auto
      /70px 1fr
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
    max-width: 50px;
    max-height: 50px;
    margin: 10px;
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
</style>

<gmpx-place-data-provider place="{placeId}">
  <gmpx-place-photo-gallery max-tiles="1"></gmpx-place-photo-gallery>
  <header>
    <gmpx-place-field-text field="displayName"></gmpx-place-field-text>
  </header>
  <p><gmpx-place-field-text field="formattedAddress"></gmpx-place-field-text></p>
</gmpx-place-data-provider>
