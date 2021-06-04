<script>
    import Checkbox from './Checkbox.svelte';

    export let resetGame;
    export let startRandomNoteQuiz;
    export let time;
    export let withTimeConstraint = true;
    export let fretboardNavigationQuestions = false;
</script>

<style>
  .overTime {
    color: red;
  }

  input:checked + svg {
  	display: block;
  }
</style>

<header class="pt-8  text-center flex justify-center items-center">
    <div class="flex justify-center p-2">
        <img class="self-center mr-2" width="100" src="assets/sveltuirLogo.png" alt="Sveltuir Logo"/>
    </div>
    
    <div class="max-h-24 flex justify-center">
      <button 
        class="button"
        on:click={resetGame}>
        Reset
      </button>
  
      <button
        class="button"
        on:click={startRandomNoteQuiz}
        >
        Show Random Note
      </button>
  
      {#if withTimeConstraint}
        <div
          class="m-4 p-4 border-4 border-green-600 text-green-700 text-center rounded-full w-48"
        >
          <time class="font-black mr-2" class:overTime={time >= 6}>{time}</time> Seconds
        </div>
      {/if} 

      <div class="flex flex-col justify-center">
        <Checkbox label="With time constraint?" bind:checked={withTimeConstraint} />
        <Checkbox label="Fretboardnavigation questions?" bind:checked={fretboardNavigationQuestions}/>
      </div>

    </div>
  </header>