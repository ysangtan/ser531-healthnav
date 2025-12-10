# Frontend-Backend Integration Guide

This document explains how the Healthcare Navigator frontend integrates with the FastAPI backend, including the fallback system, data flow, and architectural decisions.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [Fallback System](#fallback-system)
5. [API Integration](#api-integration)
6. [TypeScript Type System](#typescript-type-system)
7. [Error Handling](#error-handling)
8. [State Management](#state-management)
9. [Implementation Details](#implementation-details)
10. [Best Practices](#best-practices)

---

## Overview

The Healthcare Navigator uses a modern, resilient architecture that connects a React TypeScript frontend to a FastAPI backend powered by a GraphDB knowledge graph. The system is designed with **offline-first** principles and graceful degradation.

### Key Features

- **Automatic Fallback**: Seamlessly switches between API and mock data
- **Type Safety**: Full TypeScript coverage with optional field handling
- **Real-time Monitoring**: Live backend connectivity status
- **Smart Caching**: React Query for efficient data management
- **User Transparency**: Visual indicators for data source (API vs mock)
- **Graceful Recovery**: Automatic reconnection when backend comes online

---

## Architecture

### High-Level Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                   React Components                      │  │
│  │  (Search, Providers, Hospitals, ProviderDetail, etc.)  │  │
│  └────────────────┬───────────────────────────────────────┘  │
│                   │                                           │
│                   ▼                                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │            Data Provider Layer                         │  │
│  │  (useProvidersWithFallback, useHospitalsWithFallback) │  │
│  └────────────────┬───────────────────────────────────────┘  │
│                   │                                           │
│         ┌─────────┴─────────┐                                │
│         │                   │                                │
│         ▼                   ▼                                │
│  ┌─────────────┐     ┌─────────────┐                        │
│  │ React Query │     │  Mock Data  │                        │
│  │   Hooks     │     │  (Fallback) │                        │
│  └──────┬──────┘     └─────────────┘                        │
│         │                                                     │
│         ▼                                                     │
│  ┌─────────────┐                                             │
│  │ API Client  │                                             │
│  │  (Axios)    │                                             │
│  └──────┬──────┘                                             │
└─────────┼──────────────────────────────────────────────────┘
          │
          │ HTTP Request
          │ VITE_API_URL
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                        Backend                               │
│  ┌─────────────┐                                             │
│  │   FastAPI   │                                             │
│  │  (Port 8000)│                                             │
│  └──────┬──────┘                                             │
│         │                                                     │
│    ┌────┴────┐                                               │
│    │         │                                               │
│    ▼         ▼                                               │
│  ┌─────┐  ┌────────┐                                        │
│  │ MDB │  │GraphDB │                                        │
│  │Cache│  │ (RDF)  │                                        │
│  └─────┘  └────────┘                                        │
└─────────────────────────────────────────────────────────────┘
```

### Component Layers

1. **UI Layer**: React components (pages and presentational components)
2. **Data Provider Layer**: Fallback logic wrapper around API hooks
3. **API Client Layer**: React Query hooks + Axios client
4. **Mock Data Layer**: Local TypeScript data for offline mode
5. **Backend Layer**: FastAPI with GraphDB and MongoDB

---

## Data Flow

### Successful API Request Flow

```
1. User navigates to /providers page
   ↓
2. Providers.tsx calls useProvidersWithFallback()
   ↓
3. useProvidersWithFallback checks enableMockFallback flag
   ↓
4. Calls useProviders() from useApi.ts
   ↓
5. React Query checks cache
   ↓
6. If stale, makes HTTP GET to /api/v1/providers via Axios
   ↓
7. Backend queries GraphDB with SPARQL
   ↓
8. Results cached in MongoDB
   ↓
9. Response returned to frontend
   ↓
10. React Query caches result
   ↓
11. useProvidersWithFallback returns { data, isLoading: false, error: null, usingMockData: false }
   ↓
12. Providers.tsx renders provider cards
```

### Failed API Request Flow (Fallback)

```
1. User navigates to /providers page
   ↓
2. Providers.tsx calls useProvidersWithFallback()
   ↓
3. useProvidersWithFallback checks enableMockFallback flag
   ↓
4. Calls useProviders() from useApi.ts
   ↓
5. React Query attempts HTTP GET to /api/v1/providers
   ↓
6. Request fails (network error, backend offline, etc.)
   ↓
7. React Query returns error state
   ↓
8. useProvidersWithFallback detects error
   ↓
9. Returns mock data from providers.ts
   ↓
10. Returns { data: mockProviders, isLoading: false, error, usingMockData: true }
   ↓
11. Providers.tsx renders provider cards with "(Demo Data)" indicator
   ↓
12. BackendStatusBanner shows "Using demo data - Backend unavailable"
```

---

## Fallback System

### Design Philosophy

The fallback system ensures the application remains **fully functional** even when the backend is unavailable. This enables:

- **Offline development**: Frontend developers can work without running backend
- **Demo mode**: Showcase UI/UX without infrastructure setup
- **Resilience**: App continues working during backend downtime
- **User experience**: No blank screens or cryptic error messages

### Implementation

#### Core File: `dataProvider.ts`

Location: `healthnav-ui-kit/src/lib/dataProvider.ts`

```typescript
import { config } from './config';
import { useProviders, useHospitals, useSpecialties } from './hooks/useApi';
import { providers as mockProviders } from '@/data/providers';
import { hospitals as mockHospitals } from '@/data/hospitals';

export interface DataWithFallback<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
  usingMockData: boolean;
}

export function useProvidersWithFallback(): DataWithFallback<Provider[]> {
  const { data, isLoading, error } = useProviders();
  const shouldUseMock = config.enableMockFallback && (error || !data);

  return {
    data: shouldUseMock ? mockProviders : (data as Provider[] || []),
    isLoading,
    error: error as Error | null,
    usingMockData: shouldUseMock,
  };
}
```

**Key Decision**: Use `error || !data` to determine fallback
- If error exists → use mock
- If no error but data is undefined → use mock
- If data exists → use API data

### Backend Status Monitoring

Location: `healthnav-ui-kit/src/lib/hooks/useBackendStatus.ts`

```typescript
import { useHealthCheck } from './useApi';

export function useBackendStatus(): BackendStatus {
  const { data, isError } = useHealthCheck();

  return {
    isOnline: !isError && data?.status === 'healthy',
    status: data?.status || 'offline',
    graphdbConnected: data?.graphdb_connected || false,
    mongodbConnected: data?.mongodb_connected || false,
  };
}
```

**Health Check Endpoint**: `GET /api/v1/health`

Response:
```json
{
  "status": "healthy",
  "graphdb_connected": true,
  "mongodb_connected": true
}
```

### Status Banner

Location: `healthnav-ui-kit/src/components/BackendStatusBanner.tsx`

**Visual Feedback**:
- ✅ **Connected**: Green banner "Connected to backend" (auto-hides after 3s)
- ⚠️ **Offline**: Yellow banner "Using demo data - Backend unavailable" (persistent)
- 🔄 **Retry**: Button to manually trigger reconnection attempt

---

## API Integration

### API Client Configuration

Location: `healthnav-ui-kit/src/lib/api.ts`

```typescript
import axios from 'axios';
import { config } from './config';

export const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

### React Query Setup

Location: `healthnav-ui-kit/src/App.tsx`

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 minutes
      cacheTime: 10 * 60 * 1000,    // 10 minutes
      retry: 1,                      // Retry failed requests once
      refetchOnWindowFocus: false,   // Don't refetch on window focus
    },
  },
});
```

**Rationale**:
- **staleTime: 5 min**: Data considered fresh for 5 minutes
- **cacheTime: 10 min**: Cache retained for 10 minutes after last use
- **retry: 1**: Single retry on failure (quick fallback to mock)
- **refetchOnWindowFocus: false**: Avoid unnecessary refetches

### API Hooks

Location: `healthnav-ui-kit/src/lib/hooks/useApi.ts`

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../api';

export function useProviders() {
  return useQuery({
    queryKey: ['providers'],
    queryFn: async () => {
      const { data } = await apiClient.get('/providers');
      return data;
    },
  });
}

export function useSymptomSearch() {
  return useMutation({
    mutationFn: async (symptom: string) => {
      const { data } = await apiClient.post('/search/symptom', { symptom });
      return data;
    },
  });
}
```

### Available API Endpoints

| Method | Endpoint | Hook | Description |
|--------|----------|------|-------------|
| GET | `/health` | `useHealthCheck()` | Backend health status |
| GET | `/providers` | `useProviders()` | All providers |
| GET | `/providers/:id` | `useProvider(id)` | Single provider |
| GET | `/hospitals` | `useHospitals()` | All hospitals |
| GET | `/hospitals/:id` | `useHospital(id)` | Single hospital |
| GET | `/pharmacies` | `usePharmacies(params)` | Pharmacies by location |
| GET | `/specialties` | `useSpecialties()` | All specialties |
| POST | `/search/symptom` | `useSymptomSearch()` | Search by symptom |

---

## TypeScript Type System

### Challenge: Optional Fields

**Problem**: Backend returns optional fields (e.g., `hospitalId`, `hcahpsScore`) but frontend initially had them as required, causing TypeScript errors.

**Solution**: Update interfaces to match backend schema by making fields optional.

### Updated Type Definitions

#### Provider Interface

Location: `healthnav-ui-kit/src/data/providers.ts`

```typescript
export interface Provider {
  // Required fields
  id: string;
  npi: string;
  name: string;
  firstName: string;
  lastName: string;
  specialties: string[];
  lat: number;
  lng: number;
  conditions: string[];
  symptoms: string[];

  // Optional fields
  hospitalId?: string;
  hospitalName?: string;
  hcahpsScore?: number;
  distance?: number;
  phone?: string;
  address?: string;
}
```

#### Hospital Interface

```typescript
export interface Hospital {
  // Required fields
  id: string;
  cmsId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  hcahpsScore: number;
  lat: number;
  lng: number;
  affiliatedProviders: number;
  emergencyServices: boolean;

  // Optional fields
  phone?: string;
  about?: string;
  bedCount?: number;
}
```

### Handling Optional Fields in Components

**Pattern**: Use optional chaining and nullish coalescing

```typescript
// ✅ Good: Optional chaining
{provider.phone && (
  <div>Phone: {provider.phone}</div>
)}

// ✅ Good: Nullish coalescing with fallback
<p>{pharmacy.chain || pharmacy.name}</p>

// ✅ Good: Conditional check before use
{provider.distance !== undefined && (
  <span>{provider.distance} mi</span>
)}

// ❌ Bad: Direct access (may throw error)
<div>Distance: {provider.distance} miles</div>
```

---

## Error Handling

### Levels of Error Handling

1. **Network Level**: Axios interceptors
2. **Query Level**: React Query error boundaries
3. **Component Level**: Error states and fallback UI
4. **User Level**: Visual feedback (ErrorState component)

### ErrorState Component

Location: `healthnav-ui-kit/src/components/ui/ErrorState.tsx`

```typescript
export function ErrorState({
  title = "Error Loading Data",
  message = "There was a problem loading the data.",
  onRetry,
  showFallbackMessage = true,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>{message}</p>
        {showFallbackMessage && (
          <p className="text-sm text-muted-foreground">
            Using demo data instead.
          </p>
        )}
        {onRetry && <Button onClick={onRetry}>Try Again</Button>}
      </AlertDescription>
    </Alert>
  );
}
```

### Usage in Components

```typescript
export default function Providers() {
  const { data: providers, isLoading, error, usingMockData } = useProvidersWithFallback();

  return (
    <div>
      {error && !usingMockData && (
        <ErrorState
          title="Failed to Load Providers"
          message={error.message}
        />
      )}

      {/* Rest of component */}
    </div>
  );
}
```

**Logic**: Only show error state if error exists AND not using mock data (i.e., mock fallback failed)

---

## State Management

### Strategy

- **Global State**: None (by design)
- **Server State**: React Query
- **Local State**: React useState/useReducer
- **URL State**: React Router params

**Rationale**: Server state (API data) is the source of truth. No need for Redux/Zustand when React Query handles caching, synchronization, and refetching.

### React Query as State Manager

**Benefits**:
- Automatic background refetching
- Optimistic updates
- Request deduplication
- Parallel queries
- Dependent queries
- Pagination & infinite scroll support

**Example: Dependent Queries**

```typescript
// In ProviderDetail.tsx
const { data: provider } = useProviderWithFallback(id);
const { data: hospital } = useHospitalWithFallback(provider?.hospitalId || "");
```

Hospital query only runs when provider data is available and has a `hospitalId`.

---

## Implementation Details

### Pages Updated with API Integration

All following pages have been updated to use the API with fallback:

1. **Search.tsx**: Main search page with filters
   - Uses `useProvidersWithFallback()`, `useHospitalsWithFallback()`, `usePharmaciesWithFallback()`
   - Client-side filtering on API data
   - Loading skeletons during fetch

2. **Providers.tsx**: All providers list
   - Uses `useProvidersWithFallback()`
   - Grid layout with provider cards
   - "(Demo Data)" indicator when using mock

3. **Hospitals.tsx**: All hospitals list
   - Uses `useHospitalsWithFallback()`
   - HCAHPS score badges
   - Error state handling

4. **ProviderDetail.tsx**: Single provider detail page
   - Uses `useProviderWithFallback(id)` and `useHospitalWithFallback(hospitalId)`
   - Handles optional hospitalId
   - Loading skeleton for detail view

5. **HospitalDetail.tsx**: Single hospital detail page
   - Uses `useHospitalWithFallback(id)`
   - Fetches affiliated providers
   - Nearby pharmacies section

6. **SearchBar.tsx**: Search filters component
   - Uses `useSpecialtiesWithFallback()` for specialty dropdown
   - Loading state for specialties

7. **AppLayout.tsx**: Main layout wrapper
   - Includes `BackendStatusBanner` at top
   - Visible across all pages

### Loading States

**Pattern**: Skeleton screens during data fetch

```typescript
{isLoading ? (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[...Array(6)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  // Actual content
)}
```

---

## Best Practices

### 1. Always Use Data Provider Hooks

❌ **Don't**: Import mock data directly
```typescript
import { providers } from '@/data/providers';
```

✅ **Do**: Use fallback hook
```typescript
const { data: providers, isLoading, error, usingMockData } = useProvidersWithFallback();
```

### 2. Handle Optional Fields

❌ **Don't**: Assume fields exist
```typescript
<p>{provider.phone}</p>  // May be undefined
```

✅ **Do**: Check before use
```typescript
{provider.phone && <p>{provider.phone}</p>}
```

### 3. Show Loading States

❌ **Don't**: Display nothing while loading
```typescript
return <div>{providers.map(...)}</div>;
```

✅ **Do**: Show skeleton
```typescript
if (isLoading) return <Skeleton />;
return <div>{providers.map(...)}</div>;
```

### 4. Indicate Data Source

❌ **Don't**: Hide that demo data is being used
```typescript
<p>{providers.length} providers found</p>
```

✅ **Do**: Show "(Demo Data)" indicator
```typescript
<p>
  {providers.length} providers found
  {usingMockData && <span className="text-xs text-yellow-600">(Demo Data)</span>}
</p>
```

### 5. Handle Errors Gracefully

❌ **Don't**: Let errors crash the page
```typescript
const { data } = useProviders();
return <div>{data.map(...)}</div>;  // Crashes if data is undefined
```

✅ **Do**: Show error state
```typescript
const { data, error } = useProvidersWithFallback();

if (error && !usingMockData) {
  return <ErrorState message={error.message} />;
}

return <div>{data.map(...)}</div>;
```

### 6. Use TypeScript Strictly

❌ **Don't**: Use `any` type
```typescript
const handleData = (data: any) => { ... }
```

✅ **Do**: Use proper types
```typescript
const handleData = (data: Provider[]) => { ... }
```

### 7. Optimize React Query Configuration

❌ **Don't**: Refetch unnecessarily
```typescript
useQuery({ queryKey: ['providers'], queryFn: fetchProviders });
// Defaults: refetch on every window focus, mount, etc.
```

✅ **Do**: Configure sensible defaults
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});
```

---

## Troubleshooting Common Issues

### Issue: "Using demo data" banner always visible

**Cause**: Backend not running or unreachable

**Solution**:
1. Verify backend is running: `curl http://localhost:8000/api/v1/health`
2. Check `VITE_API_URL` in `.env.local`
3. Check browser console for CORS errors
4. Verify backend has CORS configured for `http://localhost:8080`

### Issue: TypeScript error "Property X does not exist"

**Cause**: Accessing optional field without checking

**Solution**: Add null check or optional chaining
```typescript
// Before
<p>{provider.phone}</p>

// After
{provider.phone && <p>{provider.phone}</p>}
```

### Issue: Infinite loading state

**Cause**: React Query error with no retry limit

**Solution**: Configure retry policy
```typescript
useQuery({
  queryKey: ['providers'],
  queryFn: fetchProviders,
  retry: 1,  // Only retry once
});
```

### Issue: Data not updating after backend restart

**Cause**: React Query cache is stale

**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Click "Retry" on status banner
3. Or clear cache programmatically:
   ```typescript
   queryClient.invalidateQueries(['providers']);
   ```

---

## Summary

The Healthcare Navigator frontend-backend integration demonstrates modern best practices:

✅ **Resilient**: Works offline with fallback system
✅ **Type-Safe**: Full TypeScript coverage
✅ **User-Friendly**: Visual feedback on connection status
✅ **Performant**: Smart caching with React Query
✅ **Maintainable**: Clean separation of concerns
✅ **Testable**: Mock data for isolated testing

**Key Files**:
- `src/lib/dataProvider.ts` - Fallback logic
- `src/lib/hooks/useApi.ts` - React Query hooks
- `src/lib/api.ts` - Axios client
- `src/components/BackendStatusBanner.tsx` - Status indicator
- `src/lib/config.ts` - Configuration

**Next Steps**:
1. Explore GraphDB SPARQL queries in backend
2. Add integration tests
3. Implement advanced features (filters, pagination)
4. Optimize bundle size
5. Add E2E tests with Playwright

For questions or issues, refer to [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md) or the main [README.md](./README.md).

---

**Last Updated**: 2025-12-09
**Status**: ✅ Integration Complete
