<script>
    import Button from '../../shared/Button.svelte';
import LargeHeading from '../../shared/LargeHeading.svelte';
    import Subtext from '../../shared/Subtext.svelte';
import HeroImgs from './heroImgs.svelte';
import { scrollto } from "svelte-scrollto";
   
</script>
<div class="text-center flex flex-col justify-center items-center h-full py-36 md:py-48 md:pt-56 md:pb-36 mb-48 md:mb-0 relative">
    <div class="md:w-1/2">
    <LargeHeading>Edustar Fastrack Nedumkandam</LargeHeading>
    <h1 class="text-4xl md:text-5xl lg:text-6xl p-5 font-Display font-semibold">
        Fastrack your foreign Dreams with Edustar Fastrack IELTS coaching
    </h1>
    <Subtext>
        <p class="w-3/4 md:w-2/3 hidden md:block">If you have a strong desire to achieve your dream and if it is not happening with your efforts?  Do not know where to begin and how to progress? We can help to sort it out with bespoke programmes that can cater your requirements at the relevant areas.</p>
    </Subtext>
<a href="#ContactUs" use:scrollto={'#ContactUs'}>
    <Button type="primary" rounded={true}>
        Enroll Now
    </Button>
</a>
<HeroImgs />
<HeroImgs blue={true}/>
</div>
</div>