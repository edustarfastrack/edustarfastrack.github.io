<script>
import LargeHeading from "../../shared/LargeHeading.svelte";
import Tabs from "../../shared/Tabs.svelte";
import GalleryModal from "./GalleryModal.svelte";
let modalOpen=false;
let currentTab= "Promotions"
let TabItems=[{name:"Promotions",icon:"fas fa-question"},{name:"Training",icon:"fas fa-users"}]
const handleTabChange=(e)=>{
    currentTab=e.detail;
}
const handleModalClose=(e)=>{
    modalOpen=false;
}
const handleModalOpen=()=>{
    modalOpen=true;
}
</script>

<section id="Gallery" class="h-140 flex justify-center items-center flex-col py-10">
    <LargeHeading>Gallery</LargeHeading>
    <div class="md:w-2/3 flex flex-col justify-center items-center">
        <Tabs {currentTab} {TabItems} on:tabChange={handleTabChange} TabRed={true}/>
        {#if currentTab === "Promotions"}
       <div class="max-w-110 p-5 bg-white shadow-md cursor-pointer" on:click={handleModalOpen}>
        <img src="/img/logo2.png" alt="" class="ring-2 ring-gray-400">
        <h2 class="text-center font-bold text-blue-400 p-3 hover:text-blue-500"> View Offers and Promotions</h2>
       </div>
        {:else if currentTab === "Training"}
        <div class="max-w-110 p-5 bg-white shadow-md cursor-pointer" on:click={handleModalOpen}>
            <img src="/img/ClassRoom1.jpeg" alt="" class="ring-2 ring-gray-400">
            <h2 class="text-center font-bold text-blue-400 p-3 hover:text-blue-500"> View Facilities and Training Gallery</h2>
        </div>
        
        {/if}
    </div>
    {#if modalOpen===true}
    <GalleryModal galItem={currentTab} modalOpen={modalOpen} on:modalClose={handleModalClose}/>
    {/if}
</section>