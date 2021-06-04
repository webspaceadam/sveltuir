import { writable, readable } from "svelte/store";

const fretNotes = [
    [getFrets("F")],
    [getFrets("C")],
    [getFrets("G#/Ab")],
    [getFrets("D#/Eb")],
    [getFrets("A#/Bb")],
    [getFrets("F")]
];

const uiState = writable({
    modalIsVisible: false,
    xCordinate: 0,
    yCordinate: 0
});
const selectedNotes = writable([]);
const quizNotes = writable([]);
const notes = readable(fretNotes);



export { notes, selectedNotes, quizNotes, uiState };

/************ FUNCTIONS ***********/
function getFrets(singleNote) {
    const noteArray = [
        "C",
        "C#/Db",
        "D",
        "D#/Eb",
        "E",
        "F",
        "F#/Gb",
        "G",
        "G#/Ab",
        "A",
        "A#/Bb",
        "B"
    ];

    const noteIndex = noteArray.findIndex(note => note == singleNote);
    const newNoteArray = [
        ...noteArray.slice(noteIndex, noteArray.length),
        ...noteArray.slice(0, noteIndex)
    ]

    return newNoteArray;
}
