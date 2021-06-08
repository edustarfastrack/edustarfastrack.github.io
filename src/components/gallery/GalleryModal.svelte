<script>
import { createEventDispatcher } from "svelte";
import {Lightbox} from 'svelte-lightbox';
export let modalOpen=false;
export let galItem;
let dispatch=createEventDispatcher();
let img=[];
let num;
if(galItem==="Promotions"){
    num =20
}else{
    num=12
}
console.log(modalOpen)
if(modalOpen===true){
    for(let i=1;i<num;i++){
        img.push(`/img/${galItem}/${galItem}${i}.${galItem==="Promotions"?'jpg':'jpeg'}`)
        
    }
    console.log(img)
}
    

</script>
{#if modalOpen===true}
<div class="h-screen w-screen fixed bg-black bg-opacity-70 left-0 top-0 z-50 flex justify-center  items-center " on:click|self={()=>{
    dispatch("modalClose");
}}>

    <div class="bg-white p-5 rounded-md  m-5 flex items-center justify-center flex-wrap max-h-screen overflow-scroll relative">
        <div class="fixed cursor-pointer right-5 top-5" on:click={()=>{
            dispatch("modalClose");
        }}>
            <i class="fas fa-window-close text-3xl text-red-500"></i>
        </div>
        {#each img as imgItem}
     
       <div class=" w-full md:w-56 ring-2 m-3  relative" >
        <Lightbox thumbnail imagePreset="fit" description="{galItem}">
            <img slot="thumbnail" src="{imgItem}" alt="Thumbnail">
            <img slot="image" src="{imgItem}" alt="">
        </Lightbox>
        
        
       </div>
       {/each}
    </div>
    
</div>
{/if}