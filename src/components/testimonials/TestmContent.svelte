<script>
import Subtext from "../../shared/Subtext.svelte";
import {fade,slide} from 'svelte/transition';
export let Testimonial;
</script>
<div class="p-5 w-full md:w-1/2 lg:w-2/5"  transition:fade|local>
    <h3>{Testimonial.title}</h3>
    <Subtext><slot></slot></Subtext>
    <div class="">
        <img src="/img/{Testimonial.img}" alt="{Testimonial.img}" class="w-24 rounded-full">
        <div class="">
            <h4>{Testimonial.name}</h4>
            <p>{Testimonial.designation}</p>
        </div>
    </div>
</div>