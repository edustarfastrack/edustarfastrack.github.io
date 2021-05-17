<script>
import LargeHeading from "../../shared/LargeHeading.svelte";
import Tabs from "../../shared/Tabs.svelte";
import WhyUs from "./WhyUs.svelte";
import WhoAreWe from "./WhoAreWe.svelte";
import Mission from "./Mission.svelte";
import Vision from "./Vision.svelte";

let TabItems=["Why Us","Who are We","Mission","Vision"];
let currentTab="Why Us";
const handleTabChange=(e)=>{
    currentTab=e.detail;
}
</script>
<section class="text-center my-5  flex justify-center items-center">
    <div class="md:w-2/3 p-5">
        <LargeHeading>About Us</LargeHeading> 
    <Tabs {currentTab} {TabItems} on:tabChange={handleTabChange}/>
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
   
</section>