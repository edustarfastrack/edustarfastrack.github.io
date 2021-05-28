<script>
import Subtext from "../../shared/Subtext.svelte";
import {fade,slide} from 'svelte/transition';
import TestimonialModal from "./TestimonialModal.svelte";
import { createEventDispatcher } from "svelte";
let dispatch=createEventDispatcher();
export let Testimonial;

// ModalControl
$:openModal=false;
const handleModalClick=()=>{
  
    openModal=true;
    dispatch("modalOpen");
}
const handleModalClose=()=>{
    openModal=false;
    dispatch("modalClose");
}
</script>
<div class="p-5 w-72 md:w-96"  transition:fade|local on:click={handleModalClick}>
    <h3>{Testimonial.title}</h3>
    <Subtext><slot></slot></Subtext>
    <div class="">
        <img src="/img/Testimonials/{Testimonial.img}" alt="{Testimonial.img}" class="w-24 rounded-full">
        <div class="">
            <h4>{Testimonial.name}</h4>
            <p>{Testimonial.designation}</p>
        </div>
    </div>
</div>
{#if openModal===true}
        <TestimonialModal Testimonial={Testimonial} on:modalClose={handleModalClose}>{Testimonial.content}</TestimonialModal>
        
{/if}