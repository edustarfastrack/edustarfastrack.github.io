<script>

import LargeHeading from "../../shared/LargeHeading.svelte";
import CourseCard from "./CourseCard.svelte";


</script>
<section id="Courses" class="text-center mt-24 mb-16 w-screen overflow-hidden">
<LargeHeading>Courses We Offer</LargeHeading>
<div class="flex flex-col md:flex-row justify-center items-center text-center py-24">
    <CourseCard cardTitle="Course1">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium sapiente molestiae nostrum veniam provident aliquam unde eveniet temporibus. Aliquid, fuga.
    </CourseCard>
    <CourseCard cardTitle="Course2" redCard>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium sapiente molestiae nostrum veniam provident aliquam unde eveniet temporibus. Aliquid, fuga.
    </CourseCard>
    <CourseCard cardTitle="Course3">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium sapiente molestiae nostrum veniam provident aliquam unde eveniet temporibus. Aliquid, fuga.
    </CourseCard>
</div>
<div class="bg-gray-100 p-5 md:w-2/3 m-auto">
    <div class="flex justify-center ">
        <h3 class="p-2 font-Display font-bold">Online Classes: </h3>
        <div class="text-left p-2">
            <ul><li class="text-blue-500">8:00AM - 1:00PM</li>
                <li class="text-red-400">2:00PM - 5:00PM</li>
                <li class="text-green-700">8:30PM - 10:30PM</li></ul>
        </div>
    </div>
    <div class="flex justify-center ">
        <h3 class="p-2 font-Display font-bold">Institute Timing: </h3>
        <div class="text-left p-2">
            <ul><li class="text-blue-500">10:00AM - 5:00PM</li>
                <li class="text-red-400">Monday - Friday</li></ul>
        </div>
    </div>
    <div class="">
        <h3 class="font-bold text-red-700 p-2">Staturdays and sundays are holidays for both online and offline classes</h3>
    </div>
</div>
</section>