<script>
    export let noteId;
    export let note;
    export let bgColor;
    export let isQuizNote;

    export let handleClick;
    export let handleMouseDown;

    export let visible;
</script>

<div
    class="{bgColor} note pointer"
    class:quizNote={isQuizNote}
    on:click={handleClick}
    on:mousedown={handleMouseDown}
>
    <p class="text-xl" class:hidden={!visible}>{ note }</p>
</div>

<style>
    .pointer {
        cursor: pointer;
    }

    .hidden {
        display: none;
    }

    .quizNote {
        background-color: gray;
    }
</style>