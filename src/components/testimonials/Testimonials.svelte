<script>
import LargeHeading from "../../shared/LargeHeading.svelte";
import TestmContent from "./TestmContent.svelte";
import TestmNav from "./TestmNav.svelte";


</script>
<section id="#Testimonials" class="p-5 flex flex-col justify-center items-center w-full md:w-2/3">
    <div class="flex justify-between">
        <LargeHeading> <div class=""><i class="fas fa-quote-left absolute text-gray-300 text-6xl"></i><h2 class="text-left relative pt-10 pl-3">What People are Saying about Edustar?</h2></div> </LargeHeading>
        <TestmNav/>
    </div>
<div class="">
    <TestmContent></TestmContent>
</div>
</section>