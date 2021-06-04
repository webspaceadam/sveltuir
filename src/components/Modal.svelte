<script>
  import { blur } from 'svelte/transition'

  export let xCoordinate = 0;
  export let yCoordinate = 0;
  export let handleCorrect;
  export let handleWrong;

  $: if (xCoordinate >= window.innerWidth - 200) {
		xCoordinate -= 200;
	}
</script>

<style>
  .modal {
    position: fixed;
    z-index: 1000;
    top: var(--yCoordinate);
    left: var(--xCoordinate);
  }
</style>

<div
  class="modal w-48 h-48 bg-white rounded-lg shadow-xl flex flex-col justify-center items-center"
  transition:blur={{duration: 200}}
  style="
    --xCoordinate: {xCoordinate + 64}px;
    --yCoordinate: {yCoordinate}px;
  "
>
  <button class="button" on:click={handleCorrect}>
    Correct
  </button>

  <button class="button bg-red-500 hover:bg-red-300" on:click={handleWrong}>
    Wrong
  </button>
</div>
