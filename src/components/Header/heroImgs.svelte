<script>
    export let blue=false;
</script>

{#if blue===true}
<div class="flex  md:block justify-center">
    <div class="absolute w-96  md:w-72 lg:w-96   md:bottom-36 md:left-2">
        <img src="/img/heroImg1.png" alt="" class="absolute w-full">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path fill="#ff784e" d="M33.8,-45.7C46.3,-37.4,60.8,-30.9,64.8,-20.6C68.8,-10.2,62.4,4,58.1,19.4C53.8,34.8,51.7,51.5,42.3,58.8C33,66.1,16.5,64.1,-1.3,65.9C-19.1,67.6,-38.1,73.2,-46.9,65.7C-55.7,58.2,-54.1,37.6,-57.3,20.4C-60.4,3.2,-68.1,-10.7,-66.2,-23.1C-64.4,-35.5,-53,-46.3,-40.3,-54.6C-27.7,-62.9,-13.8,-68.6,-1.6,-66.4C10.6,-64.2,21.2,-54,33.8,-45.7Z" transform="translate(100 100)" />
        </svg>
    </div>
</div>
{:else}
<div class="absolute w-96 md:w-72 lg:w-96  bottom-36 md:right-2  hidden  md:block">
    <img src="/img/heroImg2.png" alt="" class="absolute bottom-6 w-full">
<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path fill="#0F62FE" d="M43,-59.8C49.4,-54.4,44,-33.5,46.7,-17.1C49.5,-0.7,60.3,11.2,59.9,21.6C59.5,32,47.9,40.9,36,53.4C24.1,65.8,12.1,81.8,-2.9,85.7C-17.8,89.7,-35.6,81.6,-47.5,69.2C-59.4,56.8,-65.3,40,-69.7,23.4C-74.1,6.8,-76.9,-9.5,-73.8,-25.5C-70.7,-41.5,-61.8,-57.2,-48.6,-60.3C-35.3,-63.4,-17.6,-53.9,0.3,-54.3C18.3,-54.8,36.5,-65.1,43,-59.8Z" transform="translate(100 100)" />
    </svg>
</div>
{/if}
