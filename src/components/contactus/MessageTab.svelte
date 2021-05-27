<script>
import Button from "../../shared/Button.svelte";
let success=false;
let name,email,phone,message,subject;

$:result = "";
// <input type="hidden" name="apikey" value="68f9da7b-24c5-41f6-8d9e-27ac23c5d94d" />
// const submitForm=(e)=>{
//    let formData={name,email,phone,message,subject};
// //   const formData = new FormData(form);
//   e.preventDefault();
//   var object = {};
  
//   var json = JSON.stringify(formData);
//   result= "Please wait...";

//   fetch("https://api.web3forms.com/submit", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     body: json,
//   })
//     .then(async (response) => {
//       let json = await response.json();
//       if (response.status == 200) {
//         result =json.message;
//        success=true;
//       } else {
//         console.log(response);
//         result = json.message;
//        success=false;
//       }
//     })
//     .catch((error) => {
//       console.log(error);
//       result = "Something went wrong!";
//     })
//     .then(function () {
//       form.reset();
//       setTimeout(() => {
//         result = "";
//       }, 5000);
//     });

// }
const submitForm=()=>{

    const formData = new FormData();
    formData.append("name",name);
    formData.append("email",email);
    formData.append("phone",phone);
    formData.append("subject"," New Customer Query");
    formData.append("apikey","68f9da7b-24c5-41f6-8d9e-27ac23c5d94d");
 
    var object = {};
    formData.forEach((value, key) => {
        object[key] = value
    });
    var json = JSON.stringify(object);
    result="Please wait..";
    fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                success=true;
                result = json.message;
            } else {
                success=false;
                console.log(response);
                result = json.message;
            }
        })
        .catch(error => {
            console.log(error.message);
            result = "Something went wrong!"
        })
        .then(function() {
            name="";
            email="";
            phone="";
            message="";
            setTimeout(() => {
                result = "";
            }, 3000);
        });
}
</script>
<div class="bg-white p-5 w-full rounded w-86 md:w-110" id="#Message">
    <h2 class="font-dispalay text-2xl p-3">Get a Quote</h2>
    <form on:submit|preventDefault={submitForm}>
    <p class="text-base text-center {!success?'text-red-400':'text-green-400'}" id="result">{result}</p>
        <div class="flex flex-col md:flex-row flex-wrap justify-evenly items-center w-full">
            <div class="flex flex-col w-full md:w-max">
                <input type="hidden" name="subject" value="Edustar new customer"  />
         
                <label for="Name" class="text-left"> Name</label>
                
                <input type="text" class="ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300" name="name" placeholder="Enter your name"  required bind:value={name}>
                <label for="Email" class="text-left">Email</label>
                <input type="email" class="ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300" name="email" placeholder="Enter your email" bind:value={email} required >
                <label for="Phone" class="text-left" type="text"
                
                required>Phone</label>
                <input type="tel"  class="ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300" name="phone"
                id="phone"
                placeholder="Phone number" bind:value={phone} />
            </div>
            <div class="w-full md:w-max">
                <label for="Message" class="text-left block">Message</label>
                <textarea   cols="30" rows="10" 
                name="message"
                id="message"
                placeholder="Your Message" class="w-full bg-blue-100 focus:ring-2 focus:ring-red-300  p-2 my-3 rounded outline-none" bind:value={message} required></textarea>
            </div>
        </div>
        <div class="text-center">
            <button type="submit" ><Button type="secondary"  rounded>Submit</Button></button>
        </div>
    </form>
</div>