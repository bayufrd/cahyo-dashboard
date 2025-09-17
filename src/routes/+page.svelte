<script lang="ts">
  import { dataStore } from '$lib/stores/dataStore';
  import StatCard from '$lib/components/StatCard.svelte';
  import TransactionChart from '$lib/components/TransactionChart.svelte';
</script>

{#if $dataStore}
  <div class="space-y-6">
    <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
    
    <div class="grid grid-cols-3 gap-6">
      <StatCard 
        title="Total Transactions" 
        value={$dataStore.transactions.total} 
        color="blue" 
      />
      <StatCard 
        title="Failed Transactions" 
        value={$dataStore.transactions.failed} 
        color="red" 
      />
      <StatCard 
        title="Successful Transactions" 
        value={$dataStore.transactions.successful} 
        color="green" 
      />
    </div>

    <TransactionChart data={$dataStore.transactions.weekly} />
  </div>
{:else}
  <div class="bg-white shadow-md rounded-lg p-6 text-center text-gray-500">
    Tidak ada data yang tersedia
  </div>
{/if}