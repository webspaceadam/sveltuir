<script>
  import {uiState} from "../store";
  import Checkbox from './Checkbox.svelte';
  import OptionsModal from "./OptionsModal.svelte";

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
          <time class="font-black mr-2" class:overTime={time >= $uiState.timing}>{time}</time> Seconds
        </div>
        {/if}

        <button
            class="button"
            on:click={() => uiState.update(uiState => {
            return {
                ...uiState,
                isOptionsModalVisible: true
            }
        })}
        >
            Options
        </button>

        <button
            class="text-green-700"
            on:click={() => uiState.update(uiState => {
                return {
                    ...uiState,
                    isInfoModalVisible: true
                }
            })}
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
        </button>

        {#if $uiState.isOptionsModalVisible}
            <OptionsModal class="w-96 h-96">
                <h4 class="text-2xl text-green-700 font-black">
                    Options
                </h4>
                <div class="flex flex-col justify-center">
                    <Checkbox label="With time constraint?" bind:checked={withTimeConstraint} />
                    <label class="mt-2 text-left text-lg text-green-700 font-bold">
                        Timeroptions
                        <input
                            class="mt-2 border-2 rounded border-green-700 p-4 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500"
                            type=number
                            bind:value={$uiState.timing}
                        >
                    </label>
                </div>
                <button
                    class="button"
                    on:click={() => uiState.update(uiState => {
                        return {
                            ...uiState,
                            isOptionsModalVisible: false
                        }
                    })}
                >
                    Close
                </button>
            </OptionsModal>
        {/if}

        {#if $uiState.isInfoModalVisible}
            <OptionsModal class="h-3/5">
                <h4 class="text-2xl text-green-700 font-black">
                    Information
                </h4>
                <p>
                    This App is useable with your <strong>keyboard</strong>!
                </p>
                <h5 class="text-lg font-bold text-green-700 mt-4">
                    Keyboard Commands
                </h5>
                <table class="border-2 mt-2">
                    <tr class="p-4">
                        <th class="p-4">
                            Command
                        </th>
                        <th class="p-4">
                            Key
                        </th>
                    </tr>
                    <tr>
                        <td class="p-4 border-2">
                            Get new random note
                        </td>
                        <td class="p-4 border-2">
                            <code>n</code>
                        </td>
                    </tr>
                    <tr>
                        <td class="p-4 border-2">
                            Note without accidental
                        </td>
                        <td class="p-4 border-2">
                            <code>c, d, e, f, g, a, b</code>
                        </td>
                    </tr>
                    <tr>
                        <td class="p-4 border-2">
                            Note with accidental
                        </td>
                        <td class="p-4 border-2">
                            <code>Shift</code>
                            +
                            <code>c, d, e, f, g, a, b</code>
                        </td>
                    </tr>
                </table>
                <button
                    class="button"
                    on:click={() => uiState.update(uiState => {
                        return {
                            ...uiState,
                            isInfoModalVisible: false
                        }
                    })}
                >
                    Close
                </button>
            </OptionsModal>
            {/if}
    </div>
  </header>
