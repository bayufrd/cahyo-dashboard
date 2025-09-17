<script>
  export let title;
  export let value;
  export let color = "blue";
</script>

<div class="bg-white p-6 rounded-xl shadow text-center">
  <h3 class="text-sm text-gray-500">{title}</h3>
  <p class={`text-2xl font-bold text-${color}-600`}>{value.toLocaleString()}</p>
</div>
