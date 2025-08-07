<template>
  <Card>
    <template #title>
      <div class="flex justify-content-between align-items-center">
        <span>Positions</span>
        <Button
          icon="pi pi-refresh"
          size="small"
          :loading="isLoading"
          @click="$emit('refresh')"
          v-tooltip="'Refresh positions'"
        />
      </div>
    </template>
    
    <template #content>
      <DataTable 
        :value="positions" 
        :loading="isLoading"
        paginator 
        :rows="10"
        dataKey="symbol"
        responsiveLayout="scroll"
        showGridlines
        stripedRows
        :rowHover="true"
        selectionMode="single"
        @rowSelect="onRowSelect"
        class="clickable-rows"
      >
        <Column field="symbol" header="Symbol" sortable>
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <strong>{{ data.symbol }}</strong>
              <Tag
                v-if="data.exchange"
                :value="data.exchange"
                severity="secondary"
                size="small"
              />
            </div>
          </template>
        </Column>
        
        <Column field="quantity" header="Quantity" sortable>
          <template #body="{ data }">
            {{ data.quantity.toLocaleString() }}
          </template>
        </Column>
        
        <Column field="currentPrice" header="Price" sortable>
          <template #body="{ data }">
            {{ formatCurrency(data.currentPrice, data.currency) }}
          </template>
        </Column>
        
        <Column field="marketValue" header="Market Value" sortable>
          <template #body="{ data }">
            {{ formatCurrency(data.marketValue, data.currency) }}
          </template>
        </Column>
        
        <Column field="avgCost" header="Avg Cost" sortable>
          <template #body="{ data }">
            {{ formatCurrency(data.avgCost || 0, data.currency) }}
          </template>
        </Column>
        
        <Column field="unrealizedPnl" header="P&L" sortable>
          <template #body="{ data }">
            <div :class="getPnLClass(data.unrealizedPnl)">
              {{ formatCurrency(data.unrealizedPnl, data.currency) }}
              <small class="block">
                ({{ data.unrealizedPnlPercent.toFixed(2) }}%)
              </small>
            </div>
          </template>
        </Column>
        
        <Column header="Portfolio %" sortable>
          <template #body="{ data }">
            <div class="text-center">
              {{ (data.positionSizePercent || 0).toFixed(1) }}%
            </div>
          </template>
        </Column>
        
        <Column field="positionRiskScore" header="Risk Score" sortable>
          <template #body="{ data }">
            <div class="flex align-items-center gap-2">
              <ProgressBar
                :value="data.positionRiskScore"
                :class="getRiskClass(data.positionRiskScore)"
                class="w-4rem"
                :showValue="false"
              />
              <small>{{ data.positionRiskScore.toFixed(1) }}</small>
            </div>
          </template>
        </Column>
        
        <Column field="riskCalculationConfidence" header="Confidence" sortable>
          <template #body="{ data }">
            <Tag
              :value="data.riskCalculationConfidence"
              :severity="getConfidenceSeverity(data.riskCalculationConfidence)"
              size="small"
            />
          </template>
        </Column>
        
        <Column field="protectiveOrders" header="Protection">
          <template #body="{ data }">
            <div class="flex gap-1">
              <Tag
                v-if="data.protectiveOrders?.stopLoss"
                value="SL"
                severity="danger"
                size="small"
                v-tooltip="'Stop Loss: ' + formatCurrency(data.protectiveOrders.stopLoss.price, data.currency)"
              />
              <Tag
                v-if="data.protectiveOrders?.takeProfit"
                value="TP"
                severity="success"
                size="small"
                v-tooltip="'Take Profit: ' + formatCurrency(data.protectiveOrders.takeProfit.price, data.currency)"
              />
              <Tag
                v-if="data.protectiveOrders?.warnings.length"
                :value="data.protectiveOrders.warnings.length.toString()"
                severity="warning"
                size="small"
                icon="pi pi-exclamation-triangle"
                v-tooltip="data.protectiveOrders.warnings.join(', ')"
              />
            </div>
          </template>
        </Column>
        
        <template #empty>
          <div class="text-center p-4">
            <i class="pi pi-inbox text-4xl text-400 mb-3"></i>
            <div>No positions found</div>
          </div>
        </template>
      </DataTable>
    </template>
  </Card>

  <!-- Position Detail Modal -->
  <PositionDetailModal
    v-model:visible="modalVisible"
    :position="selectedPosition"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import ProgressBar from 'primevue/progressbar'
import PositionDetailModal from './PositionDetailModal.vue'
import type { Position } from '@/types/api'

interface Props {
  positions?: Position[]
  isLoading?: boolean
}

defineProps<Props>()
defineEmits<{
  refresh: []
}>()

// Modal state
const modalVisible = ref(false)
const selectedPosition = ref<Position | null>(null)

// Row selection handler
function onRowSelect(event: any) {
  selectedPosition.value = event.data
  modalVisible.value = true
}

function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

function getPnLClass(pnl: number): string {
  if (pnl > 0) return 'text-green-600 font-semibold'
  if (pnl < 0) return 'text-red-600 font-semibold'
  return 'text-600'
}

function getRiskClass(riskScore: number): string {
  if (riskScore > 75) return 'risk-high'
  if (riskScore > 50) return 'risk-medium'
  return 'risk-low'
}

function getConfidenceSeverity(confidence: string): string {
  switch (confidence) {
    case 'HIGH': return 'success'
    case 'MEDIUM': return 'warning'
    case 'LOW': return 'danger'
    default: return 'secondary'
  }
}

</script>

<style scoped>
:deep(.risk-high .p-progressbar-value) {
  background-color: #f56565;
}

:deep(.risk-medium .p-progressbar-value) {
  background-color: #ed8936;
}

:deep(.risk-low .p-progressbar-value) {
  background-color: #38a169;
}

:deep(.clickable-rows .p-datatable-tbody > tr) {
  cursor: pointer;
  transition: background-color 0.2s;
}

:deep(.clickable-rows .p-datatable-tbody > tr:hover) {
  background-color: var(--surface-hover) !important;
}
</style>