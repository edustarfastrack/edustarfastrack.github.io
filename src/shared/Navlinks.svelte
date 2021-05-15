<script>
    let navlinks=[
       {id:1,name:"Home",section:"#Home"},
       {id:2,name:"Courses",section:"#Courses"},
       {id:3,name:"AboutUs",section:"#AboutUs"},
       {id:4,name:"Testimonials",section:"#Testimonials"},
       {id:5,name:"Contact Us",section:"#ContactUS"}

]
</script>
<div class="inline-block">
    <ul class="flex flex-col md:flex-row">
    {#each navlinks as navlink(navlink.id)}
    <li class="p-5"><a href="{navlink.section}"class="hover:no-underline">{navlink.name}</a><li>
    {/each}
    </ul>
</div>