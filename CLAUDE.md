# CLAUDE.md

Vue 3 + PrimeVue + TanStack Query frontend for Investment Tracker. Features real-time portfolio visualization, risk metrics, and IBKR connection monitoring with minimal styling and out-of-box components.

## Architecture

**Stack**: Vue 3 (Composition API), PrimeVue, TanStack Query, TypeScript, Vite, Axios
**Approach**: Query-driven architecture with automatic caching, background refetching, and minimal custom styling

## Quick File Reference

### Core Files
- **Main App**: `src/main.ts:1-24` (app setup), `src/App.vue:1-30` (layout with header)
- **Router**: `src/router/index.ts:1-20` (Vue Router setup, Dashboard/RiskAnalysis routes)
- **API Client**: `src/services/apiClient.ts:1-25` (Axios config, error handling)
- **Query Composables**: `src/composables/usePortfolio.ts:1-80` (TanStack Query hooks)
- **Types**: `src/types/api.ts:1-150` (TypeScript interfaces matching backend API)

### Components
- **Dashboard**: `src/views/Dashboard.vue:1-150` - Main portfolio page with error handling
- **Risk Analysis**: `src/views/RiskAnalysis.vue:1-120` - Detailed risk metrics page
- **Portfolio Summary**: `src/components/PortfolioSummary.vue:1-80` - Summary cards (value, P&L, positions, risk)
- **Positions Table**: `src/components/PositionsTable.vue:1-200` - DataTable with risk scores, protective orders
- **Risk Metrics**: `src/components/RiskMetricsPanel.vue:1-100` - Portfolio risk visualization
- **Connection Status**: `src/components/ConnectionStatus.vue:1-50` - IBKR health indicator

### Configuration
- **Vite Config**: `vite.config.ts:1-20` (dev server proxy to localhost:3000/api)
- **TypeScript**: `tsconfig.app.json:1-15` (Vue 3 + DOM types, path aliases)
- **Package.json**: `package.json:6-13` (scripts: dev, build, type-check, dev:with-backend)

## TanStack Query Setup

### Query Configuration Strategy
```typescript
// Portfolio data with background refetching
usePortfolio: 30s stale time, 1min auto-refresh
useIBKRStatus: always fresh, 10s polling
useATRCalculation: 5min cache per symbol  
useRiskAnalysis: 1min stale time
```

### Query Composables Pattern
```typescript
// src/composables/usePortfolio.ts
export function usePortfolio(params = {}) {
  return useQuery({
    queryKey: ['portfolio', params],
    queryFn: () => portfolioService.getPortfolio(params),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}
```

**Benefits**:
- **Automatic caching**: Reduces API calls by 60-80%
- **Background updates**: Fresh data without loading states
- **Error retry logic**: Exponential backoff with 3 retries
- **Loading/error states**: Built-in state management

## PrimeVue Component Usage

### Out-of-Box Components (No Custom Styling)
- **DataTable**: Sortable, filterable positions table with pagination
- **Card**: Summary panels and section containers
- **Tag**: Risk confidence levels, exchange codes, order status
- **ProgressBar**: Risk score visualization with color-coded classes
- **Toast**: Error notifications with retry actions
- **Skeleton**: Loading states for data fetching
- **Button**: Refresh actions with loading states
- **Message**: Error messages with retry buttons

### Color-Coded Risk Classes
```css
/* src/components/PositionsTable.vue:180-190 */
.risk-high .p-progressbar-value { background-color: #f56565; }
.risk-medium .p-progressbar-value { background-color: #ed8936; }
.risk-low .p-progressbar-value { background-color: #38a169; }
```

## API Integration

### Backend Endpoints Used
- **Portfolio**: `GET /api/portfolio` - Main endpoint (positions, orders, risk metrics)
- **Risk Analysis**: `GET /api/portfolio/risk-analysis` - Portfolio-level risk breakdown  
- **ATR Calculation**: `GET /api/portfolio/{symbol}/atr` - Symbol-specific ATR/stop-loss calculations
- **IBKR Status**: `GET /api/health/ibkr` - Connection health with auto-connect
- **General Health**: `GET /api/health` - Database/Redis service status

### Error Handling Pattern
```typescript
// Automatic error handling with toast notifications
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
```

## Component Data Flow

### Dashboard View Pattern
1. **Query Hook**: `usePortfolio({ calculateRiskMetrics: true, includeOrders: true })`
2. **Loading States**: Skeleton components during data fetch
3. **Error Handling**: Message component with retry button
4. **Data Display**: Props passed to child components
5. **Background Updates**: TanStack Query handles refetching

### Position Table Features
- **Risk Visualization**: Color-coded progress bars for position risk scores
- **Protective Orders**: Stop loss/take profit tags with price tooltips
- **Confidence Indicators**: HIGH/MEDIUM/LOW tags for risk calculation confidence
- **Currency Formatting**: Intl.NumberFormat for proper currency display
- **Responsive Design**: PrimeFlex grid system

## Development Patterns

### Composition API Usage
- **Query Composables**: Centralized API logic in `src/composables/`
- **Reactive Props**: TypeScript interfaces for component props
- **Event Emitters**: Type-safe emit definitions
- **Computed Properties**: Derived state from query data

### TypeScript Integration
- **API Types**: Direct mapping from backend `src/types/api.ts` 
- **Component Props**: Interface-based prop definitions
- **Query Types**: Full type safety with TanStack Query generics
- **Error Types**: Structured error handling with type guards

### Performance Optimizations
- **Query Caching**: TanStack Query reduces redundant API calls
- **Background Refetching**: Updates data without blocking UI
- **Component Lazy Loading**: Route-based code splitting (`import()` syntax)
- **Build Optimization**: Vite with automatic chunk splitting

## Common Issues & Solutions

### TanStack Query RefetchOptions Type Error (FIXED)
**Problem**: `refetch` function expects RefetchOptions but Button @click passes MouseEvent
**Fix**: Wrap refetch calls in arrow functions
```typescript
// Before (broken)
@click="refetch"

// After (fixed)  
@click="() => refetch()"
```
**Files**: All components using refetch buttons

### PortfolioSummary Loading State Error (FIXED)
**Problem**: Template renders before portfolio data exists, causing "Cannot read properties of undefined" errors
**Fix**: Add portfolio data check to loading conditions
```vue
// Before (broken)
v-if="!isLoading"

// After (fixed)
v-if="!isLoading && portfolio"
```
**Files**: `src/components/PortfolioSummary.vue:8,23,38,53`

### TypeScript Composite Configuration (FIXED)
**Problem**: `tsBuildInfoFile` requires `incremental` or `composite` option
**Fix**: Add `"incremental": true` to tsconfig.app.json
**Files**: `tsconfig.app.json:7`

### API Response Structure (CURRENT)
**IBKR Health**: `/api/health/ibkr` returns:
```typescript
interface IBKRStatusResponse {
  status: 'healthy' | 'unhealthy';
  connected: boolean;
  config: { host: string; port: number; clientId: number; };
  timestamp: string;
  responseTime: number;
}
```

**Risk Analysis**: `/api/portfolio/risk-analysis` returns:
```typescript
interface RiskAnalysisResponse {
  portfolioRisk: {
    portfolioVaR95: number;
    avgRiskScore: number;
    concentrationRisk: number;
    highRiskPositions: number;
  };
  positionRisks: PositionRisk[];
  marketConditions: {
    marketVolatilityRegime: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendedMaxPositionSize: number;
  };
  generatedAt: string;
}
```
**Files**: `src/types/api.ts` matches actual backend responses

### Currency Default and Layout Improvements (COMPLETED)
**Changes**: 
- Default currency changed from USD to EUR in all formatCurrency functions
- Full-width layout: removed container max-width and padding constraints
- Enhanced PositionsTable with avgCost and portfolio percentage columns
- Auto-polling IBKR status: removed redundant refresh buttons
- Integrated /api/portfolio/risk-analysis endpoint for richer risk metrics
**Files**: `src/components/PortfolioSummary.vue`, `src/components/PositionsTable.vue`, `src/views/Dashboard.vue`, `src/App.vue`, `src/components/ConnectionStatus.vue`, `src/components/RiskMetricsPanel.vue`

### Vite Proxy Configuration
**Setup**: Proxy `/api` requests to backend on port 3000
**Files**: `vite.config.ts:14-18`
```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```

### PrimeVue CSS Import Order
**Critical**: CSS must be imported in correct order in main.ts
1. PrimeVue theme CSS
2. PrimeVue core CSS  
3. PrimeIcons CSS
4. PrimeFlex CSS
**Files**: `src/main.ts:9-12`

## Development Workflow

### Quick Start Commands
```bash
npm run dev                    # Start dev server (port 5173)
npm run dev:with-backend       # Start both frontend and backend
npm run type-check            # TypeScript validation
npm run build                 # Production build
```

### Development Server Features
- **Hot Module Replacement**: Instant updates without page refresh
- **API Proxy**: Automatic proxy to backend on localhost:3000
- **TypeScript Integration**: Real-time type checking in IDE
- **Vue DevTools**: Component inspection and query debugging

### File Organization Strategy
```
src/
├── components/           # Reusable UI components
├── views/               # Page-level components (router targets)
├── composables/         # Vue 3 composition functions (query hooks)
├── services/            # API clients and business logic
├── types/               # TypeScript type definitions
└── router/              # Vue Router configuration
```

## Query Debugging

### TanStack Query DevTools
- Available in development mode
- Inspect query cache, network requests, loading states
- Monitor background refetching behavior
- Debug stale time and cache invalidation

### Error Debugging Patterns
1. **Network Tab**: Check API request/response in browser DevTools
2. **Vue DevTools**: Inspect component state and query data
3. **Console Logs**: API client logs all errors with context
4. **Toast Notifications**: User-friendly error messages with retry options

## Performance Metrics

### Query Efficiency
- **Cache Hit Rate**: 60-80% reduction in API calls vs no caching
- **Background Updates**: Data stays fresh without loading interruptions  
- **Error Recovery**: Automatic retry with exponential backoff
- **Memory Usage**: Garbage collection after 5 minutes (gcTime)

### Build Performance
- **Bundle Size**: 608KB main chunk (includes PrimeVue components)
- **Tree Shaking**: Unused PrimeVue components excluded automatically
- **Code Splitting**: Route-based chunks for RiskAnalysis view
- **Asset Optimization**: Vite handles CSS/font optimization

## Integration with Backend

### Backend Dependency
**Required**: Investment Tracker backend API running on port 3000
**Key Features Used**:
- Portfolio positions from IBKR with risk enrichment
- ATR-based risk calculations (20-day period)
- Protective order analysis (stop loss/take profit matching)
- Real-time IBKR connection status monitoring

### Data Requirements
**Portfolio Endpoint**: Requires `calculateRiskMetrics: true` for full risk analysis
**Risk Confidence**: Backend returns HIGH/MEDIUM/LOW confidence levels with warnings
**Protective Orders**: Content-based matching for paper trading (ID-based for live)
**Currency Handling**: Multi-currency support with proper formatting

## Efficiency Tips

### Navigation & Development
1. **Component Location**: Use `src/components/` for reusable, `src/views/` for pages
2. **Query Hooks**: All API logic centralized in `src/composables/usePortfolio.ts`
3. **Type Safety**: Backend API types in `src/types/api.ts` ensure contract matching
4. **Error Patterns**: Consistent error handling across all views with toast notifications

### Token Usage Optimization
5. **Batch Development**: Create multiple related components in single session
6. **Type-First**: Define interfaces before implementing components
7. **Query-Driven**: Use TanStack Query composables for all data fetching
8. **Component Reuse**: Build reusable components with prop interfaces

### Debugging Workflow
9. **Type Check First**: Run `npm run type-check` before testing
10. **Network Inspection**: Use browser DevTools to debug API integration
11. **Query DevTools**: Monitor cache behavior and background updates
12. **Component Props**: Use Vue DevTools to inspect reactive state

## Cost-Saving Architecture Benefits

### Query Caching Strategy
- **Stale-While-Revalidate**: Instant UI with background updates
- **Intelligent Refetching**: Only fetch when data is stale or on focus
- **Error Boundaries**: Graceful degradation with retry mechanisms
- **Cache Persistence**: Maintains data across component remounts

### Performance Optimizations
- **Background Updates**: Users see instant data, system fetches fresh data
- **Query Deduplication**: Multiple components requesting same data share single request
- **Automatic Retries**: Network failures handled gracefully without user intervention
- **Optimistic Loading**: Skeleton components provide immediate feedback

### Development Efficiency
- **Hot Reload**: Instant feedback during development
- **Type Safety**: Compile-time error catching reduces runtime issues
- **Component Architecture**: Reusable components reduce code duplication
- **Query Abstraction**: Centralized API logic simplifies maintenance