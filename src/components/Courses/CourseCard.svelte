<script>
import Button from "../../shared/Button.svelte";
import Subtext from "../../shared/Subtext.svelte";
    export let redCard=false;
    export let cardTitle;
</script>
<div class="w-72 p-5 m-5 border-r-2 md:border-r-0  border-l-2 border-gray-200 {redCard?'bg-blue-600 border-0':'bg-none'}">
    <h2 class="font-bold text-2xl {redCard?'text-white':'text-black'} font-Display">{cardTitle}</h2>
    <Subtext black={redCard}>
        <slot></slot>
    </Subtext>
    <Button rounded type="{redCard?'secondary':'primary' }" inverted={!redCard}>Learn More..</Button>
</div>