<script lang="ts">
  import { onMount } from "svelte";
  import { dataStore, loadData } from "../stores/dataStore";
  import Sidebar from "../components/Sidebar.svelte";
  import Navbar from "../components/Navbar.svelte";
  import StatCard from "../components/StatCard.svelte";
  import TransactionChart from "../components/TransactionChart.svelte";

  onMount(loadData);
</script>

<div class="flex h-screen bg-gray-50">
  <Sidebar />
  
  <div class="flex-1 overflow-auto">
    <Navbar />
    
    <main class="p-6 space-y-6">
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
    </main>
  </div>
</div>