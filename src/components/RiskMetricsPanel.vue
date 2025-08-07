<template>
  <Card>
    <template #title>Risk Metrics</template>
    
    <template #content>
      <!-- Risk Analysis Recommendations -->
      <div v-if="riskAnalysis?.recommendations?.length && !isLoading" class="mb-4">
        <h4 class="text-lg font-semibold mb-3 text-900">Risk Recommendations</h4>
        <div class="flex flex-wrap gap-2">
          <Tag
            v-for="recommendation in riskAnalysis.recommendations" 
            :key="recommendation"
            :value="recommendation"
            severity="info"
            icon="pi pi-info-circle"
          />
        </div>
      </div>
      
      <div class="grid">
        <div class="col-12 md:col-6">
          <div class="p-3 border-round surface-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-600">Portfolio VaR (95%)</span>
              <i class="pi pi-chart-bar text-orange-500"></i>
            </div>
            <div class="text-2xl font-bold text-900" v-if="!isLoading">
              {{ formatCurrency(riskAnalysis?.portfolioRisk?.portfolioVaR95 || riskMetrics?.portfolioVaR95 || 0) }}
            </div>
            <Skeleton v-else height="2rem"></Skeleton>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="p-3 border-round surface-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-600">Max Drawdown</span>
              <i class="pi pi-arrow-down text-red-500"></i>
            </div>
            <div class="text-2xl font-bold text-900" v-if="!isLoading">
              {{ formatPercentage(riskMetrics?.maxDrawdown) }}
            </div>
            <Skeleton v-else height="2rem"></Skeleton>
          </div>
        </div>
        
        <div class="col-12 md:col-6" v-if="hasValidValue(riskMetrics?.sharpeRatio)">
          <div class="p-3 border-round surface-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-600">Sharpe Ratio</span>
              <i class="pi pi-trending-up text-green-500"></i>
            </div>
            <div class="text-2xl font-bold text-900" v-if="!isLoading">
              {{ formatNumber(riskMetrics?.sharpeRatio) }}
            </div>
            <Skeleton v-else height="2rem"></Skeleton>
          </div>
        </div>
        
        <div class="col-12 md:col-6" v-if="hasValidValue(riskMetrics?.beta)">
          <div class="p-3 border-round surface-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-600">Beta</span>
              <i class="pi pi-sync text-blue-500"></i>
            </div>
            <div class="text-2xl font-bold text-900" v-if="!isLoading">
              {{ formatNumber(riskMetrics?.beta) }}
            </div>
            <Skeleton v-else height="2rem"></Skeleton>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="p-3 border-round surface-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-600">Average Risk Score</span>
              <i class="pi pi-sitemap text-purple-500"></i>
            </div>
            <div class="text-2xl font-bold text-900" v-if="!isLoading">
              {{ (riskAnalysis?.portfolioRisk?.avgRiskScore || 0).toFixed(1) }}
            </div>
            <Skeleton v-else height="2rem"></Skeleton>
          </div>
        </div>
        
        <div class="col-12 md:col-6">
          <div class="p-3 border-round surface-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-600">Concentration Risk</span>
              <i class="pi pi-exclamation-circle text-orange-500"></i>
            </div>
            <div class="text-2xl font-bold text-900" v-if="!isLoading">
              {{ (riskAnalysis?.portfolioRisk?.concentrationRisk || riskMetrics?.concentrationRisk || 0).toFixed(1) }}%
            </div>
            <Skeleton v-else height="2rem"></Skeleton>
          </div>
        </div>
        
        <!-- New metrics from risk analysis -->
        <div class="col-12 md:col-6" v-if="riskAnalysis">
          <div class="p-3 border-round surface-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-600">High Risk Positions</span>
              <i class="pi pi-exclamation-triangle text-red-500"></i>
            </div>
            <div class="text-2xl font-bold text-900" v-if="!isLoading">
              {{ riskAnalysis.portfolioRisk.highRiskPositions }}
            </div>
            <Skeleton v-else height="2rem"></Skeleton>
          </div>
        </div>
        
        <div class="col-12 md:col-6" v-if="riskAnalysis">
          <div class="p-3 border-round surface-card">
            <div class="flex justify-content-between align-items-center mb-3">
              <span class="text-600">Market Volatility</span>
              <i class="pi pi-chart-line text-blue-500"></i>
            </div>
            <div class="text-2xl font-bold text-900" v-if="!isLoading">
              {{ riskAnalysis.marketConditions.marketVolatilityRegime }}
            </div>
            <Skeleton v-else height="2rem"></Skeleton>
          </div>
        </div>
      </div>
    </template>
  </Card>
</template>

<script setup lang="ts">
import Card from 'primevue/card'
import Skeleton from 'primevue/skeleton'
import Tag from 'primevue/tag'
import type { PortfolioRiskMetrics, RiskAnalysisResponse } from '@/types/api'

interface Props {
  riskMetrics?: PortfolioRiskMetrics
  riskAnalysis?: RiskAnalysisResponse
  isLoading?: boolean
}

defineProps<Props>()

function formatCurrency(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

function hasValidValue(value: number | undefined | null): boolean {
  return value !== undefined && value !== null && !isNaN(value) && isFinite(value)
}

function formatPercentage(value: number | undefined | null, decimals = 2): string {
  if (!hasValidValue(value)) return 'N/A'
  return (value! * 100).toFixed(decimals) + '%'
}

function formatNumber(value: number | undefined | null, decimals = 3): string {
  if (!hasValidValue(value)) return 'N/A'
  return value!.toFixed(decimals)
}
</script>