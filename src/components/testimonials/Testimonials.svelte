<script>


import LargeHeading from "../../shared/LargeHeading.svelte";
import TestmContent from "./TestmContent.svelte";
import TestmNav from "./TestmNav.svelte";


let Testimonials =[{
    id:1,
    title:"Life changing course!",
    name:"Melbin CM",
    designation:"Engineer,Google,California",
    content:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem, repudiandae.",
    img:"dummy.jpeg"
},{
    id:2,
    title:"pwoli sanam m#$%#",
    name:"Melbin CM",
    designation:"Engineer,Google,California",
    content:"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam officia cum excepturi nesciunt eum molestias!",
    img:"dummy.jpeg"
},{
    id:3,
    title:"stupendous",
    name:"Melbin CM",
    designation:"Engineer,Google,California",
    content:"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam officia cum excepturi nesciunt eum molestias!",
    img:"dummy.jpeg"
},{
    id:4,
    title:"stupendous2",
    name:"Melbin CM",
    designation:"Engineer,Google,California",
    content:"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam officia cum excepturi nesciunt eum molestias!",
    img:"dummy.jpeg"
},{
    id:5,
    title:"stupendous3",
    name:"Melbin CM",
    designation:"Engineer,Google,California",
    content:"Lorem ipsum dolor sit amet consectetur, adipisicing elit. Numquam officia cum excepturi nesciunt eum molestias!",
    img:"dummy.jpeg"
}]

let viewArray=[];
let numItems=1;

let maxItems= parseInt(Testimonials.length);

$:maxItems;
if(window.innerWidth<=720){
    numItems=1;
}else if(window.innerWidth<=1280){
    numItems=2;
}else if(window.innerWidth<=1920){
    numItems=2;
}else if(window.innerWidth>1920){
    numItems=3;
}
let start=0,end=numItems;
$:start,end;
const addViewItems=(start,end)=>{

    viewArray=[];
    for(let i =start;i<end;i++){
        viewArray.push(Testimonials[i]);
    } 
}
addViewItems(start,end);

const handleRightClick=()=>{
     if(end>=maxItems){
         start=0;
         end=numItems;
         addViewItems(start,end);
     }else if(end+numItems>maxItems){
        end=maxItems
        start=end-(maxItems%numItems);
        addViewItems(start,end);
     }else{
         start+=numItems;
         end=end+numItems;
         addViewItems(start,end);
     }

}
const handleLeftClick=()=>{
    if(end<=numItems){
         end=maxItems;
         start=end-numItems;
         addViewItems(start,end);
     }else if(start-numItems<0){
         start=0
         end=numItems;
         addViewItems(start,end);
     }else{
         end-=numItems;
         start=start-numItems;
         addViewItems(start,end);
     }
}
</script>

<section id="Testimonials" class="p-5 flex flex-col justify-center items-center my-24 w-screen overflow-hidden">
   <div class="md:w-2/3">
    <div class="">
        <LargeHeading> <div class=""><i class="fas fa-quote-left absolute text-gray-300 text-6xl"></i><h2 class="text-left relative pt-10 pl-3">What People are Saying about Edustar?</h2></div> </LargeHeading>
        <div class="absolute right-3 inline-block">
            <TestmNav currentItemNum={end} maxItems={maxItems} on:leftNavClick={handleLeftClick} on:rightNavClick={handleRightClick}/>
        </div>
    </div>
<div class="h-96 overflow-hidden">
    <div class="flex flex-col md:flex-row justify-evenly items-center flex-wrap py-10" >
        {#each viewArray as Testimonial(Testimonial.id)}
        <TestmContent Testimonial={Testimonial}>{Testimonial.content}</TestmContent>
        {/each}
    </div>
</div>
</div>
</section>