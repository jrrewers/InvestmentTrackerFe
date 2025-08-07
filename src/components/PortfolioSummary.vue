<template>
  <div class="grid">
    <div class="col-12 md:col-3">
      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-wallet text-4xl text-blue-500 mb-3"></i>
            <div class="text-2xl font-bold text-900" v-if="!isLoading && portfolio">
              {{ formatCurrency(portfolio?.totalValue.amount || 0, portfolio?.totalValue.currency) }}
            </div>
            <Skeleton v-else height="2rem" class="mb-2"></Skeleton>
            <div class="text-600">Total Value</div>
          </div>
        </template>
      </Card>
    </div>
    
    <div class="col-12 md:col-3">
      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-chart-line text-4xl text-green-500 mb-3"></i>
            <div class="text-2xl font-bold text-900" v-if="!isLoading && portfolio">
              {{ totalPnL.toFixed(2) }}
            </div>
            <Skeleton v-else height="2rem" class="mb-2"></Skeleton>
            <div class="text-600">Total P&L</div>
          </div>
        </template>
      </Card>
    </div>
    
    <div class="col-12 md:col-3">
      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-list text-4xl text-purple-500 mb-3"></i>
            <div class="text-2xl font-bold text-900" v-if="!isLoading && portfolio">
              {{ portfolio?.positions.length || 0 }}
            </div>
            <Skeleton v-else height="2rem" class="mb-2"></Skeleton>
            <div class="text-600">Positions</div>
          </div>
        </template>
      </Card>
    </div>
    
    <div class="col-12 md:col-3">
      <Card>
        <template #content>
          <div class="text-center">
            <i class="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3"></i>
            <div class="text-2xl font-bold text-900" v-if="!isLoading && portfolio">
              {{ portfolio?.riskMetrics?.totalRiskScore?.toFixed(1) || '0.0' }}
            </div>
            <Skeleton v-else height="2rem" class="mb-2"></Skeleton>
            <div class="text-600">Risk Score</div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
import type { PortfolioResponse } from '@/types/api'

interface Props {
  portfolio?: PortfolioResponse
  isLoading?: boolean
}

const props = defineProps<Props>()

const totalPnL = computed(() => {
  if (!props.portfolio?.positions) return 0
  return props.portfolio.positions.reduce((sum, position) => sum + position.unrealizedPnl, 0)
})

function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
</script>