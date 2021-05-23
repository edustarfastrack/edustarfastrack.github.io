<script>
export let icon;
export let subtext;
export let selected=false;

</script>

    <div class="p-5 m-3 inline-block rounded-xl {selected?'bg-red-400':''} cursor-pointer" on:click>
        <div class="text-xl text-white">
            <i class="fas fa-{icon}"></i>
        </div>
        <p class="font-body text-white font-bold">{subtext}</p>
    </div>


