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
    <div class="md:w-140">
        <div class="flex flex-col md:flex-row justify-between p-5 m-2 my-5 items-center flex-wrap">
      
                <div class="md:w-1/3 relative">
                    <img src="/img/devaprabha1.jpeg" alt="Dr.sunil Devaprabha" class="p-5 rounded-left">
                </div>
      
            <div class=" md:text-right w-full md:w-2/3">
                <h2 class="font-Display font-bold text-3xl p-2">Excellent Faculty</h2>
                <p class="p-2"><strong>Sunil Devaprabha(Phd)</strong>  was a School teacher for 15 years turned British Council Trained Trainer and Success Coach.  An energetic Motivator, he has been sharing strategic skill, success tools and core values to the masses. He specializes in Positive Thinking and Peak Performance.  A passionate coach, he has trained and motivated over 30,000 students on Goal Setting, Energy, Rapport Building, Teachers Training, Parental Guidance, and Emotional Intelligence. </p>
            </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between p-5 m-2 my-5 items-center flex-wrap">
      
                
      
            <div class=" md:text-left md:w-2/3">
                <h2 class="font-Display font-bold text-3xl p-2">100% Learning Material</h2>
                <p class="p-2">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestias maiores nisi amet sapiente pariatur accusamus, quam velit rerum doloribus earum accusantium, ipsam sequi ipsum dolorum! Delectus, quia aspernatur veritatis illo tempora molestiae voluptatibus aliquam, eligendi eum possimus modi aut! Nesciunt vitae velit excepturi, id quo sapiente et, esse nostrum pariatur aspernatur assumenda architecto tempora recusandae quos non explicabo temporibus qui dolor! Voluptatum, ipsum quia magni amet labore voluptas minima ad, voluptates, totam odio quos nesciunt facere reprehenderit debitis fugit suscipit. Aliquid molestias quis id placeat harum cum hic at modi, nam maiores facere officia esse, necessitatibus quidem fugit vel molestiae.</p>
            </div>
            <div class="md:w-1/3 relative">
                <img src="/img/dummy.jpeg" alt="Dr.sunil Devaprabha" class="p-5 rounded-left">
            </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between p-5 m-2 my-5 items-center flex-wrap">
      
            <div class="md:w-1/3 relative">
                <img src="/img/dummy.jpeg" alt="Dr.sunil Devaprabha" class="p-5 rounded-left">
            </div>
      
            <div class="md:text-right md:w-2/3">
               
                <h2 class="font-Display font-bold text-3xl p-2">Certified And Trustworthy</h2>
                <p class="p-2">Lorem ipsum dolor, sit amet consectetur adipisicing elit. Molestias maiores nisi amet sapiente pariatur accusamus, quam velit rerum doloribus earum accusantium, ipsam sequi ipsum dolorum! Delectus, quia aspernatur veritatis illo tempora molestiae voluptatibus aliquam, eligendi eum possimus modi aut! Nesciunt vitae velit excepturi, id quo sapiente et, esse nostrum pariatur aspernatur assumenda architecto tempora recusandae quos non explicabo temporibus qui dolor! Voluptatum, ipsum quia magni amet labore voluptas minima ad, voluptates, totam odio quos nesciunt facere reprehenderit debitis fugit suscipit. Aliquid molestias quis id placeat harum cum hic at modi, nam maiores facere officia esse, necessitatibus quidem fugit vel molestiae.</p>
            </div>
            
        </div>
       
    </div>
    </div>
</div>