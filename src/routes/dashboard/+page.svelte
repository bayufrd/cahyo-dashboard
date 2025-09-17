<script lang="ts">
  import { dataStore } from '$lib/stores/dataStore';
  import StatCard from '$lib/components/StatCard.svelte';
  import TransactionChart from '$lib/components/TransactionChart.svelte';
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
  
  {#if $dataStore}
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
  {/if}
</div>