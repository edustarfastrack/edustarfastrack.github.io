<script>
import IntersectionObserver from "svelte-intersection-observer";

let element;
let intersecting;
    // components
import LargeHeading from "../../shared/LargeHeading.svelte";
import Tabs from "../../shared/Tabs.svelte";
import WhyUs from "./WhyUs.svelte";
import WhoAreWe from "./WhoAreWe.svelte";
import Mission from "./Mission.svelte";
import Vision from "./Vision.svelte";

let TabItems=[{name:"Why Us",icon:"fas fa-question"},{name:"Who are We",icon:"fas fa-users"},{name:"Mission",icon:"fas fa-bullseye"},{name:"Vision",icon:"fas fa-binoculars"}];
let currentTab="Why Us";
const handleTabChange=(e)=>{
    currentTab=e.detail;
}

</script>
<section id="AboutUs" class="text-center w-screen flex flex-col justify-center items-center my-24 overflow-hidden" >
    <IntersectionObserver {element} bind:intersecting>
    <div class="md:w-2/3 p-5" bind:this={element}>
       
         
         
        <LargeHeading>About Us</LargeHeading> 
       
    <Tabs {currentTab} {TabItems} on:tabChange={handleTabChange} sideNav={intersecting}/>
       {#if currentTab==="Why Us"}
       <WhyUs/>
       {:else if currentTab==="Who are We"}
       <WhoAreWe/>
       {:else if currentTab==="Mission"}
       <Mission/>
       {:else if currentTab==="Vision"}
       <Vision/>
       {/if}
   
    </div>
</IntersectionObserver>
</section>