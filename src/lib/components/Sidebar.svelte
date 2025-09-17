<script lang="ts">
  import { page } from '$app/stores';
  import { dataStore } from '$lib/stores/dataStore';

  function titleToRoute(title: string): string {
    return `/${title.toLowerCase().replace(/\s+/g, '-')}`;
  }
</script>

<aside class="w-64 bg-white border-r h-screen flex flex-col">
  <div class="p-6 border-b">
    <h2 class="text-xl font-bold text-gray-800">Menu</h2>
  </div>
  
  <nav class="flex-1 p-4 overflow-y-auto">
    {#if $dataStore?.menu}
      <ul>
        {#each $dataStore.menu as menuItem}
          <li class="mb-2">
            <a 
              href={titleToRoute(menuItem.title)} 
              class="block px-4 py-2 rounded-md transition-colors duration-200 
              {$page.url.pathname === titleToRoute(menuItem.title) 
                ? 'bg-blue-100 text-blue-600' 
                : 'hover:bg-gray-100 text-gray-700'}"
            >
              {menuItem.title}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </nav>
</aside>