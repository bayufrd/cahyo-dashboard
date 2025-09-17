<script lang="ts">
  import { onMount } from "svelte";
  import Chart from "chart.js/auto";

  export let data: number[];

  let canvas: HTMLCanvasElement;

  onMount(() => {
    new Chart(canvas, {
      type: "line",
      data: {
        labels: ["Day 1","Day 2","Day 3","Day 4","Day 5","Day 6","Day 7"],
        datasets: [{
          label: "Transactions",
          data,
          borderColor: "green",
          backgroundColor: "rgba(0, 200, 0, 0.2)",
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  });
</script>

<div class="bg-white p-6 rounded-xl shadow">
  <canvas bind:this={canvas}></canvas>
</div>
