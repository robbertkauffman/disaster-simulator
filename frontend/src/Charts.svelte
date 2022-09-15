<script>
  import Chart from 'chart.js/auto';
  import 'chartjs-adapter-luxon';
  import { onMount } from 'svelte';

  export let socket;

  // visualize max 2 minutes of data
  const MAX_DATAPOINTS = 120;
  let chart;

  // Chart.defaults.font.family = "var(--bs-font-sans-serif)";
  Chart.defaults.font.family = 'system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans","Liberation Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji"';
  const chartConfig = {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'findOne',
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgb(255, 99, 132)',
          data: [],
        },
        {
          label: 'insertOne',
          backgroundColor: 'rgb(132, 99, 255)',
          borderColor: 'rgb(132, 99, 255)',
          data: [],
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          text: 'Max latency by operation',
          display: true,
          color: '#212529',
          font: {
            size: 32,
            weight: '500'
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'second',
          }
        },
        y: {
          beginAtZero: true,
          title: {
            text: 'Max latency in ms',
            display: true,
            color: '#212529',
            font: {
              size: 16
            }
          }
        }
      }
    }
  };

  onMount(() => {
    chart = new Chart(document.getElementById('latencyChart'), chartConfig);
    listenForLogRequest();
  });

  function listenForLogRequest() {
    socket.on('logRequest', data => {
      if (data) {
        addRequest(data);
      }
    });
  }

  function addRequest(request) {
    if (request.ts) {
      request.ts = new Date(request.ts);
    } else {
      request.ts = new Date();
    }

    const idx = chart.data.datasets.findIndex(dataset => dataset.label === request.operation);
    if (idx !== -1) {
      const dataset = chart.data.datasets[idx];
      dataset.data.push({
        x: request.ts,
        y: Math.max(...request.latency)
      });
      // only visualize recent data
      if (dataset.data.length > MAX_DATAPOINTS) {
        dataset.data.shift();
      }
      chart.update();
    } else {
      console.log(`Error while adding data to chart: no dataset defined for operation type: ${operationType}`);
    }
  }
</script>

<div class="col-8">
  <div class="chart-container">
    <canvas id="latencyChart"></canvas>
  </div>
</div>

<style>
  .chart-container {
    height: 300px;
    width: 100%;
    margin-bottom: 25px;
  }
</style>