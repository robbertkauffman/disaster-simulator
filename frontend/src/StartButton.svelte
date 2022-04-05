<script>
  import { isRunning } from './store.js';

  let buttonText = 'Start';
  let iconClass = 'bi-play-fill';

  function handleClick() {
    isRunning.update(isRunning => {
      isRunning = !isRunning;
      buttonText = !isRunning ? 'Start' : 'Pause';
      iconClass = !isRunning ? 'bi-play-fill' : 'bi-pause-fill';
      return isRunning;
    });
  }
</script>

<button type="button" class="btn btn-primary" on:click={handleClick}>{buttonText}<i class="bi {iconClass}"></i></button>

<style>
  button {
    margin-top: 10px;
    background-color: forestgreen;
    border-color: forestgreen;
  }

  button:hover {
    background-color: darkgreen;
    border-color: darkgreen;
  }

  button:focus {
    background-color: seagreen;
    border-color: seagreen;
  }

  i {
    margin-left: 5px;
  }
</style>