<script>
    export let black=false;
</script>
<h4 class="text-lg md:text-md  p-5 flex items-center justify-center font-body {black?'text-white':'text-gray-400'}">
    <slot></slot>
</h4>