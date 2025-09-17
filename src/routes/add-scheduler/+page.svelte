<script lang="ts">
  import Sidebar from '$components/Sidebar.svelte';
  import Navbar from '$components/Navbar.svelte';
</script>

<div class="flex h-screen bg-gray-50">
  <Sidebar />
  
  <div class="flex-1 overflow-auto">
    <Navbar />
    
    <main class="p-6">
      <h1 class="text-2xl font-bold mb-6">Add Scheduler</h1>
      <!-- Tambahkan form untuk menambah scheduler -->
    </main>
  </div>
</div>