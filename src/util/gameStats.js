const Game = (function() {
    let correct;
    let wrong;
    let inTime;
    let notInTime;

    const publicAPI = {
        initiliazeGame,
        getGameStats,
        getCorrectCount,
        getWrongCount,
        countCorrect,
        countWrong,
        resetGame
    }

    return publicAPI;

    /****************/
    function initiliazeGame() {
        correct = 0;
        wrong = 0;
        inTime = 0;
        notInTime = 0;
    }

    function getGameStats() {
        return {correct, wrong, inTime, notInTime}
    }

    function getCorrectCount() {
        return correct;
    }

    function getWrongCount() {
        return wrong;
    }

    function countCorrect(inTime) {
        correct += 1;
        countInTimeStat(inTime);
    }

    function countWrong() {
        wrong += 1;
        countInTimeStat(inTime);
    }

    function countInTimeStat(wasInTime) {
        wasInTime ? inTime += 1 : notInTime += 1;
    }

    function resetGame() {
        correct = 0;
        wrong = 0;
        inTime = 0;
        notInTime = 0;
    }
})();

export default Game;