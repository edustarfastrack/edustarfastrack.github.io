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
                <p class="p-2"><strong>Sunil Devaprabha PhD (HC)</strong>  was a School teacher for 15 years turned British Council Trained Trainer and Success Coach.  An energetic Motivator, he has been sharing strategic skill, success tools and core values to the masses. He specializes in Positive Thinking and Peak Performance.  A passionate coach, he has trained and motivated over 30,000 students on Goal Setting, Energy, Rapport Building, Teachers Training, Parental Guidance, and Emotional Intelligence. With 18 years of teaching experience; 2004 onwards he has started his career as a resource person for teachers and conducted more than 150 sessions across the state (Kerala) alone.</p>
            </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between p-5 m-2 my-5 items-center flex-wrap">
      
                
      
            <div class=" md:text-left md:w-2/3 md:order-1 order-2">
                <h2 class="font-Display font-bold text-3xl p-2">100% Effective Learning Methods</h2>
                <p class="p-2">English speaking is compulsory in the institute.  We always ensure that students get some new pieces of information every day.  In every module we have a structure that is unique. Getting together during the festival season is part of our timetable. We also facilitate <strong>interaction between students and people from English speaking countries</strong>.  We ensure that individual attention is given to all students. We always see to it that the latest study materials are given which helps the students in getting extra information and latest trends.  We give students a <strong>test every week in the original IELTS format </strong> that provides them an entire picture of how the exam is given and this removes the fear and prepares them to face the exam confidently.  Generally, speaking is the toughest area for most non-English speaking students. Anticipating this problem, we give individual speeches everyday to exam–going students.  We give extra listening in the morning every day.  No doubt, this has helped students score satisfactorily in the listening module. <strong>VOA News and BBC news listening</strong>  help students improve their speaking and understanding skills
                    </p>
            </div>
            <div class="md:w-1/3 relative md:order-2 order-1">
                <img src="/img/ClassRoom1.jpeg" alt="Dr.sunil Devaprabha" class="p-5 rounded-left">
            </div>
        </div>
        <div class="flex flex-col md:flex-row justify-between p-5 m-2 my-5 items-center flex-wrap">
      
            <div class="md:w-1/3 relative">
                <img src="/img/trust.png" alt="Dr.sunil Devaprabha" class="p-5 rounded-left">
            </div>
      
            <div class="md:text-right md:w-2/3">
               
                <h2 class="font-Display font-bold text-3xl p-2">Certified & Trustworthy</h2>
                <p class="p-2">Sunil Devaprabha completed his <strong>PhD in Education (Effective Pedagogy)</strong>  from Commonwealth Vocational University New-Delhi a Registered agent of CVU Nuku’alofa, Tongatapu, Kingdom of Tonga.
                    He is a certified <strong>`Train the Trainer’</strong>  by the <strong>British Council-Chennai</strong>  and <strong>IDP-Kochi</strong> .
                    </p>
            </div>
            
        </div>
       
    </div>
    </div>
</div>