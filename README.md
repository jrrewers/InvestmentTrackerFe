# Investment Tracker Frontend

Vue 3 + PrimeVue + TanStack Query frontend for the Investment Tracker application.

## Features

- **Portfolio Overview**: Real-time portfolio positions, P&L, and total value
- **Risk Analysis**: ATR-based risk calculations, portfolio risk metrics
- **Position Management**: Detailed position table with risk scores and protective orders
- **IBKR Integration**: Connection status monitoring and health checks
- **Responsive Design**: Mobile-friendly interface using PrimeFlex

## Tech Stack

- **Vue 3** with Composition API and TypeScript
- **PrimeVue** for UI components (minimal styling, out-of-box theme)
- **TanStack Query** for API state management and caching
- **Vite** for build tooling and dev server
- **Axios** for HTTP client

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Frontend will be available at: http://localhost:5173

3. **Start with backend** (requires backend running on port 3000):
   ```bash
   npm run dev:with-backend
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api` with automatic proxy configuration.

### Key Endpoints Used

- `GET /api/portfolio` - Main portfolio data with positions and risk metrics
- `GET /api/portfolio/risk-analysis` - Detailed portfolio risk analysis  
- `GET /api/portfolio/{symbol}/atr` - ATR calculations for specific symbols
- `GET /api/health/ibkr` - IBKR connection status monitoring

## Components Architecture

### Pages
- **Dashboard** (`/`) - Main portfolio overview
- **Risk Analysis** (`/risk-analysis`) - Detailed risk metrics

### Core Components
- **PortfolioSummary** - Summary cards (total value, P&L, positions, risk score)
- **PositionsTable** - DataTable with positions, risk scores, protective orders
- **RiskMetricsPanel** - Portfolio risk metrics visualization
- **ConnectionStatus** - IBKR connection health indicator

### Data Management
- **TanStack Query** handles all API calls with automatic caching
- **Background refetching** keeps data fresh without blocking UI
- **Error handling** with toast notifications and retry logic
- **Loading states** with skeletons and progress indicators

## Query Configuration

- **Portfolio**: 30s stale time, auto-refresh every minute
- **IBKR Status**: Always fresh, polls every 10 seconds
- **ATR Data**: 5min cache for symbol-specific calculations
- **Risk Analysis**: 1min stale time for risk metrics

## Development

### Type Checking
```bash
npm run type-check
```

### Available Scripts
- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run type-check` - TypeScript validation
- `npm run lint` - ESLint with auto-fix

## Backend Dependencies

This frontend requires the Investment Tracker backend API running on port 3000. The backend provides:

- Portfolio positions from IBKR
- Risk calculations (ATR, volatility, position risk scores)
- Market data with gap-based fetching
- Protective order analysis

See backend CLAUDE.md for setup instructions.