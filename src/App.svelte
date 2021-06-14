<script>
  import {onMount} from 'svelte';
  import {blur} from 'svelte/transition';
  import {notes, selectedNotes, quizNotes, uiState} from "./store";

  import Game from './util/gameStats';
  import {createNoteId} from './util';
  import {evaluateKeyInput, isNoteKey} from "./util/keyboardControlUtil";

  import NoteGrid from './components/NoteGrid.svelte';
  import Footer from './components/Footer.svelte';
  import Header from './components/Header.svelte';
  import Modal from './components/Modal.svelte';

  const gradiationColors = ["bg-green-300", "bg-green-400", "bg-green-500", "bg-green-600", "bg-green-700", "bg-green-800"];

  let time = 0;
  let interval;
  let gameScore;
  let withTimeConstraint = false;
  let fretboardNavigationQuestions = false;

  let key;
  let keyCode;

  let noteGradiations = $notes.map((notes, i) => {
    return {
      notes: [...notes],
      gradiation: gradiationColors[i]
    }
  });

  Game.initiliazeGame();

  function resetGame() {
    // Appstate
    gameScore = null;
    Game.resetGame();

    // UI State
    selectedNotes.set([]);
    quizNotes.set([]);
    $uiState.modalIsVisible ? toggleModal() : null;

    // Errorhandling
    stopTimer();
  }

  function startRandomNoteQuiz() {
    // stop the timer, when currently one is running
    interval >= 0 ? stopTimer() : null;

    // Create Quiz
    const stringNumber = Math.floor((Math.random() * 6));
    const fretNumber = Math.floor((Math.random() * 12));
    const selectedNote = $notes[stringNumber][0][fretNumber];
    const selectedNoteId = createNoteId(stringNumber, selectedNote);

    quizNotes.update(quizNotes => [...quizNotes, selectedNoteId]);

    startTimer();
  }

  function startTimer() {
    interval = setInterval(timer, 1000);
  }

  function stopTimer() {
    time = 0;
    clearInterval(interval);
    interval = null;
  }

  function timer() {
    time += 1;
  }

  function handleModalCorrect() {
    Game.countCorrect(getTiming());
    stopTimer();
    toggleModal();

    gameScore = Game.getGameStats();
  }

  function handleModalWrong() {
    Game.countWrong(getTiming());
    stopTimer();
    toggleModal();

    gameScore = Game.getGameStats();
  }

  function getTiming() {
    return time < $uiState.timing;
  }

  function toggleModal() {
    uiState.update(uiState => {
      return {
        ...uiState,
        modalIsVisible: !uiState.modalIsVisible
      }
    })
  }

  function handleKeydown(event) {
    key = event.key;
    keyCode = event.keyCode;
    const shiftKey = event.shiftKey;

    if (key === 'n') {
      startRandomNoteQuiz();
      return;
    }

    if ($quizNotes.length > 0 && isNoteKey(key)) {
      const searchedNote = $quizNotes[$quizNotes.length - 1];
      const correctGuess = evaluateKeyInput(key, keyCode, shiftKey, searchedNote);
      correctGuess ? handleKeydownCorrect(searchedNote) : handleKeydownWrong(searchedNote);
    }
  }

  function handleKeydownCorrect(correctNote) {
    Game.countCorrect(getTiming());
    stopTimer();

    gameScore = Game.getGameStats();
    selectedNotes.update(selectedNotes => [...selectedNotes, correctNote]);
  }

  function handleKeydownWrong(correctNote) {
    Game.countWrong(getTiming());
    stopTimer();

    gameScore = Game.getGameStats();
    selectedNotes.update(selectedNotes => [...selectedNotes, correctNote]);
  }
</script>

<svelte:window on:keydown={handleKeydown}/>

<style>
  .note-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    justify-items: center;
  }
</style>

{#if window.innerWidth < 780}
  <h2 class="text-2xl font-black text-green-700 text-center flex flex-col justify-center m-4">
    <code>Sveltuir</code> is only useable on devices with a screen width that is greater than 780px
  </h2>
{:else}
  <Header
          time={time}
          resetGame={resetGame}
          startRandomNoteQuiz={startRandomNoteQuiz}
          bind:withTimeConstraint={withTimeConstraint}
          bind:fretboardNavigationQuestions={fretboardNavigationQuestions}
  />

  {#if $uiState.modalIsVisible}
    <Modal bind:xCoordinate={$uiState.xCordinate} yCoordinate={$uiState.yCordinate} {handleModalCorrect} {handleModalWrong}/>
  {/if}

  <main
          class="text-center flex flex-col justify-center"
  >
    <section class="mt-8">
      <NoteGrid noteGradiations={noteGradiations} />
      <div class="note-grid mt-4">
        {#each [0,0,1,0,1,0,1,0,1,0,0,1] as dot}
          {#if dot == 1}
            <button class="bg-red-400 w-8 h-8 rounded-full hover:bg-red-200">
            </button>
          {:else}
            <span>-</span>
          {/if}
        {/each}
      </div>
    </section>

    {#if gameScore}
      <section class="mt-8 flex flex-col justify-center items-center" transition:blur={{duration: 200}}>
        <h3 class="text-2xl text-green-700 font-black">Your score</h3>
        <div class="flex flex-row justify-center items-center">
          <h4 class="text-xl text-green-700 font-mono mr-2">Correct</h4>
          <p class="mr-8">{gameScore.correct}</p>

          <h4 class="text-xl text-red-700 font-mono mr-2">Wrong</h4>
          <p>{gameScore.wrong}</p>
        </div>
        {#if withTimeConstraint}
          <div class="flex flex-row justify-center items-center">
            <h4 class="text-xl text-green-700 font-mono mr-2">In time</h4>
            <p class="mr-8">{gameScore.inTime}</p>

            <h4 class="text-xl text-red-700 font-mono mr-2">Not in time</h4>
            <p>{gameScore.notInTime}</p>
          </div>
        {/if}
      </section>
    {/if}
  </main>

{/if}
<Footer />


