<script>

import LargeHeading from "../../shared/LargeHeading.svelte";
import CourseCard from "./CourseCard.svelte";


</script>
<section id="Courses" class="text-center ">
<LargeHeading>Courses We Offer</LargeHeading>
<div class="flex flex-col md:flex-row justify-center items-center text-center">
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
</section>