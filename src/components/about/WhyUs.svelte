<script>
    
import ImageSlide from "./ImageSlide.svelte";
import IntersectionObserver from "svelte-intersection-observer";
import {tweened} from 'svelte/motion';
import { cubicOut } from 'svelte/easing';
  const value = tweened(0,{ 
		duration: 1000,
		easing: cubicOut
	});

  let element;
  let intersecting;

$:intersecting?value.set(100):value.set(0);

</script>
<div class="p-5 text-center flex flex-col items-center justify-center">
    <div class="">
        <div class="flex justify-center items-center">
            <ImageSlide/>
        </div>
        <IntersectionObserver {element} bind:intersecting>
        <div class="py-24 flex flex-col md:flex-row flex-wrap justify-center items-center overflow-hidden w-full" bind:this={element}>
            <div class="p-3">
                <h3 class="font-bold font-Display text-5xl text-blue-600 mx-10">{$value.toFixed(0)}+</h3>
                <p class="font-body text-xl">Happy Students</p>
            </div>
            <div class="p-3">
                <h3 class="font-bold font-Display text-5xl text-red-600 mx-10">{$value.toFixed(0)/10}+</h3>
                <p class="font-body text-xl">Years of Experience</p>
            </div>
            <div class="p-3">
                <h3 class="font-bold font-Display text-5xl text-blue-600 mx-10">{$value.toFixed(0)}%</h3>
                <p class="font-body text-xl">Success Ratio</p>
            </div>
        </div>
    </IntersectionObserver>
    </div>
</div>