<script>
  import DbOperation from './DbOperation.svelte';
  import { afterUpdate, onMount } from 'svelte';

  export let region = 'REGION';
  export let appServerEndpoint;

  let operations = [];

  const FIND_PATH = "/find";
  const INSERT_PATH = "/insert";
  // const SEARCH_PATH = "/search";
  
  onMount(() => {
    setOperations();
	});

  afterUpdate(() => {
    setOperations();
  });

  function setOperations() {
    operations = [
      {
        operationName: 'findOne()',
        url: appServerEndpoint + FIND_PATH,
        timeout: 10000
      },
      {
        operationName: 'insertOne()',
        url: appServerEndpoint + INSERT_PATH,
        timeout: 10000
      },
      // {
      //   operationName: 'search()',
      //   url: appServerEndpoint + SEARCH_PATH,
      //   timeout: 10000
      // }
    ];
  }
</script>

<div class="col">
  <h1 class="display-6">App log — {region.toUpperCase()}</h1>
  {#each operations as operation}
    <DbOperation {...operation}/>
  {/each}
</div>