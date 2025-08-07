<template>
  <Dialog
    v-model:visible="modalStore.isPositionModalVisible"
    :header="`${selectedPosition?.symbol} Position Details`"
    modal
    :style="{ width: '80vw', maxWidth: '1200px' }"
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    :dismissableMask="true"
    :closeOnEscape="true"
  >
    <div v-if="selectedPosition" class="position-detail-content">
      <TabView>
        <!-- Basic Position Info -->
        <TabPanel header="Position Info">
          <div class="grid">
            <div class="col-12 md:col-6">
              <Card>
                <template #title>
                  <div class="flex align-items-center gap-2">
                    <span>{{ selectedPosition.symbol }}</span>
                    <Tag
                      v-if="selectedPosition.exchange"
                      :value="selectedPosition.exchange"
                      severity="secondary"
                      size="small"
                    />
                    <Tag
                      :value="selectedPosition.instrumentType"
                      severity="info"
                      size="small"
                    />
                  </div>
                </template>
                <template #content>
                  <div class="field-grid">
                    <div class="field">
                      <label>Broker Type</label>
                      <div class="font-semibold">{{ selectedPosition.brokerType }}</div>
                    </div>
                    <div class="field">
                      <label>Quantity</label>
                      <div class="font-semibold">{{ selectedPosition.quantity.toLocaleString() }}</div>
                    </div>
                    <div class="field">
                      <label>Current Price</label>
                      <div class="font-semibold">{{ formatCurrency(selectedPosition.currentPrice, selectedPosition.currency) }}</div>
                    </div>
                    <div class="field">
                      <label>Average Cost</label>
                      <div class="font-semibold">{{ formatCurrency(selectedPosition.avgCost, selectedPosition.currency) }}</div>
                    </div>
                    <div class="field">
                      <label>Market Value</label>
                      <div class="font-semibold">{{ formatCurrency(selectedPosition.marketValue, selectedPosition.currency) }}</div>
                    </div>
                    <div class="field">
                      <label>Currency</label>
                      <div class="font-semibold">{{ selectedPosition.currency }}</div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
            
            <div class="col-12 md:col-6">
              <Card>
                <template #title>P&L & Portfolio Info</template>
                <template #content>
                  <div class="field-grid">
                    <div class="field">
                      <label>Unrealized P&L</label>
                      <div :class="getPnLClass(selectedPosition.unrealizedPnl)" class="font-semibold">
                        {{ formatCurrency(selectedPosition.unrealizedPnl, selectedPosition.currency) }}
                        <small class="block">
                          ({{ selectedPosition.unrealizedPnlPercent.toFixed(2) }}%)
                        </small>
                      </div>
                    </div>
                    <div class="field">
                      <label>Position Size (Portfolio %)</label>
                      <div class="font-semibold">{{ selectedPosition.positionSizePercent.toFixed(2) }}%</div>
                    </div>
                    <div class="field">
                      <label>Base Currency Value</label>
                      <div class="font-semibold">{{ formatCurrency(selectedPosition.baseCurrencyValue, 'EUR') }}</div>
                    </div>
                    <div class="field">
                      <label>FX Rate</label>
                      <div class="font-semibold">{{ selectedPosition.fxRate.toFixed(4) }}</div>
                    </div>
                    <div class="field" v-if="selectedPosition.beta">
                      <label>Beta</label>
                      <div class="font-semibold">{{ selectedPosition.beta.toFixed(2) }}</div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </div>
        </TabPanel>

        <!-- Risk Analysis -->
        <TabPanel header="Risk Analysis">
          <div class="grid">
            <div class="col-12 md:col-6">
              <Card>
                <template #title>Risk Metrics</template>
                <template #content>
                  <div class="field-grid">
                    <div class="field">
                      <label>Risk Score</label>
                      <div class="flex align-items-center gap-2">
                        <ProgressBar
                          :value="selectedPosition.positionRiskScore"
                          :class="getRiskClass(selectedPosition.positionRiskScore)"
                          class="w-8rem"
                          :showValue="false"
                        />
                        <span class="font-semibold">{{ selectedPosition.positionRiskScore.toFixed(1) }}</span>
                      </div>
                    </div>
                    <div class="field">
                      <label>Volatility Score</label>
                      <div class="font-semibold">{{ selectedPosition.volatilityScore.toFixed(1) }}</div>
                    </div>
                    <div class="field">
                      <label>Risk Calculation Confidence</label>
                      <Tag
                        :value="selectedPosition.riskCalculationConfidence"
                        :severity="getConfidenceSeverity(selectedPosition.riskCalculationConfidence)"
                      />
                    </div>
                    <div class="field" v-if="selectedPosition.atr20Day">
                      <label>ATR</label>
                      <div class="font-semibold">{{ formatCurrency(selectedPosition.atr20Day, selectedPosition.currency) }}</div>
                    </div>
                    <div class="field" v-if="selectedPosition.distanceToStopPercent">
                      <label>Distance to Stop %</label>
                      <div class="font-semibold">{{ selectedPosition.distanceToStopPercent.toFixed(2) }}%</div>
                    </div>
                  </div>
                </template>
              </Card>
            </div>

            <div class="col-12 md:col-6">
              <Card>
                <template #title>Risk Warnings</template>
                <template #content>
                  <div v-if="selectedPosition.riskCalculationWarnings.length > 0">
                    <Message
                      v-for="(warning, index) in selectedPosition.riskCalculationWarnings"
                      :key="index"
                      severity="warn"
                      :closable="false"
                      class="mb-2"
                    >
                      {{ warning }}
                    </Message>
                  </div>
                  <div v-else class="text-center p-4 text-500">
                    <i class="pi pi-check-circle text-2xl mb-2 text-green-500"></i>
                    <div>No risk warnings for this position</div>
                  </div>
                </template>
              </Card>
            </div>
          </div>

          <!-- ATR Details Section -->
          <Card class="mt-3">
            <template #title>
              <div class="flex align-items-center gap-2">
                <span>ATR Analysis</span>
                <Button
                  icon="pi pi-refresh"
                  size="small"
                  :loading="atrLoading"
                  @click="() => atrRefetch()"
                  v-tooltip="'Refresh ATR calculation'"
                />
              </div>
            </template>
            <template #content>
              <div v-if="atrLoading" class="text-center p-4">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <div class="mt-2">Loading ATR calculation...</div>
              </div>
              <div v-else-if="atrError" class="text-center p-4">
                <Message severity="error" :closable="false">
                  Failed to load ATR data: {{ getErrorMessage(atrErrorData) }}
                </Message>
              </div>
              <div v-else-if="atrData" class="grid">
                <div class="col-12 md:col-6">
                  <div class="field-grid">
                    <div class="field">
                      <label>ATR</label>
                      <div class="font-semibold">{{ formatCurrency(atrData.atr, selectedPosition.currency) }}</div>
                    </div>
                    <div class="field">
                      <label>Volatility %</label>
                      <div class="font-semibold">{{ atrData.volatilityPercent.toFixed(2) }}%</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <div class="field-grid">
                    <div class="field">
                      <label>Suggested Stop Loss</label>
                      <div class="font-semibold text-red-600">{{ formatCurrency(atrData.stopLoss, selectedPosition.currency) }}</div>
                    </div>
                    <div class="field">
                      <label>Suggested Take Profit</label>
                      <div class="font-semibold text-green-600">{{ formatCurrency(atrData.takeProfit, selectedPosition.currency) }}</div>
                    </div>
                    <div class="field">
                      <label>Risk/Reward Ratio</label>
                      <div class="font-semibold">{{ atrData.riskRewardRatio.toFixed(2) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </Card>
        </TabPanel>

        <!-- Protective Orders -->
        <TabPanel header="Protective Orders">
          <div v-if="selectedPosition.protectiveOrders">
            <div class="grid">
              <div class="col-12 md:col-6" v-if="selectedPosition.protectiveOrders.stopLoss">
                <Card>
                  <template #title>
                    <div class="flex align-items-center gap-2">
                      <Tag value="SL" severity="danger" />
                      <span>Stop Loss Order</span>
                    </div>
                  </template>
                  <template #content>
                    <div class="field-grid">
                      <div class="field">
                        <label>Order ID</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.stopLoss.orderId }}</div>
                      </div>
                      <div class="field">
                        <label>Price</label>
                        <div class="font-semibold text-red-600">{{ formatCurrency(selectedPosition.protectiveOrders.stopLoss.price, selectedPosition.currency) }}</div>
                      </div>
                      <div class="field">
                        <label>Quantity</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.stopLoss.quantity.toLocaleString() }}</div>
                      </div>
                      <div class="field">
                        <label>Order Type</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.stopLoss.orderType }}</div>
                      </div>
                      <div class="field">
                        <label>Status</label>
                        <Tag :value="selectedPosition.protectiveOrders.stopLoss.status" />
                      </div>
                      <div class="field">
                        <label>Time in Force</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.stopLoss.timeInForce }}</div>
                      </div>
                      <div class="field" v-if="selectedPosition.protectiveOrders.stopLoss.alignmentPercent">
                        <label>Alignment %</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.stopLoss.alignmentPercent.toFixed(2) }}%</div>
                      </div>
                      <div class="field">
                        <label>Is Aligned</label>
                        <Tag
                          :value="selectedPosition.protectiveOrders.stopLoss.isAligned ? 'YES' : 'NO'"
                          :severity="selectedPosition.protectiveOrders.stopLoss.isAligned ? 'success' : 'danger'"
                        />
                      </div>
                    </div>
                  </template>
                </Card>
              </div>

              <div class="col-12 md:col-6" v-if="selectedPosition.protectiveOrders.takeProfit">
                <Card>
                  <template #title>
                    <div class="flex align-items-center gap-2">
                      <Tag value="TP" severity="success" />
                      <span>Take Profit Order</span>
                    </div>
                  </template>
                  <template #content>
                    <div class="field-grid">
                      <div class="field">
                        <label>Order ID</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.takeProfit.orderId }}</div>
                      </div>
                      <div class="field">
                        <label>Price</label>
                        <div class="font-semibold text-green-600">{{ formatCurrency(selectedPosition.protectiveOrders.takeProfit.price, selectedPosition.currency) }}</div>
                      </div>
                      <div class="field">
                        <label>Quantity</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.takeProfit.quantity.toLocaleString() }}</div>
                      </div>
                      <div class="field">
                        <label>Order Type</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.takeProfit.orderType }}</div>
                      </div>
                      <div class="field">
                        <label>Status</label>
                        <Tag :value="selectedPosition.protectiveOrders.takeProfit.status" />
                      </div>
                      <div class="field">
                        <label>Time in Force</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.takeProfit.timeInForce }}</div>
                      </div>
                      <div class="field" v-if="selectedPosition.protectiveOrders.takeProfit.alignmentPercent">
                        <label>Alignment %</label>
                        <div class="font-semibold">{{ selectedPosition.protectiveOrders.takeProfit.alignmentPercent.toFixed(2) }}%</div>
                      </div>
                      <div class="field">
                        <label>Is Aligned</label>
                        <Tag
                          :value="selectedPosition.protectiveOrders.takeProfit.isAligned ? 'YES' : 'NO'"
                          :severity="selectedPosition.protectiveOrders.takeProfit.isAligned ? 'success' : 'danger'"
                        />
                      </div>
                    </div>
                  </template>
                </Card>
              </div>
            </div>

            <div v-if="selectedPosition.protectiveOrders.warnings.length > 0" class="mt-3">
              <Card>
                <template #title>Protective Order Warnings</template>
                <template #content>
                  <Message
                    v-for="(warning, index) in selectedPosition.protectiveOrders.warnings"
                    :key="index"
                    severity="warn"
                    :closable="false"
                    class="mb-2"
                  >
                    {{ warning }}
                  </Message>
                </template>
              </Card>
            </div>
          </div>
          <div v-else class="text-center p-4 text-500">
            <i class="pi pi-shield text-4xl mb-3"></i>
            <div>No protective orders found for this position</div>
          </div>
        </TabPanel>

        <!-- Risk Analysis Details -->
        <TabPanel header="Portfolio Risk Context">
          <Card>
            <template #title>
              <div class="flex align-items-center gap-2">
                <span>Risk Analysis Context</span>
                <Button
                  icon="pi pi-refresh"
                  size="small"
                  :loading="riskLoading"
                  @click="() => riskRefetch()"
                  v-tooltip="'Refresh risk analysis'"
                />
              </div>
            </template>
            <template #content>
              <div v-if="riskLoading" class="text-center p-4">
                <ProgressSpinner style="width: 50px; height: 50px" />
                <div class="mt-2">Loading risk analysis...</div>
              </div>
              <div v-else-if="riskError" class="text-center p-4">
                <Message severity="error" :closable="false">
                  Failed to load risk analysis: {{ getErrorMessage(riskErrorData) }}
                </Message>
              </div>
              <div v-else-if="riskData" class="grid">
                <div class="col-12 md:col-6">
                  <h5>Portfolio Risk Overview</h5>
                  <div class="field-grid">
                    <div class="field">
                      <label>Portfolio VaR (95%)</label>
                      <div class="font-semibold">{{ formatCurrency(riskData.portfolioRisk.portfolioVaR95, 'EUR') }}</div>
                    </div>
                    <div class="field">
                      <label>Average Risk Score</label>
                      <div class="font-semibold">{{ riskData.portfolioRisk.avgRiskScore.toFixed(1) }}</div>
                    </div>
                    <div class="field">
                      <label>High Risk Positions</label>
                      <div class="font-semibold">{{ riskData.portfolioRisk.highRiskPositions }} / {{ riskData.portfolioRisk.totalPositions }}</div>
                    </div>
                    <div class="field">
                      <label>Concentration Risk</label>
                      <div class="font-semibold">{{ riskData.portfolioRisk.concentrationRisk.toFixed(2) }}%</div>
                    </div>
                  </div>
                </div>
                <div class="col-12 md:col-6">
                  <h5>Market Conditions</h5>
                  <div class="field-grid">
                    <div class="field">
                      <label>Market Volatility Regime</label>
                      <Tag
                        :value="riskData.marketConditions.marketVolatilityRegime"
                        :severity="riskData.marketConditions.marketVolatilityRegime === 'HIGH' ? 'danger' : riskData.marketConditions.marketVolatilityRegime === 'MEDIUM' ? 'warning' : 'success'"
                      />
                    </div>
                    <div class="field">
                      <label>Recommended Max Position Size</label>
                      <div class="font-semibold">{{ riskData.marketConditions.recommendedMaxPositionSize.toFixed(2) }}%</div>
                    </div>
                  </div>
                </div>
                <div class="col-12" v-if="positionRiskDetails">
                  <h5>Position-Specific Risk Breakdown</h5>
                  <div class="field-grid">
                    <div class="field">
                      <label>Size Risk</label>
                      <div class="font-semibold">{{ positionRiskDetails.riskFactors.sizeRisk.toFixed(1) }}</div>
                    </div>
                    <div class="field">
                      <label>Volatility Risk</label>
                      <div class="font-semibold">{{ positionRiskDetails.riskFactors.volatilityRisk.toFixed(1) }}</div>
                    </div>
                    <div class="field">
                      <label>Liquidity Risk</label>
                      <div class="font-semibold">{{ positionRiskDetails.riskFactors.liquidityRisk.toFixed(1) }}</div>
                    </div>
                    <div class="field">
                      <label>Correlation Risk</label>
                      <div class="font-semibold">{{ positionRiskDetails.riskFactors.correlationRisk.toFixed(1) }}</div>
                    </div>
                  </div>
                  <div v-if="positionRiskDetails.suggestedActions.length > 0" class="mt-3">
                    <h6>Suggested Actions</h6>
                    <ul>
                      <li v-for="action in positionRiskDetails.suggestedActions" :key="action">
                        {{ action }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>
          </Card>
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
  min-height: 400px;
}

.field-grid {
  display: grid;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.field label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-color-secondary);
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