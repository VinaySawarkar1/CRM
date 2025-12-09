# Quotation Edit Form - Wrong Data Issue: Deep Analysis & Solution

## Problem Statement
When editing quotations, the form displays wrong/stale data from previously viewed quotations instead of the current quotation being edited.

## Root Cause Analysis

### Issue #1: React Query Cache Key Not Properly Invalidated
**Location:** `client/src/pages/quotation-form-page.tsx` lines 122-130

```typescript
const { data: quotation, isLoading: isLoadingQuotation, refetch: refetchQuotation } = useQuery<Quotation>({
  queryKey: ["/api/quotations", quotationId],
  queryFn: async () => { ... },
  enabled: !!quotationId,
});
```

**Problem:** 
- When navigating from quotation A (ID: 5) to quotation B (ID: 8), the queryKey changes from `["/api/quotations", 5]` to `["/api/quotations", 8]`
- React Query creates a NEW cache entry for the new ID
- However, if React Query caches are stale or if the previous data hasn't been properly cleared, the old component state might persist momentarily
- The key prop `edit-${quotationId}-${quotation?.id}` doesn't change until the data loads, causing a timing issue

### Issue #2: Form Component Renders Before Data Loads
**Location:** `client/src/pages/quotation-form-page.tsx` lines 305-312

```typescript
{(!isEditMode || !isLoadingQuotation) && (
  <div className="bg-white rounded-lg border">
    <QuotationForm
      key={leadId ? `lead-${leadId}` : (isEditMode ? `edit-${quotationId}-${quotation?.id}` : `new-${Date.now()}`)}
      onSubmit={handleSubmit}
      isSubmitting={createQuotation.isPending || updateQuotation.isPending}
      mode={isEditMode ? "edit" : "create"}
      defaultValues={quotation || processedCopySource || prefillFromLead}
    />
  </div>
)}
```

**Problem:**
- The condition `!isLoadingQuotation` allows the form to render before data loads (when `quotation` is still undefined)
- The `defaultValues={quotation || processedCopySource || prefillFromLead}` falls through to `processedCopySource` or `prefillFromLead` when `quotation` is loading
- If the user navigated from another quotation, these fallback values might contain stale data
- The key changes from `edit-5-5` to `edit-8-undefined` to `edit-8-8` - with intermediate states showing wrong data

### Issue #3: No Cache Invalidation Strategy
**Location:** `client/src/pages/quotation-form-page.tsx` lines 131-137

```typescript
useEffect(() => {
  if (quotationId && isEditMode) {
    console.log(`🔄 Quotation ID changed to ${quotationId}, refetching...`);
    refetchQuotation();
  }
}, [quotationId, isEditMode]);
```

**Problem:**
- While a `refetch()` is called when ID changes, there's no guarantee the old query cache is cleared
- The `staleTime` for the query isn't explicitly set (defaults to 0), but the cache might still serve stale data
- No explicit cache invalidation on the old quotation ID before fetching the new one

## Solution Implementation

### Fix #1: Use Proper Query Stale Time & Cache Control

Set appropriate cache timing and ensure cache invalidation:

```typescript
const { data: quotation, isLoading: isLoadingQuotation, refetch: refetchQuotation } = useQuery<Quotation>({
  queryKey: ["/api/quotations", quotationId],
  queryFn: async () => { ... },
  enabled: !!quotationId,
  staleTime: 0,  // Data is immediately stale - always refetch on mount
  gcTime: 0,     // Don't keep data in garbage collection - remove immediately when unused
});
```

### Fix #2: Improve Key Generation & Form Rendering Logic

Use the quotationId in the key immediately, and ensure form only renders when data is ready:

```typescript
// Only render form when we have the actual data in edit mode
{(!isEditMode || (!isLoadingQuotation && quotation)) && (
  <div className="bg-white rounded-lg border">
    <QuotationForm
      // Force full remount when quotationId changes by including it before data loads
      key={leadId ? `lead-${leadId}` : (isEditMode ? `edit-${quotationId}-${quotation?.id}-${Date.now()}` : `new-${Date.now()}`)}
      onSubmit={handleSubmit}
      isSubmitting={createQuotation.isPending || updateQuotation.isPending}
      mode={isEditMode ? "edit" : "create"}
      // Only pass quotation data when it's actually loaded
      defaultValues={quotation || processedCopySource || prefillFromLead}
    />
  </div>
)}
```

### Fix #3: Add Explicit Cache Invalidation

Invalidate the old quotation cache when ID changes:

```typescript
useEffect(() => {
  if (quotationId && isEditMode) {
    // First, invalidate ALL quotation caches to ensure fresh data
    queryClient.invalidateQueries({ queryKey: ["/api/quotations"] });
    // Then refetch this specific quotation
    console.log(`🔄 Quotation ID changed to ${quotationId}, invalidating cache and refetching...`);
    refetchQuotation();
  }
}, [quotationId, isEditMode]);
```

### Fix #4: Add useEffect Dependency in QuotationForm

Ensure the form properly resets when defaultValues change:

```typescript
// In quotation-form.tsx, add/update the useEffect that handles defaultValues changes
useEffect(() => {
  if (defaultValues && mode === "edit") {
    // Reset the form with new default values
    reset(defaultValues);
    // ... rest of the logic
  }
}, [defaultValues, mode, reset]);
```

## Implementation Steps

1. ✅ Update React Query configuration in quotation-form-page.tsx
2. ✅ Fix form rendering condition to only show when data is loaded
3. ✅ Improve key prop to include timestamp for forced remount
4. ✅ Add explicit cache invalidation on ID change
5. ✅ Ensure form useEffect properly handles defaultValues changes
6. ✅ Test by navigating between different quotations

## Expected Behavior After Fix

1. User navigates to edit quotation #5 → Quotation #5 data loads and displays correctly
2. User navigates to edit quotation #8 → Loading indicator shows, form doesn't render yet
3. Once quotation #8 data loads → Form remounts completely with fresh data
4. All fields show correct values for quotation #8
5. No stale data from quotation #5 visible at any point

## Data Flow (Corrected)

```
URL Change: /quotations/edit/5 → /quotations/edit/8
  ↓
quotationId changes: 5 → 8
  ↓
React Query cache invalidated for old data
  ↓
useEffect triggers refetch for ID=8
  ↓
API call: GET /api/quotations/8
  ↓
Data received & cached with key ["/api/quotations", 8]
  ↓
quotation state updates
  ↓
isLoadingQuotation changes to false
  ↓
Condition `!isLoadingQuotation && quotation` becomes true
  ↓
Form component remounts with new key
  ↓
defaultValues={quotation} populated with correct data
  ↓
Form displays correct data from quotation #8
```
