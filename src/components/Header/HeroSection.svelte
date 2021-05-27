<script>
    import Button from '../../shared/Button.svelte';
import LargeHeading from '../../shared/LargeHeading.svelte';
    import Subtext from '../../shared/Subtext.svelte';
import HeroImgs from './heroImgs.svelte';
import { scrollto } from "svelte-scrollto";
   
</script>
<div class="text-center flex flex-col justify-center items-center h-full py-48 pt-56 md:pb-36 mb-48 md:mb-0 relative">
    <div class="md:w-1/2">
    <LargeHeading>Edustar Nedumkandam</LargeHeading>
    <h1 class="text-4xl md:text-5xl lg:text-6xl p-5 font-Display font-bold">
        Fastrack your foriegn Dreams with edustar IELTS coaching
    </h1>
    <Subtext>
        <p class="w-3/4 md:w-2/3 hidden md:block">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Ut temporibus recusandae, incidunt mollitia qui quos obcaecati cumque. Maiores, reprehenderit provident?</p>
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