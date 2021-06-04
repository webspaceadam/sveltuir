function createNoteId(string, note) {
    return `${string}_${note}`;
}

function countFretsUp(currentFret, numberOfFretSteps) {
    return currentFret + numberOfFretSteps;
}

function countFretsDown(currentFret, numberOfFretSteps) {
    return currentFret - numberOfFretSteps;
}

export { createNoteId, countFretsUp, countFretsDown }