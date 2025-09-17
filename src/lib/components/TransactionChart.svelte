<script lang="ts">
  import { onMount } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  Chart.register(...registerables);

  export let data: number[];

  let chartCanvas: HTMLCanvasElement;

  onMount(() => {
    const ctx = chartCanvas.getContext('2d');
    if (ctx) {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'],
          datasets: [{
            label: 'Weekly Transactions',
            data: data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
            backgroundColor: 'rgba(75, 192, 192, 0.2)'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return new Intl.NumberFormat('en-US', { 
                    notation: 'compact', 
                    compactDisplay: 'short' 
                  }).format(Number(value));
                }
              }
            }
          }
        }
      });
    }
  });
</script>

<div class="bg-white shadow-md rounded-lg p-5 border">
  <h3 class="text-lg font-semibold mb-4">Weekly Transactions</h3>
  <canvas bind:this={chartCanvas}></canvas>
</div>