<script>


import LargeHeading from "../../shared/LargeHeading.svelte";
import TestimonialModal from "./TestimonialModal.svelte";
import TestmContent from "./TestmContent.svelte";
import TestmNav from "./TestmNav.svelte";


let Testimonials =[{
    id:1,
    title:"Best IELTS training center one can find!",
    name:"Angel Rose",
    designation:"Engineer,Google,California",
    content:"Edustar is the best IELTS training center one can find. When I first joined I was nervous and not confident at all for attending the IELTS exam. But with just one month class, my standard of English along with my confidence increased to a great extend.My instructor Sunil sir was very friendly and professional. He always available for help and supported me to prepare better for my weakest sections and at the same time gave me valuable feedback on my performance based on the regular practice tests in the class. The advice I got really helped me face the test with more confidence and helped me to achieve my desired score of individual 7. Study material provided by Edustar was a very good resource for preparing for IELTS.All thanks to Sunil sir who was with me in every step of my way.I highly recommend Edustar Academy to all IELTS preparing candidates.",
    img:"AngelRose.jpeg"
},{
    id:2,
    title:`Join “EDUSTAR”  if you really want to succeed in your life`,
    name:"Neethumol John",
    designation:"Canada",
    content:`“To be honest, I was not proficient at all in English language when I started learning IELTS under Sunil sir supervision.I just want to say a massive thanks for your assistance to made me confident and achieve my dreams. I would say, to the least, You are my life saver and I don’t think I could be able to transform my life without you sir. I would recommend “EDUSTAR”  if you really want to succeed in your life.  Sunil sir is such a wonderful person who can guide, motivate and support you throughout your English learning journey.”`,
    img:"Neethumol.jpeg"
},{
    id:3,
    title:"Massive THANK YOU to Sunil Sir",
    name:"Linda Alias",
    designation:"United Kingdom",
    content:"Massive THANK YOU to Sunil Sir for his help and support.Sir has been fantastic, his guidance and tailored approach was the key to my success! I would strongly recommend Edustar   Institute to everyone who gets stuck and cannot progress with IELTS.Thank you once again!",
    img:"LindaAlias.jpeg"
},{
    id:4,
    title:"My heartfelt thanks to EDUSTAR IELTS Academy",
    name:"Geroge Kutty",
    designation:"Canada",
    content:"Dr.Sunil Sir , his way of teaching and giving attention to each student is nice.Practice makes man perfect, so this is also a place where practice gain, learnt many things during his classes.  It helps me to pin point my week areas/skills in English.He shared a lot of material to help improve our vocabulary. We were also given a lot of practice material and online practice sessions.He kept all the sessions interactive and constantly helped us improve in all aspects.Overall this is an excellent academy to recommend others. my heartfelt thanks to EDUSTAR IELTS Academy.",
    img:"GeorgeKutty.jpg"
},{
    id:5,
    title:"Extremely patient in helping me address the elusive aspects of the IELTS",
    name:"Tom Thomas",
    designation:"Engineer,Google,California",
    content:"Dr. Sunil Devaprabha of EDU star (Idukki), was extremely patient in helping me address the elusive aspects of the IELTS, which were imperative to getting my required score . Regardless of the volume of students in the session, I always got personalized attention. It was the EDU Star  community's overall commitment that helped me achieve the band I wanted",
    img:"TomThomas.jpeg"
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
let interval
const modalClose=()=>{
    interval = setInterval(()=>{
    handleRightClick();
},5000);
}
modalClose();
const modalOpen=()=>{
clearInterval(interval);
}
</script>

<section id="Testimonials" class="p-5 flex flex-col justify-center items-center my-24 w-screen overflow-hidden">
   <div class="md:w-2/3">
    <div class="">
        <LargeHeading> <div class=""><i class="fas fa-quote-left absolute text-gray-300 text-6xl"></i><h2 class="text-left relative pt-10 pl-3">What People say about Edustar?</h2></div> </LargeHeading>
        <div class="absolute right-3 inline-block">
            <TestmNav currentItemNum={end} maxItems={maxItems} on:leftNavClick={handleLeftClick} on:rightNavClick={handleRightClick}/>
        </div>
    </div>
</div>
<div class="h-110 overflow-hidden">
    <div class="flex flex-col md:flex-row md:justify-evenly justify-center items-center flex-wrap py-10" >
        {#each viewArray as Testimonial(Testimonial.id)}
        
        <TestmContent Testimonial={Testimonial} on:modalOpen={modalOpen} on:modalClose={modalClose}>{Testimonial.content.slice(0,190)}...</TestmContent>
        
        {/each}
    </div>
</div>

</section>