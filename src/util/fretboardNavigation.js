import { getSameNoteStringLowerBandG } from './fretboardNavigationHelper';

const FretboardNavigation = (function() {

    const publicAPI = {
        getQuestionPosition
    }

    return publicAPI;

    /******* LOGIC */
    function getQuestionPosition() {
        const position = {string: this.string, fret: this.fret}

        let searchNoteId;
        let question;

        switch (this.string) {
            case 1:
                searchNoteId = getSameNoteStringLowerBandG(position);
                question = createQuestion("same", getStringNote(1));
                break;
        
            default:
                break;
        }

        console.log(question);
        console.log("Search the note: ", searchNoteId);
    }
})({string: 0, fret: 0});

export default FretboardNavigation;


/********** HELPER FUNCTIONS */
function getStringNote(string) {
    switch (string) {
        case 0:
            return "High-E";
        case 1:
            return "B";
        case 2:
            return "G";
        case 3:
            return "D";
        case 4: 
            return "A";
        case 5: 
            return "Low-E"
    
        default:
            break;
    }
}

function createQuestion(noteLevel , string) {
    return `Get the ${noteLevel} on the ${string} string`;
}