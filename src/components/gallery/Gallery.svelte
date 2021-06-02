<script>
import LargeHeading from "../../shared/LargeHeading.svelte";
import Tabs from "../../shared/Tabs.svelte";
let currentTab="Promotions";
let TabItems=[{name:"Promotions",icon:"fas fa-question"},{name:"Training",icon:"fas fa-users"}]
const handleTabChange=(e)=>{
    currentTab=e.detail;
}

</script>
<div class="text-center w-screen h-110 flex flex-col justify-center items-center my-24 overflow-hidden">
    <LargeHeading>Gallery</LargeHeading> 
    <div class="md:w-2/3 flex flex-col justify-center items-center ">
        <Tabs {currentTab} {TabItems} on:tabChange={handleTabChange} />
    {#if currentTab === "Promotions"}
    <div class="ring-4">
        <img src="/img/logo2.png" alt="">
    </div>
    {:else if currentTab === "Training"}
    <div class="ring-4">
        <img src="/img/ClassRoom1.jpeg" alt="">
    </div>
    {/if}
    </div>
</div>
