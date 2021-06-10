<script>
    import Note from './Note.svelte';
    import { createNoteId } from '../util';
    import FretboardNavigation from './../util/fretboardNavigation';
    import { selectedNotes, quizNotes, uiState } from '../store';

    export let noteGradiations;
    
    /************ FUNCTIONS ************/
    function addNoteToSelected(stringNumber, note, fretNumber) {
        FretboardNavigation.getQuestionPosition.call({string: stringNumber, fret: fretNumber});

        const newNote = createNoteId(stringNumber, note);

        selectedNotes.update(selectedNotes => [...selectedNotes, newNote]);
        uiState.update(uiState => {
            return {
                ...uiState,
                modalIsVisible: true
            }
        });
    }

    function getMouseCoordinates(event) {
        uiState.update(uiState => {
            return {
                ...uiState,
                xCordinate: event.clientX,
                yCordinate: event.clientY
            }
        })
    }
</script>

<style>
    .note-grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      justify-items: center;
    }
</style>


{#each noteGradiations as noteGradiation, i }
    <div class="note-grid mt-4">
    {#each noteGradiation.notes[0] as note, j }
        <Note
            noteId={() => createNoteId(i, note)}
            visible={$selectedNotes.find(songId => songId == createNoteId(i, note))}
            isQuizNote={$quizNotes.find(songId => songId == createNoteId(i, note))}
            note={note}
            bgColor={noteGradiation.gradiation}
            handleClick={() => addNoteToSelected(i, note, j)}
            handleMouseDown={e => getMouseCoordinates(e)}
        />
    {/each}
    </div>
{/each} 

