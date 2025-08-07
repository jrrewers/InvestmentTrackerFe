import apiClient from './apiClient'
import type { 
  PortfolioResponse, 
  PortfolioRequest,
  ATRResponse,
  IBKRStatusResponse,
  HealthResponse,
  RiskAnalysisResponse
} from '@/types/api'

export const portfolioService = {
  // Main portfolio endpoint
  getPortfolio: async (params: PortfolioRequest = {}): Promise<PortfolioResponse> => {
    const response = await apiClient.get('/portfolio', { params })
    return response.data
  },

  // Portfolio risk analysis
  getRiskAnalysis: async (): Promise<RiskAnalysisResponse> => {
    const response = await apiClient.get('/portfolio/risk-analysis')
    return response.data
  },

  // ATR calculations for specific symbol
  getATRCalculation: async (symbol: string, period = 20): Promise<ATRResponse> => {
    const response = await apiClient.get(`/portfolio/${symbol}/atr`, {
      params: { period }
    })
    return response.data
  },

  // IBKR connection status
  getIBKRStatus: async (): Promise<IBKRStatusResponse> => {
    const response = await apiClient.get('/health/ibkr')
    return response.data
  },

  // General health check
  getHealth: async (): Promise<HealthResponse> => {
    const response = await apiClient.get('/health')
    return response.data
  }
}