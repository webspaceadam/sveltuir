import { get } from 'svelte/store';
import { notes } from '../store';
import { createNoteId, countFretsDown, countFretsUp } from '.';

const fretboard = get(notes);

function getSameNoteStringLower(position) {
    const stringNumber = position.string + 1;
    return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsUp(position.fret, 5)));
}

function getSameNoteStringHigher(position) {
    const stringNumber = position.string - 1;
    return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsDown(position.fret, 5)));
}

function getSameNoteStringHigherBandG(position) {
    const stringNumber = position.string - 1;
    return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsDown(position.fret, 4)));
}

function getSameNoteStringLowerBandG(position) {
    const stringNumber = position.string + 1;
    return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsUp(position.fret, 4)));
}

function getHighestNoteOfOctave(position) {
    const stringNumber = position.string - 1;
    return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsUp(position.fret, 7)));
}

function getLowestNoteOfOctave(position) {
    const stringNumber = position.string + 1;
    return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsDown(position.fret, 7)));
}

function getHighestNoteOfOctaveBandG(position) {
    const stringNumber = position.string - 1;
    return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsUp(position.fret, 8)));
}

function getLowestNoteOfOctaveBandG(position) {
    const stringNumber = position.string + 1;
    return createNoteId(stringNumber, getNoteToSearch(stringNumber, countFretsDown(position.fret, 8)));
}

/********* HELPERS */
function getNoteToSearch(stringNumber, newFret) {
    return fretboard[stringNumber][0][newFret];
}

export {
    getSameNoteStringLower,
    getSameNoteStringHigher,
    getSameNoteStringHigherBandG,
    getSameNoteStringLowerBandG,
    getHighestNoteOfOctave,
    getLowestNoteOfOctave,
    getHighestNoteOfOctaveBandG,
    getLowestNoteOfOctaveBandG
}