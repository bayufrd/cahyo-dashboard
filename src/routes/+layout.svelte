<script lang="ts">
  import { page } from '$app/stores';
  import { dataStore, loadData } from '$lib/stores/dataStore';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { onMount } from 'svelte';
  import '../app.css';

  onMount(loadData);

  function titleToRoute(title: string): string {
    return `/${title.toLowerCase().replace(/\s+/g, '-')}`;
  }
</script>

<div class="flex h-screen bg-gray-50">
  <Sidebar />
  
  <div class="flex-1 flex flex-col overflow-hidden">
    <Navbar />
    
    <main class="flex-1 overflow-auto p-6">
      <slot />
    </main>
  </div>
</div>