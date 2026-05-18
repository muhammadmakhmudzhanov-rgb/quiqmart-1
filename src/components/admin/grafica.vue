<script setup lang="ts">
import { ref, computed, onBeforeMount } from 'vue'
import Cookies from 'js-cookie'
import { useMainStore } from '../../pinia/useItemsStore'

import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
} from 'chart.js'

import { Line } from 'vue-chartjs'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  Filler,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
)

// =====================
// STORE + TOKEN
// =====================
const usestore = useMainStore()
const token = Cookies.get('token')

// =====================
// STATE
// =====================
const labels = ref<string[]>([])
const values = ref<number[]>([])
const loading = ref(true)

// =====================
// FETCH STATS
// =====================
const loadStats = async () => {
  try {
    loading.value = true

    const res = await fetch(
      `http://${usestore.text}/seller/stats`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    labels.value = data.map((i: any) => i.day)
    values.value = data.map((i: any) => i.total)

  } catch (err) {
    console.log('stats error:', err)
  } finally {
    loading.value = false
  }
}

// =====================
// INIT
// =====================
onBeforeMount(() => {
  loadStats()
})

// =====================
// CHART DATA (REAL)
// =====================
const chartData = computed(() => ({
  labels: labels.value,

  datasets: [
    {
      label: 'Продажи',

      data: values.value,

      borderColor: '#6366f1',

      backgroundColor: (context: any) => {
        const chart = context.chart
        const { ctx, chartArea } = chart

        if (!chartArea) return null

        const gradient = ctx.createLinearGradient(
          0,
          chartArea.top,
          0,
          chartArea.bottom
        )

        gradient.addColorStop(0, 'rgba(99,102,241,0.35)')
        gradient.addColorStop(1, 'rgba(99,102,241,0)')

        return gradient
      },

      fill: true,
      tension: 0.45,
      borderWidth: 4,
      pointRadius: 0,
      pointHoverRadius: 6,
      pointHoverBackgroundColor: '#6366f1'
    }
  ]
}))

// =====================
// OPTIONS
// =====================
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  interaction: {
    intersect: false,
    mode: 'index' as const
  },

  plugins: {
    legend: {
      display: false
    },

    tooltip: {
      backgroundColor: '#111827',
      padding: 12,
      displayColors: false,

      callbacks: {
        label: function (context: any) {
          return `${context.raw} сом`
        }
      }
    }
  },

  scales: {
    x: {
      grid: {
        display: false
      },
      border: {
        display: false
      },
      ticks: {
        color: '#94a3b8'
      }
    },

    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(148,163,184,0.1)'
      },
      border: {
        display: false
      },
      ticks: {
        color: '#94a3b8',
        callback: (value: any) => value + ' сом'
      }
    }
  }
}
</script>

<template>
  <div class="chart-card">

    <div class="chart-header">

      <div>
        <p class="mini-title">
          Аналитика
        </p>

        <h2>
          Продажи за неделю
        </h2>
      </div>

      <div class="income">
        +12.4%
      </div>

    </div>

    <div class="chart-wrapper">
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>

  </div>
</template>

<style scoped>

.chart-card {
  background: white;

  border-radius: 32px;

  padding: 28px;

  box-shadow:
    0 10px 40px rgba(15,23,42,0.06);

  border:
    1px solid rgba(226,232,240,0.8);
}

.chart-header {
  display: flex;

  align-items: center;

  justify-content: space-between;

  margin-bottom: 24px;
}

.mini-title {
  color: #94a3b8;

  font-size: 14px;

  font-weight: 600;

  margin-bottom: 6px;
}

h2 {
  font-size: 28px;

  font-weight: 800;

  color: #0f172a;

  letter-spacing: -1px;
}

.income {
  background:
    linear-gradient(
      135deg,
      #dcfce7,
      #bbf7d0
    );

  color: #16a34a;

  font-size: 14px;

  font-weight: 800;

  padding: 10px 16px;

  border-radius: 999px;
}

.chart-wrapper {
  height: 340px;
}

@media (max-width: 700px) {

  .chart-card {
    padding: 20px;
  }

  h2 {
    font-size: 22px;
  }

  .chart-wrapper {
    height: 260px;
  }

}

</style>