<script lang="ts">
  export let title: string;
  export let value: number;
  export let color: 'blue' | 'red' | 'green' = 'blue';
</script>

<div class="bg-white shadow-md rounded-lg p-5 border">
  <div class="flex justify-between items-center">
    <div>
      <p class="text-sm font-medium text-gray-500 mb-2">{title}</p>
      <p 
        class="text-2xl font-bold" 
        class:text-blue-500={color === 'blue'}
        class:text-red-500={color === 'red'}
        class:text-green-500={color === 'green'}
      >
        {value.toLocaleString()}
      </p>
    </div>
  </div>
</div>