<script>
import { createEventDispatcher } from "svelte";
import { fade} from 'svelte/transition';
import { scrollto } from "svelte-scrollto";
export let sideNav=false;

let dispatch=createEventDispatcher();
export let TabItems;
export let currentTab;

</script>

<div class="w-full">
    
    <div class="flex justify-center items-center flex-wrap py-5">
        {#each TabItems as Tab}
           <h2 class="font-Display text-2xl md:text-3xl p-3 cursor-pointer {currentTab===Tab.name?'border-b-4 border-blue-500':''}" on:click={()=>{
               dispatch('tabChange',Tab.name)
           }}>{Tab.name}</h2>
        {/each}
    </div>

</div>

{#if sideNav }
<div class="fixed left-0 top-1/2 z-50" transition:fade>
    <div class="flex flex-col justify-center items-center flex-wrap py-5">
        {#each TabItems as Tab}
           <h2 class="font-Display text-2xl px-3 p-2 m-2 bg-gray-600 text-white cursor-pointer rounded-full {currentTab===Tab.name?' text-blue-500':''}" on:click={()=>{
               dispatch('tabChange',Tab.name)
           }} use:scrollto={'#AboutUs'}> <span class="{Tab.icon}"></span></h2>
        {/each}
    </div>
</div>
{/if}