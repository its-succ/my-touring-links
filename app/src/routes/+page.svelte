<script lang="ts">
  import Map from 'components/Map.svelte';
</script>

<style>
	:global(html, body) {
    height: 100vh;
    margin: 0;
	}
	article {
    display:flex;
    flex-direction: column;
    height: 100vh;
  }
  header {
    height: 6em;
  }
  main {
    flex-grow: 1;
    overflow-y: auto;
  }
  footer {
    height: 2em;
  }
</style>

<article>
  <header>
    <h1>Welcome to My Touring Links</h1>
  </header>
  <main>
    <Map />
  </main>
  <footer>
    @copy-right: ESM
  </footer>
</article>
