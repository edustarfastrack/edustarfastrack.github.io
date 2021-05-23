<script>
    import { scrollto } from "svelte-scrollto";
    import {slide} from 'svelte/transition';
    let navlinks=[
       {id:1,name:"Home",section:"#Home"},
       {id:2,name:"Courses",section:"#Courses"},
       {id:3,name:"AboutUs",section:"#AboutUs"},
       {id:4,name:"Testimonials",section:"#Testimonials"},
       {id:5,name:"Contact Us",section:"#ContactUs"}

]

$:mobileNav=false;
</script>
<div class="inline-block mt-5">
<div class="inline-block md:hidden p-5 mt-3 hover:text-blue-600" on:click="{()=>{
    mobileNav=!mobileNav;
}}">

    <span class="fas fa-bars text-2xl"></span>
</div>
    <nav class="md:inline-block hidden">
        <ul class="flex flex-col md:flex-row">
        {#each navlinks as navlink(navlink.id)}
        <li class="p-5 text-xl"><a href="{navlink.section}"class="hover:text-purple-700 no-underline" use:scrollto='{navlink.section}'>{navlink.name}</a></li>
        {/each}
        </ul>
    </nav>
    {#if mobileNav}
    <nav class="{mobileNav?'fixed block left-0 w-full bg-purple-100':'hidden'}" transition:slide>
        <ul class="flex flex-col md:flex-row justify-center items-center">
        {#each navlinks as navlink(navlink.id)}
        <li class="p-5 text-xl"><a href="{navlink.section}"class="hover:text-purple-700 no-underline" use:scrollto='{navlink.section}' on:click={()=>{
            mobileNav=!mobileNav;
        }}>{navlink.name}</a></li>
        {/each}
        </ul>
    </nav>
    {/if}
        
    
</div>