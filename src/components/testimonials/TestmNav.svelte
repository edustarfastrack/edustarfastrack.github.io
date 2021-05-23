<script>
import { createEventDispatcher } from "svelte";


let dispatch=createEventDispatcher();
export let currentItemNum;
export let maxItems;
</script>
<div class="flex flex-nowrap h-16 my-2 items-center justify-center">
    <div class="pointer bg-blue-500 px-2 p-1 m-3 text-white inline" on:click={()=>{
        dispatch('leftNavClick');
    }}><i class="fas fa-arrow-left"></i></div>
    {currentItemNum}/{maxItems}
    <div class="pointer bg-blue-500 px-2 p-1 m-3 text-white inline" on:click={()=>{
        dispatch('rightNavClick');
    }}><i class="fas fa-arrow-right"></i></div>
</div>