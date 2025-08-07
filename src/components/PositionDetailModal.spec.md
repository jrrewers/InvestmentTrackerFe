# Position Detail Modal Specification

## Overview
A comprehensive modal component that displays detailed position information by aggregating data from multiple API endpoints when a user clicks on a position row in the portfolio table.

## User Stories

### Primary Use Case
**As a** portfolio manager  
**I want to** click on any position in my portfolio table  
**So that** I can view comprehensive details about that position including risk metrics, ATR analysis, and protective orders in a single modal

### Secondary Use Cases
**As a** risk analyst  
**I want to** see detailed risk breakdowns and ATR calculations for individual positions  
**So that** I can make informed decisions about position adjustments

**As a** trader  
**I want to** view protective order details and suggested stop-loss/take-profit levels  
**So that** I can manage my risk exposure effectively

## Functional Requirements

### Modal Trigger
- **Action**: Single click on any row in the PositionsTable component
- **Result**: Modal opens with selected position data
- **Visual Feedback**: Row hover effect with cursor pointer to indicate clickability

### Data Sources Integration
The modal integrates data from multiple API endpoints:

1. **Base Position Data** (from existing portfolio query)
   - Basic position information (symbol, quantity, market value, P&L)
   - Portfolio context (position size percentage, currency conversions)

2. **ATR Analysis** (`GET /api/portfolio/{symbol}/atr`)
   - 20-day ATR calculation
   - Volatility scoring
   - Suggested stop-loss and take-profit levels
   - Risk/reward ratios
   - ATR-specific warnings

3. **Risk Analysis Context** (`GET /api/portfolio/risk-analysis`)
   - Portfolio-level risk metrics
   - Position-specific risk factor breakdowns
   - Market conditions assessment
   - Risk-based recommendations

### Modal Structure
**Tab Organization**:
1. **Position Info** - Basic position and P&L data
2. **Risk Analysis** - Risk scores, volatility, warnings, and ATR details
3. **Protective Orders** - Stop-loss/take-profit order details
4. **Portfolio Risk Context** - Portfolio-wide risk context and position-specific risk factors

### UI Components Used
- **PrimeVue Dialog** - Modal container with responsive breakpoints
- **PrimeVue TabView/TabPanel** - Organized content sections
- **PrimeVue Card** - Content grouping and visual hierarchy
- **PrimeVue Tag** - Status indicators, confidence levels, order types
- **PrimeVue ProgressBar** - Risk score visualization with color coding
- **PrimeVue Message** - Warning and error display
- **PrimeVue ProgressSpinner** - Loading states for async data

### Loading States
- **ATR Data**: Independent loading spinner while fetching symbol-specific ATR
- **Risk Analysis**: Independent loading spinner for portfolio risk context
- **Error Handling**: Graceful error messages with retry options

### Responsive Design
- **Desktop**: 80vw width, max 1200px
- **Tablet**: 75vw width (screens < 1199px)
- **Mobile**: 90vw width (screens < 575px)

## Technical Implementation

### Component Architecture
```
PositionDetailModal.vue
├── Props: { visible: boolean, position: Position | null }
├── Emits: { 'update:visible': boolean }
├── Queries: 
│   ├── useATRCalculation(computed symbol)
│   └── useRiskAnalysis()
└── Computed: positionRiskDetails (filtered from risk analysis)
```

### State Management
- **Modal Visibility**: Reactive prop with v-model binding
- **Selected Position**: Passed as prop from parent PositionsTable
- **Query States**: Managed by TanStack Query with automatic caching

### Data Flow
1. User clicks position row → PositionsTable.onRowSelect()
2. selectedPosition.value = clicked position
3. modalVisible.value = true
4. Modal opens and triggers ATR query for position.symbol
5. Existing risk analysis query provides portfolio context
6. All data renders in organized tab structure

## Expected Outcomes

### Success Criteria
- ✅ Modal opens smoothly on position row click
- ✅ All API endpoints load independently with proper loading states
- ✅ Data displays in organized, readable format
- ✅ Error handling works gracefully for failed API calls
- ✅ Modal is responsive across device sizes
- ✅ TypeScript type safety maintained throughout

### Performance Expectations
- **Modal Open Speed**: < 200ms for basic position data display
- **ATR Data Load**: < 2s for individual symbol ATR calculation
- **Risk Analysis Load**: < 1s (leverages existing portfolio query cache)
- **Memory Usage**: Modal data garbage collected after 5min (TanStack Query gcTime)

### User Experience Goals
- **Discoverability**: Clear visual indication that rows are clickable
- **Information Density**: Comprehensive data without overwhelming interface
- **Navigation**: Easy tab switching between different data views
- **Accessibility**: Keyboard navigation support, proper ARIA labels

## Edge Cases Handled

### Data Availability
- **Missing ATR Data**: Shows loading state, then error message with retry option
- **Missing Protective Orders**: Shows "No protective orders" state
- **Risk Calculation Warnings**: Displayed prominently with appropriate severity

### Error Scenarios
- **Network Failures**: Error messages with retry functionality
- **Invalid Symbol**: ATR query disabled for empty/invalid symbols
- **API Timeouts**: Automatic retry with exponential backoff

### Performance Considerations
- **Query Caching**: ATR data cached for 5 minutes per symbol
- **Background Refetching**: Risk analysis updates in background
- **Memory Management**: Query data automatically garbage collected

## Testing Strategy

### Unit Tests
- Modal visibility state management
- Position data prop passing
- Query hook integration
- Error state handling

### Integration Tests
- PositionsTable row click → modal opening
- API data loading and display
- Tab navigation functionality
- Responsive behavior validation

### User Acceptance Testing
- End-to-end position detail viewing workflow
- Cross-browser compatibility
- Mobile device testing
- Accessibility compliance

## Future Enhancements

### Potential Features
- **Export Position Details**: Allow exporting position data as PDF/CSV
- **Historical Risk Trends**: Chart showing risk score evolution over time  
- **Order Actions**: Direct order placement/modification from modal
- **Position Notes**: User-added notes and alerts for positions
- **Benchmark Comparison**: Compare position performance to indices

### Technical Improvements
- **Virtualization**: For large datasets in risk analysis tables
- **Real-time Updates**: WebSocket integration for live price/risk updates
- **Offline Support**: Cache position details for offline viewing
- **Advanced Filtering**: Filter risk analysis data by various criteria