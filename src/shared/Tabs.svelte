<script>
import { createEventDispatcher } from "svelte";



let dispatch=createEventDispatcher();
export let TabItems;
export let currentTab;
</script>
<div class="">
    <div class="flex justify-center items-center flex-wrap py-5">
        {#each TabItems as Tab}
           <h2 class="font-Display text-2xl md:text-3xl p-3 cursor-pointer {currentTab===Tab?'border-b-4 border-blue-500':''}" on:click={()=>{
               dispatch('tabChange',Tab)
           }}>{Tab}</h2>
        {/each}
    </div>
</div>