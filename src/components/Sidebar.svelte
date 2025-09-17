<script lang="ts">
  import { dataStore } from "../stores/dataStore";
  import { page } from "$app/stores"
</script>

<aside class="w-64 bg-white border-r h-screen">
  <div class="p-6 border-b">
    <h2 class="text-xl font-bold text-gray-800">Dashboard</h2>
  </div>
  
  <nav class="p-4">
    {#if $dataStore?.menu}
      <ul>
        {#each $dataStore.menu as menuItem}
          <li 
            class="px-4 py-2 rounded-md mb-2 flex items-center gap-3 
            {$page.url.pathname === menuItem.title.toLowerCase() 
              ? 'bg-blue-100 text-blue-600' 
              : 'hover:bg-gray-100 text-gray-700'}"
          >
            <!-- Asumsikan Anda menggunakan library icon seperti Lucide atau Heroicons -->
            <span>{menuItem.title}</span>
          </li>
        {/each}
      </ul>
    {/if}
  </nav>
</aside>
