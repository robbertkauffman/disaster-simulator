<script>
  import TestFailoverButton from "./TestFailoverButton.svelte";

	export let retryReads = true;
  export let retryWrites = true;
  export let readPreference = 'primary';
  export let realmAppEndpoint;
</script>

<div class="controls" role="group" aria-label="simulate failure menu">
  <div class="actions">
    <TestFailoverButton realmAppEndpoint={realmAppEndpoint}/>
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
  <!-- <div class="form-floating">
    <select class="form-select" id="read-concern" aria-label="Read concern">
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
    <select class="form-select" id="write-concern" aria-label="Write concern">
      <option value="majority" selected>majority</option>
      <option value="1">1</option>
    </select>
    <label for="write-concern">
      Write concern
    </label>
  </div> -->
</div>

<style>
  div.controls {
    margin-bottom: 30px;
  }
  
  div.actions {
    margin-bottom: 10px;
  }

  div.controls :global(button) {
    display: block;
    margin-bottom: 5px;
    background-color: indianred;
    border-color: indianred;
    width: 100%;
  }

  div.controls :global(button:hover) {
    background-color: darkred;
    border-color: darkred;
  }

  div.controls :global(button.btn-primary:disabled) {
    background-color: darkslategray;
    border-color: darkslategray;
  }

  .form-check-input:checked {
    background-color: indianred;
    border-color: indianred;
  }

  .form-floating {
    margin-top: 10px;
  }
</style>