<script lang="ts">
  import { dataStore } from "$lib/stores/dataStore";
</script>

<aside class="w-64 bg-white shadow-md">
  <div class="p-4 font-bold text-xl">Menu</div>
  <ul>
    {#if $dataStore}
      {#each $dataStore.menu as item}
        <li class="p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2">
          {item.title}
        </li>
      {/each}
    {/if}
  </ul>
</aside>
