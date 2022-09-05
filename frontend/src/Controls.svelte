<script>
  import { slide } from 'svelte/transition';
  import StartAndPauseButtons from "./StartAndPauseButtons.svelte";

  export let appServerEndpoint;
	export let retryReads = true;
  export let retryWrites = true;
  export let readPreference = 'primary';
  export let readConcern = 'local';
  export let writeConcern = 'majority';

  let moreOptions = false;

  function handleClickMoreOptions() {
    moreOptions = !moreOptions;
  }
</script>

<div class="controls" role="group" aria-label="simulate failure menu">
  <div class="actions">
    <StartAndPauseButtons appServerEndpoint={appServerEndpoint} retryReads={retryReads} retryWrites={retryWrites} 
                          readPreference={readPreference} readConcern={readConcern} writeConcern={writeConcern}/>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" bind:checked={retryReads}>
    <label class="form-check-label" for="flexCheckChecked">
      Retryable reads
    </label>
  </div>
  <div class="form-check">
    <input class="form-check-input" type="checkbox" value="" bind:checked={retryWrites}>
    <label class="form-check-label" for="flexCheckChecked">
      Retryable writes
    </label>
  </div>
  <button class="btn more-options-button" type="button" aria-controls="more-options" on:click={handleClickMoreOptions}>
    <i class="bi {!moreOptions ? 'bi-chevron-double-down' : 'bi-chevron-double-up'}"></i>
    {!moreOptions ? 'more options' : 'hide options'}
  </button>
  {#if moreOptions}
    <div id="more-options" transition:slide>
      <div class="form-floating">
        <select class="form-select" id="read-preference" aria-label="Read preference" bind:value={readPreference}>
          <option value="primary" selected>primary</option>
          <option value="primaryPreferred">primaryPreferred</option>
          <option value="secondary">secondary</option>
          <option value="secondaryPreferred">secondaryPreferred</option>
        </select>
        <label for="read-preference">
          Read preference
        </label>
      </div>
      <div class="form-floating">
        <select class="form-select" id="read-concern" aria-label="Read concern" bind:value={readConcern}>
          <option value="local" selected>local</option>
          <option value="available">available</option>
          <option value="majority">majority</option>
          <option value="linearizable">linearizable</option>
        </select>
        <label for="read-concern">
          Read concern
        </label>
      </div>
      <div class="form-floating">
        <select class="form-select" id="write-concern" aria-label="Write concern" bind:value={writeConcern}>
          <option value="majority" selected>majority</option>
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
        <label for="write-concern">
          Write concern
        </label>
      </div>
    </div>
  {/if}
</div>

<style>
  div.controls {
    margin-bottom: 30px;
  }
  
  div.actions {
    margin-bottom: 10px;
  }

  .form-check-input:checked {
    background-color: slategray;
    border-color: slategray;
  }

  .form-floating {
    margin-top: 10px;
  }

  .more-options-button {
    border: none;
    padding: 0;
    padding: .375rem .75rem .375rem 0;
    font-size: .75em;
  }

  .more-options-button i {
    font-size: 1.25em;
    margin-right: 6px;
    vertical-align: middle;
  }

  .more-options-button:hover {
    background-color: gainsboro;
  }
</style>