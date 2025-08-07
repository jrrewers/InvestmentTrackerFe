// Backend API type definitions

export interface PortfolioRequest {
  useCache?: boolean;
  calculateRiskMetrics?: boolean;
  includeOrders?: boolean;
}

export interface PortfolioResponse {
  positions: Position[];
  unmatchedOpenOrders: OpenOrder[];
  riskMetrics: PortfolioRiskMetrics;
  totalValue: {
    amount: number;
    currency: string;
  };
  lastUpdated: string;
  dataSource: 'API' | 'CACHE' | 'API_ENRICHED';
  refreshDurationMs: number;
}

export interface Position {
  // From broker API
  brokerType: 'IBKR' | 'KRAKEN';
  symbol: string;
  instrumentType: 'STOCK' | 'CRYPTO' | 'FOREX' | 'FUTURES' | 'OPTIONS';
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  unrealizedPnl: number;
  unrealizedPnlPercent: number;
  currency: string;
  exchange?: string;
  
  // Risk metrics
  atr20Day?: number;
  volatilityScore: number;
  positionRiskScore: number;
  suggestedStopLoss?: number;
  suggestedTakeProfit?: number;
  distanceToStopPercent?: number;
  
  // Risk calculation transparency
  riskCalculationConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  riskCalculationWarnings: string[];
  
  // Portfolio context
  positionSizePercent: number;
  baseCurrencyValue: number;
  fxRate: number;
  beta?: number;
  
  // Protective orders
  protectiveOrders?: ProtectiveOrderSet;
}

export interface ProtectiveOrder {
  orderId: string;
  orderType: string;
  price: number;
  quantity: number;
  status: string;
  timeInForce: string;
  afterHours?: boolean;
  alignmentPercent?: number;
  isAligned: boolean;
}

export interface ProtectiveOrderSet {
  stopLoss?: ProtectiveOrder;
  takeProfit?: ProtectiveOrder;
  warnings: string[];
}

export interface OpenOrder {
  orderId: string;
  symbol: string;
  orderType: 'MKT' | 'LMT' | 'STP' | 'STP_LMT' | 'TRAIL';
  side: 'BUY' | 'SELL';
  quantity: number;
  limitPrice?: number;
  stopPrice?: number;
  trailAmount?: number;
  status: 'SUBMITTED' | 'PENDING' | 'FILLED' | 'CANCELLED';
  timeInForce: 'DAY' | 'GTC' | 'IOC' | 'FOK';
}

export interface PortfolioRiskMetrics {
  totalRiskScore: number;
  portfolioVaR95: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  beta?: number;
  diversificationRatio: number;
  concentrationRisk: number;
  riskAdjustedReturn?: number;
}

export interface ATRResponse {
  symbol: string;
  atr20Day: number;
  volatilityScore: number;
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
  distanceToStopPercent: number;
  riskRewardRatio: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  warnings: string[];
}

export interface IBKRStatusResponse {
  status: 'healthy' | 'unhealthy';
  connected: boolean;
  config: {
    host: string;
    port: number;
    clientId: number;
  };
  timestamp: string;
  responseTime: number;
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  responseTime: number;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
    };
    redis: {
      status: 'healthy' | 'unhealthy';
    };
  };
}

export interface RiskAnalysisResponse {
  portfolioRisk: {
    portfolioVaR95: number;
    portfolioVolatility: number;
    totalPositions: number;
    highRiskPositions: number;
    concentrationRisk: number;
    avgPositionSize: number;
    avgRiskScore: number;
  };
  positionRisks: PositionRisk[];
  recommendations: string[];
  marketConditions: {
    marketVolatilityRegime: 'HIGH' | 'MEDIUM' | 'LOW';
    trendDirection: 'UP' | 'DOWN' | 'SIDEWAYS' | 'UNKNOWN';
    riskOnOffSentiment: number;
    recommendedMaxPositionSize: number;
  };
  generatedAt: string;
}

export interface PositionRisk {
  symbol: string;
  currentRiskScore: number;
  riskFactors: {
    sizeRisk: number;
    volatilityRisk: number;
    liquidityRisk: number;
    correlationRisk: number;
  };
  suggestedActions: string[];
}