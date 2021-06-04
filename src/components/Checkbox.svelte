<script>
    export let checked;
    export let label;
</script>

<label class="mt-2 flex justify-start items-start" for="time-constraint-control">
    <div class="border-2 rounded border-green-700 w-6 h-6 flex flex-shrink-0 justify-center items-center mr-2 focus-within:border-blue-500">
      <input type="checkbox" class="opacity-0 absolute cursor-pointer" bind:checked={checked}>
      <svg class:hidden={!checked} class="fill-current w-4 h-4 text-green-700 pointer-events-none" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
    </div>
    <div class="text-green-700 font-mono">{ label }</div>
</label>