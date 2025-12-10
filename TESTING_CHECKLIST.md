# Healthcare Navigator - Manual Testing Checklist

This checklist helps verify that the frontend-backend integration is working correctly and that the fallback system functions as expected.

## Environment Setup

- [ ] GraphDB running on port 7200
- [ ] MongoDB running on port 27017
- [ ] Backend server running on port 8000
- [ ] Frontend dev server running on port 8080 (or 5173)

## Test Scenarios

### Scenario 1: Frontend Standalone (Backend Offline)

**Purpose**: Verify fallback to mock data works correctly

#### Steps:
1. [ ] Ensure backend is NOT running
2. [ ] Start frontend with `npm run dev`
3. [ ] Open http://localhost:8080 in browser

#### Expected Results:
- [ ] Backend status banner shows "Using demo data - Backend unavailable"
- [ ] Banner has yellow/warning color
- [ ] Home page loads successfully
- [ ] All navigation links work

#### Page Tests - Mock Data Mode:

**Search Page** (`/search` or `/`)
- [ ] Search bar displays correctly
- [ ] Filters popover opens and shows specialties
- [ ] Providers list shows demo data
- [ ] Provider cards display with "(Demo Data)" indicator
- [ ] Map view loads
- [ ] Clicking provider card shows details
- [ ] Filter by symptom works (client-side filtering)
- [ ] Filter by specialty works
- [ ] Filter by HCAHPS score works
- [ ] Filter by radius works
- [ ] "Clear Filters" button works

**Providers Page** (`/providers`)
- [ ] Page shows list of providers
- [ ] Shows "(Demo Data)" indicator
- [ ] Provider cards render correctly
- [ ] Clicking card navigates to detail page
- [ ] Avatar initials display correctly
- [ ] Specialty badges show
- [ ] Hospital name displays (when available)
- [ ] Distance displays (when available)

**Hospitals Page** (`/hospitals`)
- [ ] Page shows list of hospitals
- [ ] Shows "(Demo Data)" indicator
- [ ] Hospital cards render correctly
- [ ] HCAHPS badges display correctly
- [ ] Bed count shows (when available)
- [ ] Clicking card navigates to detail page

**Provider Detail** (`/provider/:id`)
- [ ] Page loads with provider information
- [ ] Back button works
- [ ] Save/Unsave button toggles correctly
- [ ] Compare button works
- [ ] Specialties display
- [ ] Conditions and symptoms show
- [ ] Contact information displays
- [ ] Optional fields handled gracefully (no errors if missing)
- [ ] Affiliated hospital link works (if available)
- [ ] Tabs switch correctly (Overview, Locations, Notes)

**Hospital Detail** (`/hospital/:id`)
- [ ] Page loads with hospital information
- [ ] Back button works
- [ ] Set as Preferred button shows toast
- [ ] HCAHPS score displays correctly
- [ ] About section shows (if available)
- [ ] Quality score section renders
- [ ] Affiliated providers list shows
- [ ] Hospital info sidebar displays
- [ ] Optional fields handled (bedCount, phone, about)
- [ ] Nearby pharmacies section shows

**Saved Page** (`/saved`)
- [ ] Saved providers list works
- [ ] Recent searches display
- [ ] Save/unsave functionality works

**Compare Page** (`/compare`)
- [ ] Can add providers to compare
- [ ] Comparison view works
- [ ] Remove from compare works
- [ ] Maximum 3 providers enforced

---

### Scenario 2: Full Stack Integration (Backend Online)

**Purpose**: Verify API calls work and data flows from backend

#### Setup Steps:
1. [ ] Start GraphDB on port 7200
2. [ ] Start MongoDB on port 27017
3. [ ] Seed GraphDB with data:
   ```bash
   cd backend
   source venv/bin/activate
   python ops/generate_ttl_data.py
   python ops/seed_graphdb.py
   ```
4. [ ] Start backend:
   ```bash
   python -m app.main
   ```
5. [ ] Start frontend:
   ```bash
   cd healthnav-ui-kit
   npm run dev
   ```

#### Expected Results:
- [ ] Backend status banner briefly shows "Connected to backend" (green)
- [ ] Banner auto-hides after 2-3 seconds
- [ ] NO "(Demo Data)" indicators visible
- [ ] All pages load data from API

#### API Integration Tests:

**Health Check**
- [ ] Open browser console
- [ ] Check Network tab for `/api/v1/health` request
- [ ] Response status: 200
- [ ] Response body contains: `{"status": "healthy", "graphdb_connected": true, "mongodb_connected": true}`

**Providers API** (`GET /api/v1/providers`)
- [ ] Network tab shows request to `/api/v1/providers`
- [ ] Response status: 200
- [ ] Response contains array of provider objects
- [ ] Providers page renders API data
- [ ] Provider fields match backend schema

**Hospitals API** (`GET /api/v1/hospitals`)
- [ ] Network tab shows request to `/api/v1/hospitals`
- [ ] Response status: 200
- [ ] Response contains array of hospital objects
- [ ] Hospitals page renders API data

**Specialties API** (`GET /api/v1/specialties`)
- [ ] Filters popover shows specialties from API
- [ ] Specialties load correctly in SearchBar

**Provider by ID** (`GET /api/v1/providers/:id`)
- [ ] Clicking provider navigates to detail page
- [ ] Network request to `/api/v1/providers/{id}`
- [ ] Detail page shows correct provider
- [ ] All fields populate correctly

**Hospital by ID** (`GET /api/v1/hospitals/:id`)
- [ ] Clicking hospital navigates to detail page
- [ ] Network request to `/api/v1/hospitals/{id}`
- [ ] Detail page shows correct hospital

**Symptom Search** (`POST /api/v1/search/symptom`)
- [ ] Enter symptom in search bar (e.g., "chest pain")
- [ ] Click search button
- [ ] Network request to `/api/v1/search/symptom`
- [ ] Results update based on API response
- [ ] Related providers display

**Pharmacies API** (`GET /api/v1/pharmacies`)
- [ ] Network request to pharmacies endpoint
- [ ] Pharmacies data loads on map or pharmacy sections

---

### Scenario 3: Backend Failure & Recovery

**Purpose**: Verify graceful degradation and recovery

#### Test Backend Failure:
1. [ ] Start with backend running and frontend connected
2. [ ] Stop the backend server (Ctrl+C)
3. [ ] Refresh frontend page or navigate to new page

#### Expected Results:
- [ ] Backend status banner appears: "Using demo data - Backend unavailable"
- [ ] Page continues to function with mock data
- [ ] No app crashes or white screens
- [ ] All features remain accessible
- [ ] "(Demo Data)" indicator appears on pages

#### Test Backend Recovery:
1. [ ] With backend stopped and frontend showing mock data
2. [ ] Restart backend server
3. [ ] Wait 5 seconds (React Query refetch interval)
4. [ ] Click "Retry" on status banner OR refresh page

#### Expected Results:
- [ ] Status banner changes to "Connected to backend" (green)
- [ ] Banner auto-hides after 2-3 seconds
- [ ] Data switches from mock to API
- [ ] "(Demo Data)" indicators disappear
- [ ] Page functionality unaffected by transition

---

### Scenario 4: Error Handling

**Purpose**: Verify error states display correctly

#### Network Errors:
- [ ] With backend offline, error state shows on relevant pages
- [ ] Error message is user-friendly
- [ ] Fallback message explains demo data is being used

#### 404 Errors:
- [ ] Navigate to `/provider/nonexistent-id`
- [ ] "Provider Not Found" page displays
- [ ] "Back to Search" button works
- [ ] Navigate to `/hospital/nonexistent-id`
- [ ] "Hospital Not Found" page displays

#### Loading States:
- [ ] Slow down network in DevTools (Network > Throttling > Slow 3G)
- [ ] Navigate to Providers page
- [ ] Skeleton loaders display
- [ ] Content appears after loading completes

---

### Scenario 5: Data Consistency

**Purpose**: Ensure optional fields are handled correctly

#### Optional Field Tests:
- [ ] Providers without `hospitalId` display correctly (no errors)
- [ ] Providers without `hospitalName` don't show hospital section
- [ ] Providers without `distance` don't show distance
- [ ] Providers without `phone` don't show phone section
- [ ] Hospitals without `about` don't show about section
- [ ] Hospitals without `bedCount` don't show bed count
- [ ] Hospitals without `phone` don't show phone
- [ ] Pharmacies without `chain` show name instead
- [ ] Pharmacies without `hours` show "Hours vary"
- [ ] Pharmacies without `distance` don't show distance

---

## Performance Tests

- [ ] Initial page load < 3 seconds
- [ ] Subsequent navigation < 1 second (cached)
- [ ] Search results appear < 2 seconds
- [ ] Map renders without lag
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No broken images
- [ ] Smooth animations and transitions

---

## Browser Compatibility

Test in the following browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## Mobile Responsiveness

- [ ] Test on mobile viewport (DevTools: Toggle Device Toolbar)
- [ ] Search bar layout adapts to mobile
- [ ] List/Map toggle shows on mobile
- [ ] Cards stack vertically
- [ ] Navigation menu works (hamburger menu)
- [ ] All buttons are tappable (min 44x44px)
- [ ] Text is readable (min 16px)

---

## Accessibility

- [ ] Keyboard navigation works (Tab through elements)
- [ ] Focus indicators visible
- [ ] ARIA labels present on interactive elements
- [ ] Screen reader friendly (test with VoiceOver/NVDA)
- [ ] Contrast ratios meet WCAG AA standards
- [ ] All images have alt text

---

## Final Verification

- [ ] All critical paths work in both mock and API modes
- [ ] No console errors in browser DevTools
- [ ] No TypeScript compilation errors
- [ ] All links navigate correctly
- [ ] All buttons perform expected actions
- [ ] Data displays accurately
- [ ] Loading states show appropriately
- [ ] Error states handle gracefully
- [ ] Backend status banner works correctly

---

## Notes

- **Current Status**: Frontend has been fully integrated with API fallback system
- **Backend Setup**: Backend may not be running yet; app will use mock data as fallback
- **Environment**: Frontend runs on port 8080, Backend on port 8000
- **GraphDB**: Required on port 7200 for backend to work
- **MongoDB**: Required on port 27017 for backend caching

---

## Common Issues & Solutions

### Issue: "Using demo data" banner always shows
**Solution**: Check that backend is running on http://localhost:8000 and VITE_API_URL is set correctly

### Issue: Providers not loading
**Solution**: Check browser console for errors; verify backend health endpoint returns 200

### Issue: TypeScript errors
**Solution**: Ensure all interfaces have optional fields marked with `?` where applicable

### Issue: Map not displaying
**Solution**: Check that providers have `lat` and `lng` coordinates

### Issue: Search not working
**Solution**: With backend, check symptom search API; without backend, verify client-side filtering logic

---

**Last Updated**: 2025-12-09
**Integration Status**: ✅ Frontend fully integrated with API and fallback system
