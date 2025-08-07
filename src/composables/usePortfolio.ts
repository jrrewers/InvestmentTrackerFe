import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { portfolioService } from '@/services/portfolioService'
import type { PortfolioRequest } from '@/types/api'

export function usePortfolio(params: PortfolioRequest = {}) {
  const queryClient = useQueryClient()

  const portfolioQuery = useQuery({
    queryKey: ['portfolio', params],
    queryFn: () => portfolioService.getPortfolio(params),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: true,
    refetchInterval: 60 * 1000, // Auto refresh every minute
  })

  const refreshPortfolio = () => {
    queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  }

  return {
    portfolio: portfolioQuery.data,
    isLoading: portfolioQuery.isPending,
    isError: portfolioQuery.isError,
    error: portfolioQuery.error,
    refetch: portfolioQuery.refetch,
    refreshPortfolio
  }
}

export function useRiskAnalysis() {
  return useQuery({
    queryKey: ['risk-analysis'],
    queryFn: () => portfolioService.getRiskAnalysis(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes cache
  })
}

export function useATRCalculation(symbol: string, period = 20) {
  return useQuery({
    queryKey: ['atr', symbol, period],
    queryFn: () => portfolioService.getATRCalculation(symbol, period),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes cache
    enabled: !!symbol, // Only run query if symbol is provided
  })
}

export function useIBKRStatus() {
  return useQuery({
    queryKey: ['ibkr-status'],
    queryFn: () => portfolioService.getIBKRStatus(),
    staleTime: 0, // Always fresh for connection status
    gcTime: 60 * 1000, // 1 minute cache
    refetchInterval: 10 * 1000, // Check every 10 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => portfolioService.getHealth(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes cache
    retry: 2,
  })
}