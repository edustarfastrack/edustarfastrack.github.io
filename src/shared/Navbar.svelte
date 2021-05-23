<script>
    import Branding from './Branding.svelte';
import Navlinks from './Navlinks.svelte';

</script>
<div class="fixed w-full md:px-5 bg-purple-100 z-10">
    <div class="flex justify-end">
        <h3 class="bg-red-500 inline-block text-white m-1 absolute">
           <div class="inline bg-blue-500 p-3 text-sm md:text-xl"><i class="fas fa-phone"></i></div>
            <div class="inline-block p-2 text-sm md:text-xl"><a href="tel:+91-97444-12045">+91 9744412045</a></div>
        </h3>
    </div>
    <div class="flex flex-row items-center justify-between">
        <Branding/>
        <Navlinks/>
    </div>
</div>