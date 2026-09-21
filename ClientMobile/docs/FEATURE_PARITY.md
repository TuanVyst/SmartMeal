# SmartMeal – Feature Parity Document

> **Source of truth**: `Client/` web application and `Server/` backend.
> **Purpose**: Track every feature that must be replicated on the Flutter mobile application.

---

## 1. Authentication

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| Login (email/password) | `pages/auth/Login.jsx` | `POST /api/auth/login` | Provider + Service done | OTP step required |
| OTP Verification (login) | `context/AuthContext.jsx` | `POST /api/auth/verify-otp` | Provider done | Returns JWT on success |
| Register | `pages/auth/Register.jsx` | `POST /api/auth/register` | Provider + Service done | OTP required after |
| OTP Verification (register) | `context/AuthContext.jsx` | `POST /api/auth/verify-register-otp` | Provider done | Returns JWT on success |
| Google Sign-In | `context/AuthContext.jsx` | `POST /api/auth/google-login` | Provider done (google_sign_in) | Sends idToken to backend |
| Avatar Update | `pages/profile/Profile.jsx` | `PUT /api/auth/avatar` | Pending UI | Multipart form-data upload |
| Logout | `context/AuthContext.jsx` | local – clear token | Provider done | Clears SharedPreferences |
| Persist Auth State | localStorage | none | SharedPreferences done | Token + user JSON persisted |

### Business Rules – Authentication
- Login **always** triggers an OTP email before issuing a JWT. The web checks `data.requiresOtp === true`.
- Google Login receives an `idToken` (Google ID token); the backend verifies it server-side.
- JWT is stored in the `token` key and sent as `Authorization: Bearer <token>`.
- Role system: `Admin` / `User`. Admin routes require `Roles = "Admin"` on the backend.
- `isActive` flag on the account must be `true` to allow login.

---

## 2. Onboarding / Health Survey

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| Multi-step survey form (5 steps) | `components/forms/OnboardingSurvey.jsx` | `POST /api/health-survey` | Screen exists (survey/), logic pending | Step logic needs porting |
| Submit survey | `services/healthSurveyService.js` | `POST /api/health-survey` | Pending | Creates or updates profile |
| Get existing health profile | `services/healthSurveyService.js` | `GET /api/health-survey/profile` | Service done | Checks if survey done |
| Update health profile | `components/HealthProfileEditor.jsx` | `PUT /api/health-survey/profile` | Pending | Full re-submission |
| BMI history | `pages/profile/Profile.jsx` | `GET /api/health-survey/bmi-history` | Pending | Chart of BMI over time |
| Safety validation popup | `components/forms/SafetyValidation.jsx` | none (client-side) | Pending | Warning dialog before submit |

### Survey Steps (Web)

| Step | Fields |
|---|---|
| 1 Body Metrics | height (cm), weight (kg), age, gender |
| 2 Goal | goal (lose/maintain/gain), targetWeight, BMI display |
| 3 Activity | activityLevel (sedentary/lightly_active/moderately_active/very_active/extra_active) |
| 4 Lifestyle | cookingTimeMinutes, mealsPerDay, dietType (normal/vegetarian/vegan/keto/low-carb) |
| 5 Medical | conditions (multi-select), allergies (multi-select) |

### Business Rules – Health Survey
- BMI is calculated client-side: weight / (height/100)^2.
- BMI < 18.5 = underweight; < 25 = normal; < 30 = overweight; >= 30 = obese.
- Safety validation dialog shown when goal + BMI combination is dangerous.
- Submitting the survey automatically:
  1. Creates/updates HealthProfile.
  2. Creates/updates NutritionGoal (calculated server-side via HealthRulesHelper).
  3. Assigns UserDietPlan records based on medical conditions.
  4. Logs a BmiLog entry.
- Condition keys sent from frontend: `diabetes`, `hypertension`, `cholesterol`, `heartDisease`, `gerd`, `gout`.
- Backend maps these keys to Vietnamese DB names.

---

## 3. Dashboard / Home

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| Daily calorie progress ring | `pages/dashboard/Dashboard.jsx` | `GET /api/nutrition-diary?date=` plus `GET /api/NutritionGoal` | Screen exists, NutritionProvider done | |
| Today's meal list from diary | `pages/dashboard/Dashboard.jsx` | `GET /api/nutrition-diary?date=` | NutritionProvider done | Grouped by meal type |
| Recommended recipes | `pages/dashboard/Dashboard.jsx` | `GET /api/Recipe/recommended-for-me` | RecipeProvider done | Based on active diet plans |
| Quick add meal button | `pages/dashboard/Dashboard.jsx` | `POST /api/nutrition-diary` | Pending | Opens diary entry form |
| Health profile summary | `pages/dashboard/Dashboard.jsx` | `GET /api/health-survey/profile` | HealthProfileProvider done | Shows BMI, goal, daily targets |

---

## 4. Recipe / Meal Discovery

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| Browse all recipes | `pages/MealSuggestion/MealSuggestion.jsx` | `GET /api/Recipe` | Screen + Provider done | Full list |
| Recipe detail page | `pages/MealDetail/MealDetail.jsx` | `GET /api/Recipe/{id}` | Screen done | Ingredients, nutrition, instructions |
| Search by ingredients | `components/IngredientSidebar/` | `GET /api/Recipe/ingredients?ingredientIds=` | Pending | Multi-ingredient filter |
| Calorie-based suggestions | `pages/meal-plan/MealPlanSuggestion.jsx` | `GET /api/Recipe/suggest-by-calories?targetCalories=` | Pending | Auth required, tolerancePercent defaults 20% |
| Recipes by pantry | none on web | `GET /api/Recipe/suggest/pantry/{accountId}` | Pending | Based on pantry items |
| Recommended for me | `pages/dashboard/Dashboard.jsx` | `GET /api/Recipe/recommended-for-me` | RecipeProvider done | Auth required |
| Filter by tag/label | `components/RecipeFilter/` | client-side filter on full list | Pending | No server-side filter endpoint |
| Add/log recipe to diary | `pages/MealDetail/MealDetail.jsx` | `POST /api/nutrition-diary` | Pending | Includes servings, meal type |

### Business Rules – Recipes
- `GET /api/Recipe` returns all recipes (no auth required).
- `recommended-for-me` requires auth; falls back to first 10 recipes if no diet plan assigned.
- `suggest-by-calories` tolerance defaults to 20%.
- Recipes include: name, description, image URL, calories, protein, carbs, fat, ingredients list, labels/tags, instructions.

---

## 5. Favorites (Saved Recipes)

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| View saved recipes | `pages/food/Favorites.jsx` | `GET /api/SavedRecipe/collection/{collectionId}` | Screen + Service done | Needs collection ID first |
| Toggle save/unsave recipe | `pages/MealDetail/MealDetail.jsx` | `POST /api/SavedRecipe/toggle` | FavoriteProvider done | Returns isAdded boolean |
| Get default collection | `services/savedRecipeService.js` | `GET /api/Collection/account/{accountId}/default` | Pending | Auto-created if missing |
| Create custom collection | not exposed on web | `POST /api/Collection` | Out of scope | Backend supports it |

### Business Rules – Favorites
- Each user has a **default Collection** auto-created by the backend if none exists.
- Toggle endpoint `POST /api/SavedRecipe/toggle` takes `{ Collection_Id, Recipe_Id }` and returns `{ isAdded: bool }`.
- The mobile should fetch the default collection ID first, then load recipes by collection.

---

## 6. Meal Plan

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| Generate 7-day plan preview | `pages/meal-plan/MealPlanPreview.jsx` | `POST /api/MealPlan/generate?days=7` | Screen exists (meal_plan/), pending | Auth required |
| Confirm plan | `pages/meal-plan/MealPlanPreview.jsx` | `POST /api/MealPlan/{id}/confirm` | Pending | Saves plan as active |
| View active plan | `pages/meal-plan/MealPlanPage.jsx` | `GET /api/MealPlan/active` | Pending | Shows current active plan |
| View all plans (history) | `pages/meal-plan/MealPlanPage.jsx` | `GET /api/MealPlan/all` | Pending | Plan history |
| Weekly calendar view | `pages/meal-plan/MealPlanPage.jsx` | `GET /api/MealPlan/week?date=` | Pending | Shows 7-day grid |
| Check meals for a date | `pages/meal-plan/MealPlanPage.jsx` | `GET /api/MealPlan/check-date?date=` | Pending | Used before suggesting |
| Suggest for specific date | `components/forms/SuggestNextPlanPopup.jsx` | `POST /api/MealPlan/suggest-for-date?date=&meals=` | Pending | meals is comma-separated list |
| Suggest next day | `components/forms/SuggestNextPlanPopup.jsx` | `POST /api/MealPlan/suggest-next` | Pending | Auto-fill next calendar day |
| Swap a recipe in plan | `pages/meal-plan/MealPlanPage.jsx` | `PUT /api/MealPlan/{id}/swap` | Pending | Body: EntryId + NewRecipeId |
| Remove entry from plan | `pages/meal-plan/MealPlanPage.jsx` | `DELETE /api/MealPlan/{id}/entry/{entryId}` | Pending | Soft delete entry |
| Health report | `pages/meal-plan/HealthReport.jsx` | `GET /api/health-survey/profile` + bmi-history | Pending | Summary page |

### Business Rules – Meal Plan
- All MealPlan endpoints require authentication.
- Plan generation uses the user's HealthProfile (calories, meals/day, diet type, cooking time, conditions).
- `suggest-for-date` accepts optional `meals` query param (comma-separated meal types to fill).
- Concurrency exceptions on plan generation are handled explicitly; the mobile should retry on conflict.
- A plan must be **confirmed** before it becomes active.

---

## 7. Nutrition Diary

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| Add diary entry | `pages/nutrition/Nutrition.jsx` | `POST /api/nutrition-diary` | NutritionProvider done | recipeId, mealType, servings, calories, carbs, protein, fat, date |
| Get diary by date | `pages/nutrition/Nutrition.jsx` | `GET /api/nutrition-diary?date=` | NutritionProvider done | Returns entries + daily totals |
| Delete diary entry | `pages/nutrition/Nutrition.jsx` | `DELETE /api/nutrition-diary/{id}` | NutritionProvider done | Soft delete |
| Weekly/range summary | `pages/nutrition/Nutrition.jsx` | `GET /api/nutrition-diary/summary?start=&end=` | NutritionProvider done | Returns daily totals array |
| Calorie progress vs goal | `pages/nutrition/Nutrition.jsx` | Combine diary totals + NutritionGoal | NutritionProvider done | Progress bar / chart |

### Business Rules – Nutrition Diary
- Dates must be sent as UTC ISO 8601. The backend normalizes unknown DateTimeKind to UTC.
- MealType is a free string (breakfast, lunch, dinner, snack are typical values).
- Quantity = number of servings; calorie/macro values are pre-calculated client-side before sending.
- The GET response includes individual entries[] and aggregated totalCalories, totalCarbs, totalProtein, totalFat.
- Diary entries can link to a Recipe (via Recipe_id) or be standalone (null recipeId).

---

## 8. Nutrition Statistics

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| Daily macro breakdown chart | `pages/nutrition/Nutrition.jsx` | `GET /api/nutrition-diary/summary` | fl_chart available | Pie or bar chart |
| Weekly calorie trend chart | `pages/nutrition/Nutrition.jsx` | `GET /api/nutrition-diary/summary` | fl_chart available | Line chart over days |
| Nutrition goal targets | `pages/nutrition/Nutrition.jsx` | `GET /api/NutritionGoal?accountId=` | NutritionProvider done | Calories, protein, carbs, fat, fiber, sugar, salt |
| BMI history chart | `pages/profile/Profile.jsx` | `GET /api/health-survey/bmi-history` | Pending | HealthProfileProvider |

---

## 9. Profile

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| View profile info | `pages/profile/Profile.jsx` | `GET /api/health-survey/profile` | Screen exists | Name, email, avatar, health data |
| Edit health profile | `components/HealthProfileEditor.jsx` | `PUT /api/health-survey/profile` | Pending | Full health data editor |
| Update avatar | `pages/profile/Profile.jsx` | `PUT /api/auth/avatar` (multipart) | Pending | image_picker available |
| View subscription status | `pages/profile/Profile.jsx` | `GET /api/Subscription?accountId=` | AuthProvider done | isPremium flag |
| Navigate to subscription | `pages/profile/Profile.jsx` | none | Pending | Go to subscription screen |
| Logout | `pages/profile/Profile.jsx` | local | AuthProvider done | Clears state + storage |
| BMI display | `pages/profile/Profile.jsx` | calculated from health profile | Pending | Show BMI value + category |

---

## 10. Subscription / Premium

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| View available plans | `pages/subscription/SubscriptionPlans.jsx` | `GET /api/Plan` | SubscriptionService done | No auth required |
| View user subscriptions | `pages/subscription/SubscriptionPlans.jsx` | `GET /api/Subscription?accountId=` | AuthProvider done | Auth required |
| Create payment link (PayOS) | `pages/subscription/Payment.jsx` | `POST /api/Payment/create` | Pending | Returns PayOS checkout URL |
| Check payment status | `pages/subscription/PaymentSuccess.jsx` | `GET /api/Payment/check-status/{orderCode}` | Pending | Poll until paid |
| Cancel payment | `pages/subscription/PaymentCancel.jsx` | `POST /api/Payment/cancel/{orderCode}` | Pending | |
| Check premium feature access | `context/AuthContext.jsx` | `GET /api/Subscription/check-feature?featureKey=` | Pending | Gate premium features |

### Business Rules – Subscription
- Plans are public (no auth); subscriptions require auth.
- Payment is handled through PayOS. The backend creates a payment link and returns a checkout URL.
- The PayOS redirect URL is hardcoded to the web URL. Mobile must use url_launcher to open the PayOS URL in a browser, then poll check-status/{orderCode} to confirm payment.
- Subscription status values: pending, active, cancelled, expired.
- Premium check uses isActive status on the subscription (computed from status + endDate on the client).

---

## 11. Ingredients

| Feature | Web Implementation | Backend API | Mobile Status | Notes |
|---|---|---|---|---|
| Browse ingredients | `pages/food/IngredientList.jsx` | `GET /api/Ingredient` | IngredientService done | Used in recipe search sidebar |
| Ingredient detail | `pages/food/IngredientDetail.jsx` | `GET /api/Ingredient/{id}` | Pending | Nutrition per 100g |
| Create ingredient (admin/user) | `pages/food/IngredientForm.jsx` | `POST /api/Ingredient` | Out of scope for mobile | Admin/power user feature |

---

## 12. Admin Panel

**Scope**: Out of scope for the mobile application. Admin functions require the `Admin` role.

| Feature | Web | Backend | Mobile |
|---|---|---|---|
| Admin dashboard | `pages/admin/AdminDashboard.jsx` | `GET /api/Statistic/subscriptions` | Out of scope |
| User management | `pages/admin/AdminUsers.jsx` | `GET /api/auth/accounts` | Out of scope |
| Recipe management | `pages/admin/AdminRecipes.jsx` | Full Recipe CRUD | Out of scope |
| Ingredient management | `pages/admin/AdminIngredients.jsx` | Full Ingredient CRUD | Out of scope |
| Tag management | `pages/admin/AdminIngredientTags.jsx` | Full Tag CRUD | Out of scope |
| Plan management | `pages/admin/AdminPlans.jsx` | Plan CRUD (Admin only) | Out of scope |

---

## 13. Landing Page

**Scope**: Web-only feature. Mobile opens directly at Login/Splash.

---

## Summary Table

| # | Feature Area | Web Status | Mobile Status |
|---|---|---|---|
| 1 | Authentication | Complete | Core done, UI polish needed |
| 2 | Health Survey / Onboarding | Complete | Pending |
| 3 | Dashboard / Home | Complete | In progress |
| 4 | Recipe Discovery | Complete | In progress |
| 5 | Favorites | Complete | Core done, collection flow pending |
| 6 | Meal Plan | Complete | Pending |
| 7 | Nutrition Diary | Complete | Provider done, UI pending |
| 8 | Nutrition Statistics | Complete | Pending |
| 9 | Profile | Complete | Pending |
| 10 | Subscription / Payment | Complete | Pending |
| 11 | Ingredients | Partial | Pending |
| 12 | Admin Panel | Complete | Out of scope |
| 13 | Landing Page | Complete | Out of scope |
