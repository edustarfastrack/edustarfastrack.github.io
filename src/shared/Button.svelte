<script>
    export let type = "primary";
    export let rounded = false;
    export let inverted= false;
 
</script>
<button class="px-5 py-3 {rounded?'rounded-full':'rounded-none'} {inverted&&type==='primary'?'bg-none ring':inverted && type==='secondary'? 'ring-2 ring-green-400': !inverted&&type==='primary'?'bg-blue-600 text-white hover:bg-blue-500': !inverted&&type==='secondary'?'bg-red-400 hover:bg-red-300':''} "   on:click>
    <slot></slot>
</button>