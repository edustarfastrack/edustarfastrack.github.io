<script>
    import Subtext from "../../shared/Subtext.svelte";
    import {fade,slide} from 'svelte/transition';
import { createEventDispatcher } from "svelte";
    export let Testimonial;
    let dispatch=createEventDispatcher();
    </script>
    <div class="p-5 fixed top-0 left-0 w-screen h-screen bg-black flex justify-center items-center z-50"  transition:fade|local on:click={()=>{
        dispatch("modalClose");
    }}>
        <div class="bg-white p-5 h-fit max-h-screen w-full  overflow-scroll">
            <div class=" relative">
                <span class="fas fa-window-close text-3xl text-red-500 absolute  right-0"></span>
            </div>
            <h3 class="px-5">{Testimonial.title}</h3>
        <Subtext><slot></slot></Subtext>
        
            <div class="">
                <img src="/img/Testimonials/{Testimonial.img}" alt="{Testimonial.img}" class="w-24 rounded-full">
                <div class="">
                    <h4 >{Testimonial.name}</h4>
                    <p>{Testimonial.designation}</p>
                </div>
            </div>
           
       
        
        </div>
    </div>