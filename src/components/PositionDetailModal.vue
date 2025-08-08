<template>
  <Dialog
    :visible="modalStore.isPositionModalVisible"
    @update:visible="handleVisibleChange"
    :header="`${selectedPosition?.symbol} Position Details`"
    modal
    :style="{ width: '60vw', maxWidth: '900px' }"
    :breakpoints="{ '900px': '70vw', '575px': '95vw' }"
    :dismissableMask="true"
    :closeOnEscape="true"
  >
    <div v-if="selectedPosition" class="position-detail-content">
      <TabView>
        <!-- Position & P&L Info -->
        <TabPanel header="Position & P&L">
          <div class="position-header mb-3">
            <h5 class="m-0 flex align-items-center gap-2">
              {{ selectedPosition.symbol }}
              <Tag v-if="selectedPosition.exchange" :value="selectedPosition.exchange" severity="secondary" size="small" />
              <Tag :value="selectedPosition.instrumentType" severity="info" size="small" />
            </h5>
          </div>
          
          <div class="section-compact mb-3">
            <h6 class="section-title">Basic Info</h6>
            <div class="field-grid-inline">
              <div class="field-inline">
                <span class="field-label">Broker:</span>
                <span class="field-value">{{ selectedPosition.brokerType }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Quantity:</span>
                <span class="field-value">{{ selectedPosition.quantity.toLocaleString() }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Currency:</span>
                <span class="field-value">{{ selectedPosition.currency }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Current Price:</span>
                <span class="field-value">{{ formatCurrency(selectedPosition.currentPrice, selectedPosition.currency) }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Avg Cost:</span>
                <span class="field-value">{{ formatCurrency(selectedPosition.avgCost, selectedPosition.currency) }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Market Value:</span>
                <span class="field-value">{{ formatCurrency(selectedPosition.marketValue, selectedPosition.currency) }}</span>
              </div>
            </div>
          </div>

          <div class="section-compact">
            <h6 class="section-title">P&L & Portfolio</h6>
            <div class="field-grid-inline">
              <div class="field-inline">
                <span class="field-label">Unrealized P&L:</span>
                <span :class="getPnLClass(selectedPosition.unrealizedPnl)" class="field-value">
                  {{ formatCurrency(selectedPosition.unrealizedPnl, selectedPosition.currency) }}
                  ({{ selectedPosition.unrealizedPnlPercent.toFixed(2) }}%)
                </span>
              </div>
              <div class="field-inline">
                <span class="field-label">Portfolio %:</span>
                <span class="field-value">{{ selectedPosition.positionSizePercent.toFixed(2) }}%</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Base Value:</span>
                <span class="field-value">{{ formatCurrency(selectedPosition.baseCurrencyValue, 'EUR') }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">FX Rate:</span>
                <span class="field-value">{{ selectedPosition.fxRate.toFixed(4) }}</span>
              </div>
              <div class="field-inline" v-if="selectedPosition.beta">
                <span class="field-label">Beta:</span>
                <span class="field-value">{{ selectedPosition.beta.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Risk Analysis -->
        <TabPanel header="Risk Analysis">
          <div class="section-compact mb-3">
            <h6 class="section-title">Risk Metrics</h6>
            <div class="field-grid-inline">
              <div class="field-inline">
                <span class="field-label">Risk Score:</span>
                <span class="field-value flex align-items-center gap-2">
                  <ProgressBar
                    :value="selectedPosition.positionRiskScore"
                    :class="getRiskClass(selectedPosition.positionRiskScore)"
                    class="w-6rem"
                    :showValue="false"
                  />
                  {{ selectedPosition.positionRiskScore.toFixed(1) }}
                </span>
              </div>
              <div class="field-inline">
                <span class="field-label">Volatility:</span>
                <span class="field-value">{{ selectedPosition.volatilityScore.toFixed(1) }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Confidence:</span>
                <Tag
                  :value="selectedPosition.riskCalculationConfidence"
                  :severity="getConfidenceSeverity(selectedPosition.riskCalculationConfidence)"
                  size="small"
                />
              </div>
              <div class="field-inline" v-if="selectedPosition.atr20Day">
                <span class="field-label">ATR:</span>
                <span class="field-value">{{ formatCurrency(selectedPosition.atr20Day, selectedPosition.currency) }}</span>
              </div>
              <div class="field-inline" v-if="selectedPosition.distanceToStopPercent">
                <span class="field-label">Stop Distance:</span>
                <span class="field-value">{{ selectedPosition.distanceToStopPercent.toFixed(2) }}%</span>
              </div>
            </div>
            
            <div v-if="selectedPosition.riskCalculationWarnings.length > 0" class="mt-2">
              <span class="text-orange-600 text-sm" v-for="(warning, index) in selectedPosition.riskCalculationWarnings" :key="index">
                <i class="pi pi-exclamation-triangle mr-1"></i>{{ warning }}<br v-if="index < selectedPosition.riskCalculationWarnings.length - 1"/>
              </span>
            </div>
          </div>

          <div class="section-compact">
            <h6 class="section-title flex align-items-center gap-2">
              ATR Analysis
              <Button
                icon="pi pi-refresh"
                size="small"
                text
                rounded
                :loading="atrLoading"
                @click="() => atrRefetch()"
                v-tooltip="'Refresh ATR'"
                class="p-0 w-2rem h-2rem"
              />
            </h6>
            <div v-if="atrLoading" class="text-center p-2">
              <ProgressSpinner style="width: 30px; height: 30px" />
            </div>
            <div v-else-if="atrError" class="text-orange-600 text-sm">
              <i class="pi pi-exclamation-triangle mr-1"></i>Failed to load ATR: {{ getErrorMessage(atrErrorData) }}
            </div>
            <div v-else-if="atrData" class="field-grid-inline">
              <div class="field-inline">
                <span class="field-label">ATR:</span>
                <span class="field-value">{{ formatCurrency(atrData.atr, selectedPosition.currency) }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Volatility:</span>
                <span class="field-value">{{ atrData.volatilityPercent.toFixed(2) }}%</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Stop Loss:</span>
                <span class="field-value text-red-600">{{ formatCurrency(atrData.stopLoss, selectedPosition.currency) }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Take Profit:</span>
                <span class="field-value text-green-600">{{ formatCurrency(atrData.takeProfit, selectedPosition.currency) }}</span>
              </div>
              <div class="field-inline">
                <span class="field-label">Risk/Reward:</span>
                <span class="field-value">{{ atrData.riskRewardRatio.toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </TabPanel>

        <!-- Protective Orders -->
        <TabPanel header="Protective Orders">
          <div v-if="selectedPosition.protectiveOrders">
            <div v-if="selectedPosition.protectiveOrders.stopLoss" class="section-compact mb-3">
              <h6 class="section-title flex align-items-center gap-2">
                <Tag value="SL" severity="danger" size="small" />
                Stop Loss Order
              </h6>
              <div class="field-grid-inline">
                <div class="field-inline">
                  <span class="field-label">Order ID:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.stopLoss.orderId }}</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Price:</span>
                  <span class="field-value text-red-600">{{ formatCurrency(selectedPosition.protectiveOrders.stopLoss.price, selectedPosition.currency) }}</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Quantity:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.stopLoss.quantity.toLocaleString() }}</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Type:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.stopLoss.orderType }}</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Status:</span>
                  <Tag :value="selectedPosition.protectiveOrders.stopLoss.status" size="small" />
                </div>
                <div class="field-inline">
                  <span class="field-label">TIF:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.stopLoss.timeInForce }}</span>
                </div>
                <div class="field-inline" v-if="selectedPosition.protectiveOrders.stopLoss.alignmentPercent">
                  <span class="field-label">Alignment:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.stopLoss.alignmentPercent.toFixed(2) }}%</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Aligned:</span>
                  <Tag
                    :value="selectedPosition.protectiveOrders.stopLoss.isAligned ? 'YES' : 'NO'"
                    :severity="selectedPosition.protectiveOrders.stopLoss.isAligned ? 'success' : 'danger'"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <div v-if="selectedPosition.protectiveOrders.takeProfit" class="section-compact mb-3">
              <h6 class="section-title flex align-items-center gap-2">
                <Tag value="TP" severity="success" size="small" />
                Take Profit Order
              </h6>
              <div class="field-grid-inline">
                <div class="field-inline">
                  <span class="field-label">Order ID:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.takeProfit.orderId }}</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Price:</span>
                  <span class="field-value text-green-600">{{ formatCurrency(selectedPosition.protectiveOrders.takeProfit.price, selectedPosition.currency) }}</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Quantity:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.takeProfit.quantity.toLocaleString() }}</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Type:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.takeProfit.orderType }}</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Status:</span>
                  <Tag :value="selectedPosition.protectiveOrders.takeProfit.status" size="small" />
                </div>
                <div class="field-inline">
                  <span class="field-label">TIF:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.takeProfit.timeInForce }}</span>
                </div>
                <div class="field-inline" v-if="selectedPosition.protectiveOrders.takeProfit.alignmentPercent">
                  <span class="field-label">Alignment:</span>
                  <span class="field-value">{{ selectedPosition.protectiveOrders.takeProfit.alignmentPercent.toFixed(2) }}%</span>
                </div>
                <div class="field-inline">
                  <span class="field-label">Aligned:</span>
                  <Tag
                    :value="selectedPosition.protectiveOrders.takeProfit.isAligned ? 'YES' : 'NO'"
                    :severity="selectedPosition.protectiveOrders.takeProfit.isAligned ? 'success' : 'danger'"
                    size="small"
                  />
                </div>
              </div>
            </div>

            <div v-if="selectedPosition.protectiveOrders.warnings.length > 0" class="mt-2">
              <span class="text-orange-600 text-sm" v-for="(warning, index) in selectedPosition.protectiveOrders.warnings" :key="index">
                <i class="pi pi-exclamation-triangle mr-1"></i>{{ warning }}<br v-if="index < selectedPosition.protectiveOrders.warnings.length - 1"/>
              </span>
            </div>
          </div>
          <div v-else class="text-center p-3 text-500">
            <i class="pi pi-shield text-2xl mb-2"></i>
            <div class="text-sm">No protective orders found</div>
          </div>
        </TabPanel>

        <!-- Portfolio Context -->
        <TabPanel header="Portfolio Context">
          <div class="section-compact mb-3">
            <h6 class="section-title flex align-items-center gap-2">
              Risk Analysis Context
              <Button
                icon="pi pi-refresh"
                size="small"
                text
                rounded
                :loading="riskLoading"
                @click="() => riskRefetch()"
                v-tooltip="'Refresh risk'"
                class="p-0 w-2rem h-2rem"
              />
            </h6>
            <div v-if="riskLoading" class="text-center p-2">
              <ProgressSpinner style="width: 30px; height: 30px" />
            </div>
            <div v-else-if="riskError" class="text-orange-600 text-sm">
              <i class="pi pi-exclamation-triangle mr-1"></i>Failed to load risk: {{ getErrorMessage(riskErrorData) }}
            </div>
            <div v-else-if="riskData">
              <div class="mb-3">
                <div class="text-xs text-600 uppercase mb-2">Portfolio Overview</div>
                <div class="field-grid-inline">
                  <div class="field-inline">
                    <span class="field-label">VaR 95%:</span>
                    <span class="field-value">{{ formatCurrency(riskData.portfolioRisk.portfolioVaR95, 'EUR') }}</span>
                  </div>
                  <div class="field-inline">
                    <span class="field-label">Avg Risk:</span>
                    <span class="field-value">{{ riskData.portfolioRisk.avgRiskScore.toFixed(1) }}</span>
                  </div>
                  <div class="field-inline">
                    <span class="field-label">High Risk:</span>
                    <span class="field-value">{{ riskData.portfolioRisk.highRiskPositions }}/{{ riskData.portfolioRisk.totalPositions }}</span>
                  </div>
                  <div class="field-inline">
                    <span class="field-label">Concentration:</span>
                    <span class="field-value">{{ riskData.portfolioRisk.concentrationRisk.toFixed(2) }}%</span>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <div class="text-xs text-600 uppercase mb-2">Market Conditions</div>
                <div class="field-grid-inline">
                  <div class="field-inline">
                    <span class="field-label">Volatility:</span>
                    <Tag
                      :value="riskData.marketConditions.marketVolatilityRegime"
                      :severity="riskData.marketConditions.marketVolatilityRegime === 'HIGH' ? 'danger' : riskData.marketConditions.marketVolatilityRegime === 'MEDIUM' ? 'warning' : 'success'"
                      size="small"
                    />
                  </div>
                  <div class="field-inline">
                    <span class="field-label">Max Size:</span>
                    <span class="field-value">{{ riskData.marketConditions.recommendedMaxPositionSize.toFixed(2) }}%</span>
                  </div>
                </div>
              </div>
              
              <div v-if="positionRiskDetails">
                <div class="text-xs text-600 uppercase mb-2">Position Risk Factors</div>
                <div class="field-grid-inline">
                  <div class="field-inline">
                    <span class="field-label">Size:</span>
                    <span class="field-value">{{ positionRiskDetails.riskFactors.sizeRisk.toFixed(1) }}</span>
                  </div>
                  <div class="field-inline">
                    <span class="field-label">Volatility:</span>
                    <span class="field-value">{{ positionRiskDetails.riskFactors.volatilityRisk.toFixed(1) }}</span>
                  </div>
                  <div class="field-inline">
                    <span class="field-label">Liquidity:</span>
                    <span class="field-value">{{ positionRiskDetails.riskFactors.liquidityRisk.toFixed(1) }}</span>
                  </div>
                  <div class="field-inline">
                    <span class="field-label">Correlation:</span>
                    <span class="field-value">{{ positionRiskDetails.riskFactors.correlationRisk.toFixed(1) }}</span>
                  </div>
                </div>
                <div v-if="positionRiskDetails.suggestedActions.length > 0" class="mt-2">
                  <div class="text-xs text-600 uppercase mb-1">Suggested Actions</div>
                  <ul class="m-0 pl-3 text-sm">
                    <li v-for="action in positionRiskDetails.suggestedActions" :key="action" class="mb-1">
                      {{ action }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
      </TabView>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import Dialog from 'primevue/dialog'
import TabView from 'primevue/tabview'
import TabPanel from 'primevue/tabpanel'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import { useATRCalculation, useRiskAnalysis, usePortfolio } from '@/composables/usePortfolio'
import { useModalStore } from '@/stores/modal'
import type { Position, PositionRisk } from '@/types/api'

const modalStore = useModalStore()

// Handle modal visibility changes
const handleVisibleChange = (value: boolean) => {
  if (!value) {
    modalStore.closeModal()
  }
}

// Get portfolio to find the selected position
const { portfolio } = usePortfolio({
  calculateRiskMetrics: true,
  includeOrders: true
})

// Get the selected position from portfolio data
const selectedPosition = computed(() => {
  if (!modalStore.selectedPositionSymbol || !portfolio.value?.positions) return null
  return portfolio.value.positions.find(p => p.symbol === modalStore.selectedPositionSymbol)
})

// ATR Query - use reactive symbol
const atrSymbol = computed(() => selectedPosition.value?.symbol || '')
const {
  data: atrData,
  isLoading: atrLoading,
  isError: atrError,
  error: atrErrorData,
  refetch: atrRefetch
} = useATRCalculation(atrSymbol)

// Risk Analysis Query
const {
  data: riskData,
  isLoading: riskLoading,
  isError: riskError,
  error: riskErrorData,
  refetch: riskRefetch
} = useRiskAnalysis()

// Find position-specific risk details
const positionRiskDetails = computed(() => {
  if (!selectedPosition.value || !riskData.value) return null
  return riskData.value.positionRisks?.find(
    (risk: PositionRisk) => risk.symbol === selectedPosition.value?.symbol
  )
})

// Utility functions
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

function getErrorMessage(error: any): string {
  if (error?.response?.data?.message) return error.response.data.message
  if (error?.message) return error.message
  return 'Unknown error occurred'
}
</script>

<style scoped>
.position-detail-content {
  min-height: 300px;
}

.position-header {
  border-bottom: 1px solid var(--surface-border);
  padding-bottom: 0.5rem;
}

.section-compact {
  padding: 0.75rem;
  background: var(--surface-50);
  border-radius: 6px;
  border: 1px solid var(--surface-border);
}

.section-title {
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-grid-inline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem 1.5rem;
}

.field-inline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 1.5rem;
}

.field-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-color-secondary);
  white-space: nowrap;
}

.field-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
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