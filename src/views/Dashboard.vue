<template>
  <div class="dashboard">
    <!-- Error Message -->
    <Message
      v-if="isError && !isLoading"
      severity="error"
      :closable="false"
      class="mb-4"
    >
      <div class="flex align-items-center justify-content-between w-full">
        <span>{{ getErrorMessage(error) }}</span>
        <Button
          label="Retry"
          icon="pi pi-refresh"
          size="small"
          @click="() => refetch()"
        />
      </div>
    </Message>

    <!-- Loading State -->
    <div v-if="isLoading && !portfolio" class="text-center p-6">
      <ProgressSpinner />
      <div class="mt-3 text-600">Loading portfolio...</div>
    </div>

    <!-- Dashboard Content -->
    <template v-else-if="portfolio">
      <!-- Portfolio Summary Cards -->
      <PortfolioSummary
        :portfolio="portfolio"
        :isLoading="isLoading"
        class="mb-4"
      />

      <!-- Risk Metrics -->
      <RiskMetricsPanel
        :riskMetrics="portfolio.riskMetrics"
        :riskAnalysis="riskAnalysis"
        :isLoading="isLoading || isRiskLoading"
        class="mb-4"
      />

      <!-- Positions Table -->
      <PositionsTable
        :positions="portfolio.positions"
        :isLoading="isLoading"
        @refresh="refreshPortfolio"
        class="mb-4"
      />

      <!-- Open Orders -->
      <Card v-if="portfolio.unmatchedOpenOrders?.length" class="mb-4">
        <template #title>Unmatched Open Orders</template>
        <template #content>
          <div class="grid">
            <div
              v-for="order in portfolio.unmatchedOpenOrders"
              :key="order.orderId"
              class="col-12 md:col-6 lg:col-4"
            >
              <div class="p-3 border-round surface-card">
                <div class="flex justify-content-between align-items-center mb-2">
                  <strong>{{ order.symbol }}</strong>
                  <Tag
                    :value="order.status"
                    :severity="getOrderStatusSeverity(order.status)"
                    size="small"
                  />
                </div>
                <div class="text-sm text-600">
                  {{ order.side }} {{ order.quantity }} @ {{ formatOrderPrice(order) }}
                </div>
                <div class="text-sm text-600">
                  {{ order.orderType }} ({{ order.timeInForce }})
                </div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Last Updated Info -->
      <div class="text-center text-600 text-sm">
        <i class="pi pi-clock mr-2"></i>
        Last updated: {{ formatDate(portfolio.lastUpdated) }}
        <span class="ml-2">({{ portfolio.dataSource }})</span>
        <span class="ml-2">in {{ portfolio.refreshDurationMs }}ms</span>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else-if="!isLoading && !isError" class="text-center p-6">
      <i class="pi pi-inbox text-6xl text-400 mb-4"></i>
      <h3 class="text-900 mb-2">No Portfolio Data</h3>
      <p class="text-600 mb-4">No positions found in your portfolio.</p>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="() => refetch()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import { watchEffect } from 'vue'
import Message from 'primevue/message'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import Card from 'primevue/card'
import Tag from 'primevue/tag'

import PortfolioSummary from '@/components/PortfolioSummary.vue'
import RiskMetricsPanel from '@/components/RiskMetricsPanel.vue'
import PositionsTable from '@/components/PositionsTable.vue'
import { usePortfolio, useRiskAnalysis } from '@/composables/usePortfolio'
import type { OpenOrder } from '@/types/api'

const toast = useToast()

const {
  portfolio,
  isLoading,
  isError,
  error,
  refetch,
  refreshPortfolio
} = usePortfolio({
  calculateRiskMetrics: true,
  includeOrders: true
})

const {
  data: riskAnalysis,
  isLoading: isRiskLoading,
  isError: isRiskError,
  error: riskError
} = useRiskAnalysis()

// Show toast notifications for errors
watchEffect(() => {
  if (isError.value && error.value) {
    toast.add({
      severity: 'error',
      summary: 'Portfolio Error',
      detail: getErrorMessage(error.value),
      life: 5000
    })
  }
})

function getErrorMessage(err: any): string {
  if (err instanceof Error) {
    return err.message
  }
  return 'An unexpected error occurred'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function formatOrderPrice(order: OpenOrder): string {
  if (order.orderType === 'MKT') return 'Market'
  if (order.limitPrice) return `$${order.limitPrice.toFixed(2)}`
  if (order.stopPrice) return `Stop $${order.stopPrice.toFixed(2)}`
  return 'N/A'
}

function getOrderStatusSeverity(status: string): string {
  switch (status) {
    case 'FILLED': return 'success'
    case 'CANCELLED': return 'danger'
    case 'PENDING': return 'warning'
    default: return 'info'
  }
}
</script>

<style scoped>
.dashboard {
  /* Full width layout */
}
</style>