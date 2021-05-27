<script>
import Button from "../../shared/Button.svelte";

</script>
<div class="bg-white p-5 w-full rounded w-86 md:w-110" id="#Message">
    <h2 class="font-dispalay text-2xl p-3">Get a Quote</h2>
    <form class=""  action="https://api.web3forms.com/submit"
    method="POST"
    id="form"
    
    novalidate>
        <div class="flex flex-col md:flex-row flex-wrap justify-evenly items-center w-full">
            <div class="flex flex-col w-full md:w-max">
                <input
            type="hidden"
            name="subject"
            value="Edustar new customer"
          />
                <label for="Name" class="text-left"> Name</label>
                <div
                class="empty-feedback invalid-feedback text-red-400 text-sm mt-1"
              >
                Invalid Name
              </div>
                <input type="text" class="ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300" name="name" required>
                <label for="Email" class="text-left">Email</label>
                <input type="email" class="ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300" name="email" required>
                <label for="Phone" class="text-left" type="text"
                name="phone"
                id="phone"
                placeholder="+1 (555) 1234-567"
                required>Phone</label>
                <input type="tel" pattern="[0-9]{10}" class="ring-2 ring-blue-200 p-2 my-3 w-full rounded outline-none focus:ring-2 focus:ring-red-300"/>
            </div>
            <div class="w-full md:w-max">
                <label for="Message" class="text-left block">Message</label>
                <textarea   cols="30" rows="10" 
                name="message"
                id="message"
                placeholder="Your Message" class="w-full bg-blue-100 focus:ring-2 focus:ring-red-300  p-2 my-3 rounded outline-none" required></textarea>
            </div>
        </div>
        <div class="text-center">
            <button><Button type="secondary"  rounded>Submit</Button></button>
        </div>
    </form>
</div>