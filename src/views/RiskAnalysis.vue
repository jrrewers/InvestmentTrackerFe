<template>
  <div class="risk-analysis">
    <div class="flex justify-content-between align-items-center mb-4">
      <h2 class="text-2xl font-bold m-0">Risk Analysis</h2>
      <Button
        label="Back to Dashboard"
        icon="pi pi-arrow-left"
        outlined
        @click="router.push('/')"
      />
    </div>

    <Message
      v-if="isError"
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

    <div v-if="isLoading" class="text-center p-6">
      <ProgressSpinner />
      <div class="mt-3 text-600">Loading risk analysis...</div>
    </div>

    <template v-else-if="data">
      <!-- Portfolio Risk Metrics -->
      <RiskMetricsPanel
        :riskMetrics="undefined"
        :riskAnalysis="data"
        :isLoading="isLoading"
        class="mb-4"
      />

      <!-- Position Risk Breakdown -->
      <Card v-if="data.positionRisks?.length">
        <template #title>Position Risk Breakdown</template>
        <template #content>
          <DataTable
            :value="data.positionRisks"
            responsiveLayout="scroll"
            showGridlines
            stripedRows
          >
            <Column field="symbol" header="Symbol" sortable />
            <Column field="currentRiskScore" header="Risk Score" sortable>
              <template #body="{ data }">
                <ProgressBar
                  :value="data.currentRiskScore"
                  :class="getRiskClass(data.currentRiskScore)"
                  class="w-6rem"
                  :showValue="false"
                />
                <small class="ml-2">{{ data.currentRiskScore?.toFixed(1) || 'N/A' }}</small>
              </template>
            </Column>
            <Column header="Size Risk" sortable>
              <template #body="{ data }">
                {{ data.riskFactors?.sizeRisk?.toFixed(1) || 'N/A' }}
              </template>
            </Column>
            <Column header="Volatility Risk" sortable>
              <template #body="{ data }">
                {{ data.riskFactors?.volatilityRisk?.toFixed(1) || 'N/A' }}
              </template>
            </Column>
            <Column header="Liquidity Risk" sortable>
              <template #body="{ data }">
                {{ data.riskFactors?.liquidityRisk?.toFixed(1) || 'N/A' }}
              </template>
            </Column>
            <Column header="Suggested Actions">
              <template #body="{ data }">
                <div class="flex flex-wrap gap-1">
                  <Tag
                    v-for="action in data.suggestedActions"
                    :key="action"
                    :value="action"
                    severity="info"
                    size="small"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </template>
      </Card>

      <div class="text-center text-600 text-sm mt-4">
        <i class="pi pi-clock mr-2"></i>
        Analysis timestamp: {{ formatDate(data.generatedAt) }}
      </div>
    </template>

    <div v-else-if="!isLoading && !isError" class="text-center p-6">
      <i class="pi pi-chart-bar text-6xl text-400 mb-4"></i>
      <h3 class="text-900 mb-2">No Risk Analysis Data</h3>
      <p class="text-600 mb-4">Risk analysis data is not available.</p>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="() => refetch()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { watchEffect } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import ProgressBar from 'primevue/progressbar'
import Tag from 'primevue/tag'

import RiskMetricsPanel from '@/components/RiskMetricsPanel.vue'
import { useRiskAnalysis } from '@/composables/usePortfolio'

const router = useRouter()
const toast = useToast()

const { data, isLoading, isError, error, refetch } = useRiskAnalysis()

watchEffect(() => {
  if (isError.value && error.value) {
    toast.add({
      severity: 'error',
      summary: 'Risk Analysis Error',
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

function getRiskClass(riskScore: number): string {
  if (riskScore > 75) return 'risk-high'
  if (riskScore > 50) return 'risk-medium'
  return 'risk-low'
}
</script>

<style scoped>
.risk-analysis {
  max-width: 1400px;
  margin: 0 auto;
}

:deep(.risk-high .p-progressbar-value) {
  background-color: #f56565;
}

:deep(.risk-medium .p-progressbar-value) {
  background-color: #ed8936;
}

:deep(.risk-low .p-progressbar-value) {
  background-color: #38a169;
}
</style>