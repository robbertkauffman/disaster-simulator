<script>
  import { isTestingFailover } from './store';
  const DEFAULT_BUTTON_TEXT = "Test failover";
  const BUTTON_TEXT_CLICKED = "Initiated failover...";
  const TEST_FAILOVER_PATH = "/testFailover";

  export let appServerEndpoint;

  let buttonText = DEFAULT_BUTTON_TEXT;

  async function testFailover() {  
    try {
      const resp = await fetch(appServerEndpoint + TEST_FAILOVER_PATH, { method: 'POST' });
      if (resp.ok) {
        isTestingFailover.set(true);

        // reset button after 10 minutes
        setTimeout(() => { 
          isTestingFailover.set(false);
        }, 600000);
      }
    } catch (e) {
      console.log(`Test failover failed: ${e}`)
    }
}
</script>

<button type="button" class="btn btn-primary" on:click="{testFailover}" disabled={$isTestingFailover}>
  {#if $isTestingFailover}
    {BUTTON_TEXT_CLICKED}
  {:else}
    {DEFAULT_BUTTON_TEXT}<i class="bi bi-lightning-fill"></i>
  {/if}
</button>

<style>
  i {
    margin-left: 5px;
  }
</style>