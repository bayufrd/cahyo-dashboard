<script lang="ts">
  import { dataStore } from "../stores/dataStore";
</script>

<nav class="bg-white shadow p-4 flex justify-end items-center">
  {#if $dataStore?.profile}
    <div class="flex items-center gap-3">
      <div class="flex flex-col items-end">
        <span class="font-semibold">{$dataStore.profile.name}</span>
        <span class="text-xs text-gray-500">{$dataStore.profile.role}</span>
      </div>
      <div 
        class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white uppercase font-bold"
      >
        {$dataStore.profile.name[0]}
      </div>
    </div>
  {/if}
</nav>