# SmartMeal Mobile – Development Roadmap

> **Purpose**: Define the recommended implementation order for the SmartMeal Flutter mobile application.
> **Target**: Feature parity with the existing Web application (`Client/`).
> **Backend**: Shared ASP.NET Core API (`Server/`). No backend changes are planned.

---

## Current State (as of analysis)

The project already has a working skeleton:

| Component | Status |
|---|---|
| Flutter project setup | Done |
| Dependency configuration (`pubspec.yaml`) | Done |
| Theme system (`AppTheme`, `AppColors`, `AppTextStyles`) | Done |
| Dio API client with JWT interceptor | Done |
| Auth flow (Provider + Service) | Done |
| Recipe browsing (Provider + Service) | Done |
| Nutrition diary (Provider + Service) | Done |
| Health profile (Provider + Service) | Done |
| Favorites (Provider + Service) | Done |
| Subscription service | Done |
| Main shell (bottom navigation, 5 tabs) | Done |
| Named routes (`/login`, `/register`, `/main`, `/recipe-detail`) | Done |
| Core screens scaffolded | Done (most are stubs) |

Missing or incomplete:
- Health survey / onboarding UI
- Meal plan UI and service
- Nutrition statistics UI (charts)
- Profile editing UI
- Avatar upload UI
- Subscription / payment UI
- Collection fetch for favorites
- Search and filter for recipes
- BMI history chart
- Safety validation dialog

---

## Phase 1 – Foundation (Already done, verify completeness)

**Goal**: Ensure the base infrastructure is solid before building features.

### 1.1 Project Architecture Review
- [ ] Verify `api_constants.dart` has correct base URL and timeout values
- [ ] Verify error handling in `api_exceptions.dart` covers all HTTP status codes (400, 401, 403, 404, 500, timeout)
- [ ] Ensure Dio interceptor handles 401 by clearing token and routing to login
- [ ] Confirm SharedPreferences keys match: `token`, `user`, `userHealthProfile`

### 1.2 Design System Audit
- [ ] Verify `AppColors` covers all color tokens used in the app
- [ ] Verify `AppTextStyles` covers heading, body, caption, label sizes
- [ ] Confirm `AppTheme.lightTheme` applies colors and fonts globally
- [ ] Add `AppSpacing` constants for consistent padding/margin values (if missing)

### 1.3 Routing
- [ ] Add named routes for: `/health-survey`, `/meal-plan`, `/subscription`, `/profile-edit`
- [ ] Add route guard: if no health profile exists after login, redirect to `/health-survey`

---

## Phase 2 – Authentication UI

**Goal**: Fully functioning login, register, OTP, and Google Sign-In screens.

### 2.1 Login Screen (`screens/auth/login_screen.dart`)
- [ ] Email/username + password form with validation
- [ ] "Login" button with loading state
- [ ] Navigate to OTP screen if `requiresOtp == true`
- [ ] Google Sign-In button
- [ ] Error display (wrong credentials, account disabled)
- [ ] Link to Register screen

### 2.2 Register Screen (`screens/auth/register_screen.dart`)
- [ ] Username, name, email, password, confirm password fields
- [ ] Client-side validation (email format, password length, match)
- [ ] "Register" button with loading state
- [ ] Navigate to OTP screen if `requiresOtp == true`
- [ ] Link to Login screen

### 2.3 OTP Screen (new screen)
- [ ] 6-digit OTP input (or text field)
- [ ] Submit button with loading state
- [ ] Resend OTP option (if backend supports it)
- [ ] Handle both login OTP (`/auth/verify-otp`) and register OTP (`/auth/verify-register-otp`)
- [ ] Error display (wrong code, expired)

### 2.4 Google Sign-In
- [ ] Configure `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
- [ ] Verify `google_sign_in` package is correctly initialized
- [ ] Handle cancellation gracefully

---

## Phase 3 – Onboarding / Health Survey

**Goal**: Replicate the 5-step health survey with BMI calculation and safety validation.

**Dependency**: Must be completed before Meal Plan and full Dashboard work correctly.

### 3.1 Survey Flow Controller
- [ ] Multi-step state management (5 steps, forward/back navigation)
- [ ] Progress bar at top showing current step
- [ ] Validate each step before allowing next

### 3.2 Step 1 – Body Metrics
- [ ] Height (cm) slider or number field
- [ ] Weight (kg) slider or number field
- [ ] Age number field
- [ ] Gender selector (Nam / Nu / Khac)
- [ ] Real-time BMI calculation and display

### 3.3 Step 2 – Goal
- [ ] Goal selector: lose / maintain / gain (with icons)
- [ ] Target weight field (conditional, shown if goal is lose or gain)
- [ ] BMI summary card
- [ ] Safety validation: warn if losing weight while underweight, gaining while obese

### 3.4 Step 3 – Activity Level
- [ ] 5-option activity level selector with descriptions
- [ ] Estimated daily calorie display based on BMR + activity

### 3.5 Step 4 – Lifestyle
- [ ] Cooking time selector (15/30/45/60+ minutes)
- [ ] Meals per day selector (1–5)
- [ ] Diet type selector (normal/vegetarian/vegan/keto/low-carb)

### 3.6 Step 5 – Medical Conditions & Allergies
- [ ] Multi-select grid for conditions: diabetes, hypertension, cholesterol, heartDisease, gerd, gout
- [ ] Text input or tag search for allergies (ingredient names)
- [ ] Submit button with loading state

### 3.7 Safety Validation Dialog
- [ ] Dialog warning when survey data is unsafe
- [ ] "Proceed anyway" and "Go back" buttons

### 3.8 Survey Submission
- [ ] Call `POST /api/health-survey`
- [ ] Store returned profile in SharedPreferences (`userHealthProfile`)
- [ ] On success, navigate to main shell

---

## Phase 4 – Dashboard / Home Screen

**Goal**: Fully functioning home screen with daily summary and recommendations.

**Dependencies**: Auth (Phase 2), Health profile must exist.

### 4.1 Daily Calorie Ring
- [ ] Circular progress indicator showing consumed / target calories
- [ ] Macro breakdown (carbs, protein, fat) below the ring
- [ ] Fetch `GET /api/nutrition-diary?date=today` on screen load
- [ ] Fetch `GET /api/NutritionGoal?accountId=` on screen load

### 4.2 Today's Meal List
- [ ] Group diary entries by meal type (breakfast/lunch/dinner/snack)
- [ ] Show recipe name, calories, and meal time per entry
- [ ] Tap to see full diary entry detail
- [ ] Empty state: "Chua co bua an nao hom nay"

### 4.3 Recommended Recipes Section
- [ ] Horizontal scroll list of recipe cards
- [ ] Fetch `GET /api/Recipe/recommended-for-me`
- [ ] Tap card to navigate to recipe detail
- [ ] Shimmer loading skeleton while fetching

### 4.4 Quick Add Meal Button
- [ ] Floating action button or inline button
- [ ] Opens bottom sheet / modal to select recipe and meal type
- [ ] Calls `POST /api/nutrition-diary`
- [ ] Refreshes daily totals on success

### 4.5 Health Profile Summary Card
- [ ] Shows BMI, goal, and active diet plan name
- [ ] Tap to navigate to profile screen

---

## Phase 5 – Recipe Discovery

**Goal**: Full recipe browsing and search with detail view.

### 5.1 Recipe List Screen (`screens/meal_suggestions/`)
- [ ] Full list of recipes from `GET /api/Recipe`
- [ ] Search bar (client-side text filter on name)
- [ ] Filter chips by label/tag (client-side)
- [ ] RecipeCard widget with image, name, calories, cooking time
- [ ] Pull-to-refresh
- [ ] Shimmer loading skeleton
- [ ] Empty state

### 5.2 Recipe Detail Screen (`screens/meal_detail/`)
- [ ] Hero image at top
- [ ] Recipe name, description, calories, macros
- [ ] Ingredients list with quantities
- [ ] Instructions / steps
- [ ] Favorite toggle button (calls `POST /api/SavedRecipe/toggle`)
- [ ] "Log to Diary" button: opens bottom sheet with servings + meal type selector
- [ ] Shimmer loading state

### 5.3 Ingredient-Based Search (Optional, after MVP)
- [ ] Multi-select ingredient picker
- [ ] Calls `GET /api/Recipe/ingredients?ingredientIds=`

---

## Phase 6 – Favorites

**Goal**: Display and manage saved recipes.

**Dependencies**: Auth, Collection ID must be fetched first.

### 6.1 Favorites Screen (`screens/favorites/`)
- [ ] On load: fetch `GET /api/Collection/account/{accountId}/default` to get collectionId
- [ ] Then fetch `GET /api/SavedRecipe/collection/{collectionId}`
- [ ] Display recipe cards in grid or list
- [ ] Tap card to navigate to recipe detail
- [ ] Swipe-to-remove or remove button on each card
- [ ] Pull-to-refresh
- [ ] Empty state: "Chua co mon an yeu thich nao"

### 6.2 Favorite Toggle (from RecipeDetail)
- [ ] Show filled/outline heart icon based on current favorite status
- [ ] Call `POST /api/SavedRecipe/toggle`
- [ ] Update icon immediately (optimistic update)

---

## Phase 7 – Meal Plan

**Goal**: AI-generated meal planning with calendar view and plan management.

**Dependencies**: Auth, Health profile must exist (otherwise generation fails).

### 7.1 Meal Plan Screen (`screens/meal_plan/`)
- [ ] Check for active plan via `GET /api/MealPlan/active`
- [ ] If no active plan: show "Generate Plan" CTA
- [ ] If active plan exists: show weekly calendar view

### 7.2 Generate Plan Flow
- [ ] "Generate 7-day plan" button
- [ ] Call `POST /api/MealPlan/generate?days=7`
- [ ] Show preview with all 7 days + meals
- [ ] Allow swapping individual recipes before confirming
- [ ] "Confirm Plan" button calls `POST /api/MealPlan/{id}/confirm`

### 7.3 Weekly Calendar View
- [ ] 7-day horizontal scroll or tab bar
- [ ] Each day shows meal entries grouped by meal type
- [ ] Tap entry to see recipe detail
- [ ] Swap button per entry: calls `PUT /api/MealPlan/{id}/swap`
- [ ] Remove button per entry: calls `DELETE /api/MealPlan/{id}/entry/{entryId}`

### 7.4 Suggest for Date
- [ ] Date picker to select a day
- [ ] Meal type multi-select (breakfast, lunch, dinner, snack)
- [ ] Calls `POST /api/MealPlan/suggest-for-date?date=&meals=`

### 7.5 Suggest Next Day
- [ ] Button to auto-fill the next empty day
- [ ] Calls `POST /api/MealPlan/suggest-next`

### 7.6 Plan History
- [ ] List of past plans from `GET /api/MealPlan/all`
- [ ] Show plan date range and status

---

## Phase 8 – Nutrition Diary & Statistics

**Goal**: Full diary UI with charts and goal tracking.

**Dependencies**: Auth, NutritionGoal must exist (created by health survey).

### 8.1 Diary Day View (`screens/nutrition/`)
- [ ] Date picker (defaults to today)
- [ ] Entries grouped by meal type
- [ ] Add entry button per meal type
- [ ] Swipe-to-delete or delete button
- [ ] Daily totals footer (calories, protein, carbs, fat)
- [ ] Pull-to-refresh

### 8.2 Add Diary Entry Form
- [ ] Recipe search or manual input
- [ ] Servings input (number)
- [ ] Meal type selector
- [ ] Auto-fill nutrition values from recipe if selected
- [ ] Manual override for nutrition values
- [ ] Submit calls `POST /api/nutrition-diary`

### 8.3 Calorie Progress Card
- [ ] Shows consumed vs. target calories
- [ ] Progress bar per macro (protein, carbs, fat)
- [ ] Fiber, sugar, salt bars (if available in goal)

### 8.4 Weekly Summary Chart
- [ ] Bar chart of daily calories for the last 7 days
- [ ] Uses `GET /api/nutrition-diary/summary?start=&end=`
- [ ] fl_chart BarChart widget

### 8.5 Macro Breakdown Chart
- [ ] Pie chart of protein / carbs / fat distribution for selected day
- [ ] fl_chart PieChart widget

### 8.6 BMI History Chart
- [ ] Line chart of BMI over time
- [ ] Uses `GET /api/health-survey/bmi-history`
- [ ] fl_chart LineChart widget

---

## Phase 9 – Profile

**Goal**: Full profile viewing and editing.

### 9.1 Profile View Screen (`screens/profile/`)
- [ ] User avatar (with upload tap)
- [ ] Name, email display
- [ ] Health summary: height, weight, BMI, goal
- [ ] Daily targets summary
- [ ] Active conditions and allergies list
- [ ] Subscription status badge (Free / Premium)
- [ ] "Edit Profile" button
- [ ] "Manage Subscription" button
- [ ] "Logout" button

### 9.2 Avatar Upload
- [ ] Tap avatar to trigger image picker
- [ ] Call `PUT /api/auth/avatar` with multipart FormData
- [ ] Update displayed avatar on success

### 9.3 Health Profile Editor
- [ ] Same fields as the health survey
- [ ] Pre-populated with current values
- [ ] "Save" calls `PUT /api/health-survey/profile`
- [ ] Nutrition goals are automatically recalculated server-side

---

## Phase 10 – Subscription & Payment

**Goal**: Allow users to view and purchase subscription plans.

**Dependencies**: Auth.

### 10.1 Subscription Plans Screen (`screens/subscription/`)
- [ ] Fetch plan list from `GET /api/Plan`
- [ ] Display plan cards (name, price, duration, features)
- [ ] Highlight recommended plan
- [ ] Current subscription status at top
- [ ] "Subscribe" button per plan

### 10.2 Payment Flow
- [ ] "Subscribe" calls `POST /api/Payment/create` with planId
- [ ] Receive `checkoutUrl` and `orderCode`
- [ ] Open `checkoutUrl` using `url_launcher`
- [ ] Show "Waiting for payment confirmation" screen
- [ ] Poll `GET /api/Payment/check-status/{orderCode}` every 3 seconds
- [ ] On `isPaid == true`: refresh premium status, show success screen
- [ ] Provide "Cancel payment" option calling `POST /api/Payment/cancel/{orderCode}`

### 10.3 Payment Success / Cancel Screens
- [ ] Success: show confetti, navigate back to profile or dashboard
- [ ] Cancel: show message, navigate back to subscription screen

---

## Phase 11 – Testing

**Goal**: Ensure quality and correctness.

### 11.1 Unit Tests (`test/`)
- [ ] Auth provider: login, OTP, register, logout, Google login
- [ ] Nutrition provider: add entry, delete, summary
- [ ] Health profile provider: fetch, submit survey
- [ ] Favorite provider: toggle, load favorites

### 11.2 Widget Tests
- [ ] Login screen form validation
- [ ] Survey step navigation
- [ ] Recipe card rendering
- [ ] Nutrition progress bar accuracy

### 11.3 Integration Tests
- [ ] Full login flow (email OTP)
- [ ] Full survey submission
- [ ] Add diary entry and see it on dashboard

---

## Phase 12 – Feature Parity Verification

**Goal**: Compare mobile app against web app feature by feature.

- [ ] Review `FEATURE_PARITY.md` and confirm all rows are "Implemented"
- [ ] Test all API endpoints used on mobile against `API_REFERENCE.md`
- [ ] Verify all business rules from `FEATURE_PARITY.md` are correctly implemented
- [ ] Test premium gate: verify premium-only features are blocked for free users
- [ ] Test error states: network offline, server errors, invalid token
- [ ] Test empty states: no diary entries, no favorites, no meal plan

---

## Dependency Graph (Simplified)

```
Phase 1: Foundation
    |
Phase 2: Authentication
    |
    +-- Phase 3: Health Survey (Onboarding) ----+
    |                                            |
    +-- Phase 4: Dashboard <--------------------+
    |
    +-- Phase 5: Recipe Discovery
    |       |
    |       +-- Phase 6: Favorites
    |       |
    |       +-- Phase 7: Meal Plan
    |
    +-- Phase 8: Nutrition Diary & Statistics
    |
    +-- Phase 9: Profile
    |
    +-- Phase 10: Subscription & Payment
    |
Phase 11: Testing
    |
Phase 12: Feature Parity Verification
```

---

## Recommended Priority Order for MVP

1. Phase 1 – Foundation (verify and fix existing skeleton)
2. Phase 2 – Auth UI (login, register, OTP screens)
3. Phase 3 – Health Survey (critical for personalization)
4. Phase 4 – Dashboard (main landing screen)
5. Phase 5 – Recipe Discovery (core content)
6. Phase 8 – Nutrition Diary (core diary feature)
7. Phase 6 – Favorites
8. Phase 9 – Profile
9. Phase 7 – Meal Plan (complex feature)
10. Phase 10 – Subscription
11. Phase 11 – Testing
12. Phase 12 – Parity Verification

---

## Known Risks and Blockers

| Risk | Description | Mitigation |
|---|---|---|
| PayOS redirect | Backend redirects to the web app URL after payment. Mobile cannot receive this redirect natively. | Use `url_launcher` + polling `check-status/{orderCode}`. |
| No token refresh | The backend does not implement JWT refresh tokens. Expired tokens require re-login. | Set a long expiry on the backend, or prompt re-login gracefully. |
| Recipe filter endpoint | There is no server-side search/filter for recipes. All filtering is client-side on the full list. | Acceptable for current scale; add pagination/search server-side if recipe count grows. |
| Date timezone | Backend requires UTC ISO 8601. Mobile must explicitly send UTC dates. | Use `DateTime.now().toUtc().toIso8601String()` everywhere. |
| Health survey required | Many features break if no health profile exists. The app must force survey completion after login. | Implement a route guard that redirects to survey if `GET /api/health-survey/profile` returns 404. |
| Google Sign-In config | Requires platform-specific setup (google-services.json, GoogleService-Info.plist, SHA keys). | Must be configured per environment (dev/prod). |
| Concurrency on plan generation | `POST /api/MealPlan/suggest-for-date` can throw concurrency exceptions. | Show retry button on failure. |
| No dedicated user profile endpoint | User data comes from the health survey response and the auth login response, not a dedicated `/api/user/me`. | Combine data from `GET /api/health-survey/profile` + data stored in SharedPreferences after login. |
