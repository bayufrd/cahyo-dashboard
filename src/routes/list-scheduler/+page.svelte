<script lang="ts">
  import { dataStore } from '$lib/stores/dataStore';
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold mb-4">List Scheduler</h1>
  
  {#if $dataStore && $dataStore.menu.length > 0}
    <div class="bg-white shadow-md rounded-lg p-6">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="p-3">No</th>
            <th class="p-3">Nama</th>
            <th class="p-3">Status</th>
            <th class="p-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {#each $dataStore.menu as menuItem, index}
            <tr class="border-b">
              <td class="p-3">{index + 1}</td>
              <td class="p-3">{menuItem.title}</td>
              <td class="p-3">
                <span class="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                  Aktif
                </span>
              </td>
              <td class="p-3">
                <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                  Edit
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <div class="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
      Tidak ada scheduler yang tersedia
    </div>
  {/if}
</div>