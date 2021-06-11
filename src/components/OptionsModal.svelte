<script>
  import { blur } from 'svelte/transition';
  import {onMount} from "svelte";

  onMount(() => {
    modalWidth = Modal.offsetWidth;
    modalHeight = Modal.offsetHeight;
  })

  let Modal;
  let modalWidth = 0;
  let modalHeight = 0;
</script>

<style>
    .modal {
        z-index: 1000;
        position: absolute;
        top: 50%;
        left: 50%;
    }
</style>

<div
    class="modal w-auto h-auto bg-white rounded-lg shadow-xl flex flex-col justify-center items-center p-4"
    transition:blur={{duration: 200}}
    bind:this={Modal}
    style="margin-left: -{modalWidth / 2}px; margin-top: -{modalWidth / 2}px;"
>
    <slot />
</div>
