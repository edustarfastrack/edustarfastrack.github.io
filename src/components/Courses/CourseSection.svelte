<script>

import LargeHeading from "../../shared/LargeHeading.svelte";
import CourseCard from "./CourseCard.svelte";


</script>
<section id="Courses" class="text-center mt-24 mb-16 w-screen overflow-hidden">
<LargeHeading>Courses We Offer</LargeHeading>
<div class="flex flex-col md:flex-row justify-center items-center text-center py-16 flex-wrap">
    <CourseCard cardTitle="Spoken English" order="md:order-1 order-2">
        Improve your spoken English skills & build confidence to succeed in your carreer and life .To become a fluent English speaker, you must study and master reading, listening, and speaking. At Edustar Fastrack, the lessons are structured to give you practice in all three areas at the same time
    </CourseCard>
    <CourseCard cardTitle="IELTS Coaching" redCard order="md:order-2 order-1">
        The International English Language Testing System, or IELTS, is an international standardized test of English language proficiency for non-native English language speakers. It is jointly managed by the British Council, IDP: IELTS Australia and Cambridge Assessment English, and was established in 1989. With expert faculity, quality study materials and training EDUSTAR strives to provide you the best IELTS coaching out there.
    </CourseCard>
    <CourseCard cardTitle="Teachers Training" order="md:order-3 order-3">
        Edustar Fastrack Teacher Training seeks to provide rigorous personal and professional training to teachers in the most effective way possible, with a user-friendly platform. Our vision is to be an indispensable source of information, guidance and continuing education, striving towards achieving excellence in teaching. This is a journey through new avenues of self-discovery and self-improvement – after all, the best teachers are those who develop continuously with holistic learning!
    </CourseCard>
</div>
<div class="bg-gray-100 p-5 md:w-2/3 m-auto">
    <div class=" flex flex-wrap items-center justify-center text-xl">
        <div class="md:w-1/2 md:border-r-2">
            <div class="flex justify-center ">
                <h3 class="p-2 font-Display font-bold">Online Classes: </h3>
                <div class="text-left p-2">
                    <ul><li class="text-blue-500">8:00 AM - 1:00 PM</li>
                        <li class="text-red-400">2:00 PM - 5:00 PM</li>
                        <li class="text-green-700">8:30 PM - 10:30 PM</li></ul>
                </div>
            </div>
            <div class="flex justify-center ">
                <h3 class="p-2 font-Display font-bold">Institute Timing: </h3>
                <div class="text-left p-2">
                    <ul><li class="text-blue-500">10:00 AM - 5:00 PM</li>
                        <li class="text-red-400">Monday - Friday</li></ul>
                </div>
            </div>
        </div>
        <div class="md:w-1/2 font-Display">
            <p class="font-bold underline p-2">Join Our whatsapp group to avail following facilities</p>
            <ul class="text-left px-4">
                <li><i class="fas fa-plane text-blue-400"></i> Get A,G Reading Tests Free</li>
                <li><i class="fas fa-plane text-blue-400"></i>  Get Speaking cue Cards Free</li>
                <li><i class="fas fa-plane text-blue-400"></i> Buy Our Speaking & Reading Book</li>
                <li><i class="fas fa-plane text-blue-400"></i> Get listening Tests Free</li>
             </ul>
             <p class="font-bold text-red-400 p-5">To join,click on the whatsapp icon on right</p>
        </div>
    </div>
    <div class="">
        <h3 class="font-bold text-red-700 p-2">Saturdays and Sundays are holidays for both online and offline classes</h3>
        
    </div>
</div>
</section>