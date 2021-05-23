<script>
import LargeHeading from "../../shared/LargeHeading.svelte";
import AddressTab from "./AddressTab.svelte";
import ContactSwitcher from "./contactSwitcher.svelte";
import MessageTab from "./MessageTab.svelte";
import PhoneTab from "./PhoneTab.svelte";

let currentItem="Message";

const handleTabChange=(e)=>{
    currentItem=e.detail;
}
</script>
<section id="ContactUs" class="flex flex-col justify-center items-center p-5 text-center  bg-pink-600 w-screen overflow-hidden">
    <LargeHeading black={false}><h2 class="font-bold">Get In Touch</h2></LargeHeading>
   <div class="flex items-center justify-around md:py-24">
    <div class="hidden md:block">
        <img src="/img/bro.png" alt="contact Us illlustration">
    </div>
    <div class="flex flex-col justify-center items-center">
        <ContactSwitcher currentItem={currentItem} on:TabChange={handleTabChange}/>
       <div class="">
        {#if currentItem==="Message"}
        <MessageTab/>
        {:else if currentItem==="Phone"}
        <PhoneTab/>
        {:else if currentItem==="Address"}
        <AddressTab/>
        {/if}
       </div>
    </div>
   </div>
</section>