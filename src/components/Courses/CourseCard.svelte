<script>
import Button from "../../shared/Button.svelte";
import Subtext from "../../shared/Subtext.svelte";
import { scrollto } from "svelte-scrollto";
    export let redCard=false;
    export let cardTitle;
    export let order;
</script>
<div class="w-72 md:w-96 p-5 m-5 border-r-2 md:border-r-0  border-l-2 border-gray-200 {order} {redCard? 'bg-blue-600 border-0 md:-mt-5':'bg-none'}">
    <h2 class="font-bold text-2xl {redCard?'text-white':'text-black'} font-Display">{cardTitle}</h2>
    <Subtext black={redCard}>
        <slot></slot>
    </Subtext>
    <a href="#ContactUs" use:scrollto={'#ContactUs'}>
        <Button rounded type="{redCard?'secondary':'primary' }" inverted={!redCard} >Learn More..</Button>
    </a>
    
</div>