<script>
    import Branding from './Branding.svelte';
import Navlinks from './Navlinks.svelte';

</script>
<div class="fixed w-full bg-purple-100 z-10">
    <div class="flex justify-end">
        <h3 class="bg-red-500 inline-block text-white p-2 mx-3">
            <i class="fas fa-phone"></i>
            +91 12345667890
        </h3>
    </div>
    <div class="flex flex-col md:flex-row items-center md:justify-between ">
        <Branding/>
        <Navlinks/>
    </div>
</div>