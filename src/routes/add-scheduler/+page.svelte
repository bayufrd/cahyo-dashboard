<script lang="ts">
  let formData = {
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  };

  function handleSubmit() {
    // Logika submit form
    console.log(formData);
  }
</script>

<div class="space-y-6">
  <h1 class="text-2xl font-bold mb-4">Tambah Scheduler Baru</h1>
  
  <form on:submit|preventDefault={handleSubmit} class="bg-white shadow-md rounded-lg p-6 space-y-4">
    <div>
      <label for="name" class="block mb-2 font-semibold">Nama Scheduler</label>
      <input 
        type="text" 
        id="name" 
        bind:value={formData.name}
        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        required 
      />
    </div>

    <div>
      <label for="description" class="block mb-2 font-semibold">Deskripsi</label>
      <textarea 
        id="description" 
        bind:value={formData.description}
        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
        rows="4"
      ></textarea>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="startDate" class="block mb-2 font-semibold">Tanggal Mulai</label>
        <input 
          type="date" 
          id="startDate" 
          bind:value={formData.startDate}
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          required 
        />
      </div>
      <div>
        <label for="endDate" class="block mb-2 font-semibold">Tanggal Selesai</label>
        <input 
          type="date" 
          id="endDate" 
          bind:value={formData.endDate}
          class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
          required 
        />
      </div>
    </div>

    <div class="pt-4">
      <button 
        type="submit" 
        class="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Simpan Scheduler
      </button>
    </div>
  </form>
</div>