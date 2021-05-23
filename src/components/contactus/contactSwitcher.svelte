<script>
import { createEventDispatcher } from "svelte";

import ContactSwBtn from "./ContactSwBtn.svelte";
let dispatch=createEventDispatcher();
export let currentItem;
</script>
<div class="">
    
    <ContactSwBtn icon="phone" subtext="+91 9744412045" selected={currentItem==="Phone"?true:false}  on:click={()=>{
        dispatch('TabChange',"Phone");
    }}/>
  
    <ContactSwBtn icon="map-marker-alt" subtext="Nedumkanadam,Idukki" selected={currentItem==="Address"?true:false} on:click={()=>{
        dispatch('TabChange',"Address");
    }} />
    
    <ContactSwBtn icon="comment" subtext="send message" selected={currentItem==="Message"?true:false} on:click={()=>{
        dispatch('TabChange',"Message");
    }}/>
    
   
</div>