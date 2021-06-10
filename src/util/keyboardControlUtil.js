import {quizNotes} from "../store";

/**
 * Check if the user put in the correct note.
 * @param {string} key
 * @param {number} keyCode
 * @param {boolean} shiftKey
 * @param {string} searchedNote
 * @return {boolean}
 */
function evaluateKeyInput(key, keyCode, shiftKey, searchedNote) {
  let keyInput = '';

  if(shiftKey && keyCode !== 17) {
    keyInput = getAccidentalStrings(key);
  } else if (keyCode !== 17) {
    keyInput = key.toUpperCase();
  }

  if (keyInput.length === 2) {
    const guessType1 = checkCorrectKeydown(keyInput[0], searchedNote);
    const guessType2 = checkCorrectKeydown(keyInput[1], searchedNote);

    return guessType1 || guessType2;
  }

  return checkCorrectKeydown(keyInput, searchedNote);
}

/**
 * Get the currently searched note and return whether the keyinput was correct.
 * @param {string} key
 * @param {string} searchedNote
 * @return {boolean}
 */
function checkCorrectKeydown(key, searchedNote) {
  return searchedNote.includes(key);
}


/**
 * Returns the two possible strings with additional accidental
 * @param {string} key
 * @returns {Array}
 */
function getAccidentalStrings(key) {
  const fromSharp =  `${key.toUpperCase()}#/${getCorrespondingFlat(key)}b`;
  const fromFlat = `${getCorrespondingSharp(key)}#/${key.toUpperCase()}b`;

  return [fromSharp, fromFlat]
}

/**
 * Checks if key input is a key that contains a note
 * @param {string} key
 * @return {boolean}
 */
function isNoteKey(key) {
  return "CDEFGAB".includes(key.toUpperCase());
}

/**
 *
 * @param {string} key
 */
function getCorrespondingFlat(key) {
  switch (key.toUpperCase()) {
    case 'C':
      return 'D';
    case 'D':
      return 'E';
    case 'F':
      return 'G';
    case 'G':
      return 'A';
    case 'A':
      return 'B';
  }
}

/**
 *
 * @param {string} key
 */
function getCorrespondingSharp(key) {
  switch (key.toUpperCase()) {
    case 'D':
      return 'C';
    case 'E':
      return 'D';
    case 'G':
      return 'F';
    case 'A':
      return 'G';
    case 'B':
      return 'A';
  }
}

export {
  evaluateKeyInput,
  isNoteKey
}
