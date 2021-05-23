<script>
import { fade } from 'svelte/transition';




let images=[{
        id:1,
        name:"scoreSheet1.jpeg",
        studentName:"Josna",
        score:7.2

    },{
        id:2,
        name:"scoreSheet2.jpeg",
        studentName:"Mariyamma",
        score:7.2

    }]
let maxImage=2,currentImage=1;
$:currentImage;

let interval = setInterval(()=>{
    if(currentImage>=maxImage){
        currentImage=1;
    }else{
        
        currentImage++;
    }
},3000);

</script>  
<div class="relative md:w-96 w-72 md:h-105 h-96 text-center " >
    
   {#each images as img}
   {#if img.id===currentImage}
   <div class=" " in:fade out:fade>
       <a href="/img/{img.name}" data-lightbox="{img.name}" data-title="{img.name}">
        <img src="/img/{img.name}" alt="{img.name}" class="absolute">
        <p class="bg-blue-500 p-3 absolute text-white bottom-0 right-0">{img.studentName} <br> <span class="font-bold text-2xl">{img.score} <i class="fas fa-certificate text-yellow-300 text-2xl"></i></span></p>
       
       </a>
   </div>
   {/if}
   {/each}

</div>
<style>

</style>