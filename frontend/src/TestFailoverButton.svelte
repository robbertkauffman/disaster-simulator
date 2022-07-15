<script>
  const DEFAULT_BUTTON_TEXT = "Atlas regional failover";
  const BUTTON_TEXT_CLICKED = "Initiated regional failover...";
  const TEST_FAILOVER_PATH = "/testFailover";

  export let appServerEndpoint;

  let buttonText = DEFAULT_BUTTON_TEXT;
  let isDisabled = false;

  async function testFailover() {  
    try {
      const resp = await fetch(appServerEndpoint + TEST_FAILOVER_PATH, { method: 'POST' });
      if (resp.ok) {
        isDisabled = true;
        buttonText = BUTTON_TEXT_CLICKED
        
        // reset button after 10 minutes
        setTimeout(() => { 
          isDisabled = false;
          buttonText = DEFAULT_BUTTON_TEXT;
        }, 600000);
      }
    } catch (e) {
      console.log(`Test failover failed: ${e}`)
    }
}
</script>

<button type="button" class="btn btn-primary" on:click="{testFailover}" disabled={isDisabled}>{buttonText}</button>