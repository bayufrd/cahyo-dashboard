<script lang="ts">
  import { dataStore } from "$stores/dataStore";
</script>

<nav class="bg-white shadow p-4 flex justify-end">
  {#if $dataStore}
    <div class="flex items-center gap-3">
      <span class="font-semibold">{$dataStore.profile.name}</span>
      <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white">
        { $dataStore.profile.name[0] }
      </div>
    </div>
  {/if}
</nav>
