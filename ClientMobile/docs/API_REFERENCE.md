# SmartMeal – API Reference (Mobile)

> **Source of truth**: `Server/PresentationLayer/Controllers/`
> **Base URL**: Configured in `ClientMobile/lib/core/constants/api_constants.dart`
> **Auth**: Bearer JWT token in `Authorization` header (stored in SharedPreferences key `token`)
> **Response envelope**: Most endpoints return `{ success: bool, data: ... }` or `{ success: bool, message: string }`

---

## Authentication

### POST /api/auth/login
Login with email/username and password. Always triggers OTP.

- **Auth required**: No
- **Request body**:
  ```json
  {
    "emailOrUsername": "string",
    "password": "string"
  }
  ```
- **Response (OTP required)**:
  ```json
  {
    "requiresOtp": true,
    "email": "string",
    "message": "OTP sent"
  }
  ```
- **Response (direct login – if OTP already verified)**:
  ```json
  {
    "token": "jwt_string",
    "accountId": "guid",
    "username": "string",
    "name": "string",
    "email": "string",
    "role": "User|Admin",
    "avatarUrl": "string|null"
  }
  ```
- **Errors**: 401 Unauthorized (wrong credentials), 500 Internal server error

---

### POST /api/auth/verify-otp
Verify login OTP. Returns JWT on success.

- **Auth required**: No
- **Request body**:
  ```json
  {
    "email": "string",
    "otpCode": "string"
  }
  ```
- **Response**: Same as login success response (includes JWT token)
- **Errors**: 401 Unauthorized (wrong/expired OTP), 500

---

### POST /api/auth/register
Register a new account. Triggers registration OTP.

- **Auth required**: No
- **Request body**:
  ```json
  {
    "username": "string",
    "name": "string",
    "email": "string",
    "password": "string",
    "phone": "string|null"
  }
  ```
- **Response**:
  ```json
  {
    "requiresOtp": true,
    "email": "string",
    "message": "Verification OTP sent"
  }
  ```
- **Errors**: 400 (email/username already exists), 500

---

### POST /api/auth/verify-register-otp
Verify registration OTP. Returns JWT on success, activating the account.

- **Auth required**: No
- **Request body**:
  ```json
  {
    "email": "string",
    "otpCode": "string"
  }
  ```
- **Response**: Full user data with JWT token
- **Errors**: 401 (wrong OTP), 400 (already verified), 500

---

### POST /api/auth/google-login
Login or register using Google ID token.

- **Auth required**: No
- **Request body**:
  ```json
  {
    "idToken": "string"
  }
  ```
- **Response**: Full user data with JWT token
- **Errors**: 401 (invalid token), 400 (account issue), 500

---

### PUT /api/auth/avatar
Update the logged-in user's avatar.

- **Auth required**: Yes
- **Content-Type**: `multipart/form-data`
- **Form fields**:
  - `AvatarFile`: Image file (binary), OR
  - `AvatarUrl`: Direct URL string
- **Response**:
  ```json
  {
    "success": true,
    "avatarUrl": "string"
  }
  ```
- **Errors**: 400 (no file provided), 404 (account not found)
- **Notes**: Mobile should use `image_picker` to select file then `dio` FormData to upload.

---

## Health Survey / Profile

### POST /api/health-survey
Submit the onboarding health survey. Creates or updates the health profile.

- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "height": 170.0,
    "weight": 65.0,
    "targetWeight": 60.0,
    "targetDays": 84,
    "age": 25,
    "gender": "Nam|Nu|Khac",
    "goal": "lose|maintain|gain",
    "activityLevel": "sedentary|lightly_active|moderately_active|very_active|extra_active",
    "cookingTimeMinutes": 30,
    "budgetLevel": "low|medium|high",
    "mealsPerDay": 3,
    "dietType": "normal|vegetarian|vegan|keto|low-carb",
    "planCycleDays": 7,
    "conditions": ["diabetes", "hypertension"],
    "allergies": ["tom", "cua"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "profile": {
      "account_id": "guid",
      "height": 170.0,
      "weight": 65.0,
      "targetWeight": 60.0,
      "targetDays": 84,
      "goal": "lose",
      "gender": "Nam",
      "dateOfBirth": "2001-01-01T00:00:00Z",
      "activityLevel": "sedentary",
      "bmiLevel": "normal",
      "conditions": ["diabetes"],
      "allergies": ["tom"],
      "cookingTimeMinutes": 30,
      "budgetLevel": "medium",
      "mealsPerDay": 3,
      "dietType": "normal",
      "planCycleDays": 7,
      "dailyTargets": {
        "calories": 1800,
        "protein": 135,
        "carbs": 225,
        "fat": 60,
        "fiber": 25,
        "sugarLimit": 50,
        "saltLimit": 5
      }
    }
  }
  ```
- **Errors**: 400 (validation failure), 401 (unauthenticated), 500
- **Notes**: This single endpoint handles conditions, allergies, BMI logging, diet plan assignment, and nutrition goal creation all in one call.

---

### GET /api/health-survey/profile
Get the logged-in user's health profile.

- **Auth required**: Yes
- **Response**: Same profile object as POST /api/health-survey response
- **Errors**: 404 (no profile yet – user must complete survey), 401, 500

---

### PUT /api/health-survey/profile
Update the logged-in user's health profile. Accepts same body as POST.

- **Auth required**: Yes
- **Request body**: Same as `POST /api/health-survey` (all fields optional; missing fields keep existing values)
- **Response**: Same profile object
- **Errors**: 404 (profile not found), 400, 401, 500
- **Notes**: Completely replaces conditions and allergies (old ones are soft-deleted first).

---

### GET /api/health-survey/bmi-history
Get BMI log history for the logged-in user.

- **Auth required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "log_id": "guid",
        "height": 170.0,
        "weight": 65.0,
        "bmi": 22.5,
        "bmiLevel": "normal",
        "recordedAt": "2026-01-01T00:00:00Z"
      }
    ]
  }
  ```
- **Errors**: 401, 500

---

## Recipes

### GET /api/Recipe
Get all recipes.

- **Auth required**: No
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "recipe_id": "guid",
        "recipe_name": "string",
        "description": "string",
        "image_url": "string|null",
        "calories": 350.0,
        "protein": 25.0,
        "carbs": 40.0,
        "fat": 12.0,
        "cookingTime": 30,
        "servings": 2,
        "recipeIngredients": [...],
        "recipeLabels": [...],
        "recipeTags": [...],
        "instructions": "string"
      }
    ]
  }
  ```
- **Errors**: 400, 500

---

### GET /api/Recipe/{id}
Get a single recipe by ID.

- **Auth required**: No
- **Path param**: `id` (GUID)
- **Response**: `{ success: true, data: RecipeObject }`
- **Errors**: 404 (not found), 400, 500

---

### GET /api/Recipe/recommended-for-me
Get recipes recommended for the logged-in user based on their active diet plans.

- **Auth required**: Yes
- **Response**:
  ```json
  {
    "success": true,
    "data": [...],
    "activeDietPlans": ["Keto", "Low Carb"]
  }
  ```
- **Errors**: 401, 400, 500
- **Notes**: Falls back to first 10 recipes if user has no diet plan.

---

### GET /api/Recipe/ingredients?ingredientIds=guid1&ingredientIds=guid2
Get recipes that contain the specified ingredients.

- **Auth required**: No
- **Query params**: `ingredientIds` (repeated GUID parameter)
- **Response**: `{ success: true, data: [...] }`
- **Errors**: 400, 500

---

### GET /api/Recipe/suggest-by-calories?targetCalories=1800&tolerancePercent=20
Get recipes within a calorie range.

- **Auth required**: Yes
- **Query params**:
  - `targetCalories` (double, required, must be > 0)
  - `tolerancePercent` (double, optional, default 20)
- **Response**: `{ success: true, data: [...], targetCalories: 1800, tolerancePercent: 20 }`
- **Errors**: 400 (targetCalories <= 0), 401, 500

---

### GET /api/Recipe/suggest/pantry/{accountId}
Get recipes based on a user's pantry items.

- **Auth required**: No (uses accountId in path)
- **Path param**: `accountId` (GUID)
- **Response**: `{ success: true, data: [...] }`
- **Errors**: 400, 500

---

## Saved Recipes (Favorites)

### GET /api/SavedRecipe
Get all saved recipes (global, admin use).

- **Auth required**: No (but intended for admin)
- **Response**: `{ success: true, data: [...] }`

---

### GET /api/SavedRecipe/collection/{collectionId}
Get saved recipes for a specific collection.

- **Auth required**: No
- **Path param**: `collectionId` (GUID)
- **Response**: `{ success: true, data: [...] }`
- **Errors**: 400, 500

---

### POST /api/SavedRecipe/toggle
Toggle a recipe as saved/unsaved in a collection.

- **Auth required**: No (collection_id links to user implicitly)
- **Request body**:
  ```json
  {
    "collection_Id": "guid",
    "recipe_Id": "guid"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "isAdded": true
  }
  ```
- **Errors**: 400, 500
- **Notes**: `isAdded: true` means the recipe was added; `false` means it was removed.

---

## Collections

### GET /api/Collection/account/{accountId}/default
Get (or auto-create) the default collection for a user.

- **Auth required**: No
- **Path param**: `accountId` (GUID)
- **Response**: `{ success: true, data: { collection_id, name, account_id, ... } }`
- **Errors**: 404 (could not create), 400, 500
- **Notes**: Always call this before trying to load or toggle favorites. The backend creates it automatically if missing.

---

## Meal Plan

> All MealPlan endpoints require authentication.

### POST /api/MealPlan/generate?days=7
Generate a new meal plan preview without confirming it.

- **Auth required**: Yes
- **Query params**: `days` (int, default 7)
- **Response**:
  ```json
  {
    "data": {
      "plan_id": "guid",
      "status": "preview",
      "entries": [
        {
          "entry_id": "guid",
          "date": "2026-01-01",
          "mealType": "breakfast",
          "recipe": { "recipe_id": "guid", "recipe_name": "string", ... }
        }
      ]
    }
  }
  ```
- **Errors**: 400, 401, 500

---

### POST /api/MealPlan/{id}/confirm
Confirm a plan preview, making it the active plan.

- **Auth required**: Yes
- **Path param**: `id` (plan GUID)
- **Response**: `{ data: PlanObject, message: "Da xac nhan thuc don." }`
- **Errors**: 400, 401, 500

---

### GET /api/MealPlan/active
Get the current active meal plan.

- **Auth required**: Yes
- **Response**: `{ data: PlanObject | null }`
- **Errors**: 400, 401, 500

---

### GET /api/MealPlan/all
Get all meal plans (history) for the logged-in user.

- **Auth required**: Yes
- **Response**: `{ data: [...] }`
- **Errors**: 400, 401, 500

---

### GET /api/MealPlan/week?date=2026-01-01
Get the meal plan entries for the week containing the given date.

- **Auth required**: Yes
- **Query params**: `date` (DateTime, optional, defaults to today UTC)
- **Response**: `{ data: { entries: [...] } }`
- **Errors**: 400, 401, 500

---

### GET /api/MealPlan/check-date?date=2026-01-01
Check what meal entries exist for a specific date.

- **Auth required**: Yes
- **Query params**: `date` (DateTime, required)
- **Response**: `{ data: { entries: [...] } }`
- **Errors**: 400, 401, 500

---

### POST /api/MealPlan/suggest-for-date?date=2026-01-01&meals=breakfast,lunch
Suggest meals for a specific date, optionally for specific meal types only.

- **Auth required**: Yes
- **Query params**:
  - `date` (DateTime, required)
  - `meals` (string, optional, comma-separated meal types)
- **Response**: `{ data: PlanDayObject }`
- **Errors**: 400 (concurrency), 401, 500

---

### POST /api/MealPlan/suggest-next
Suggest meals for the next available day.

- **Auth required**: Yes
- **Response**: `{ data: PlanDayObject }`
- **Errors**: 400, 401, 500

---

### PUT /api/MealPlan/{id}/swap
Swap a recipe in a plan entry.

- **Auth required**: Yes
- **Path param**: `id` (plan GUID)
- **Request body**:
  ```json
  {
    "entryId": "guid",
    "newRecipeId": "guid"
  }
  ```
- **Response**: `{ data: PlanObject, message: "Da doi mon thanh cong." }`
- **Errors**: 400, 401, 500

---

### DELETE /api/MealPlan/{id}/entry/{entryId}
Remove an entry from a meal plan.

- **Auth required**: Yes
- **Path params**: `id` (plan GUID), `entryId` (entry GUID)
- **Response**: `{ data: PlanObject, message: "Da huy mon thanh cong." }`
- **Errors**: 400, 401, 500

---

## Nutrition Diary

> All endpoints require authentication.

### POST /api/nutrition-diary
Add a new diary entry.

- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "recipeId": "guid|null",
    "recipeName": "string|null",
    "mealType": "breakfast|lunch|dinner|snack",
    "servings": 1.5,
    "calories": 350.0,
    "carbs": 45.0,
    "protein": 25.0,
    "fat": 12.0,
    "date": "2026-01-01T07:00:00Z",
    "note": "string|null"
  }
  ```
- **Response**: `{ success: true, entry: DiaryEntryObject }`
- **Errors**: 400, 401, 500
- **Important**: Send date as UTC ISO 8601.

---

### GET /api/nutrition-diary?date=2026-01-01T00:00:00Z
Get diary entries for a specific date.

- **Auth required**: Yes
- **Query params**: `date` (DateTime, optional, defaults to today UTC)
- **Response**:
  ```json
  {
    "success": true,
    "entries": [
      {
        "id": "guid",
        "recipeId": "guid|null",
        "recipeName": "string",
        "mealType": "breakfast",
        "servings": 1.5,
        "calories": 350.0,
        "carbs": 45.0,
        "protein": 25.0,
        "fat": 12.0,
        "date": "2026-01-01T07:00:00Z"
      }
    ],
    "totalCalories": 1500.0,
    "totalCarbs": 180.0,
    "totalProtein": 90.0,
    "totalFat": 50.0
  }
  ```
- **Errors**: 400, 401, 500

---

### DELETE /api/nutrition-diary/{id}
Delete a diary entry (soft delete).

- **Auth required**: Yes
- **Path param**: `id` (diary entry GUID)
- **Response**: `{ success: true, message: "Da xoa ban ghi" }`
- **Errors**: 400, 401, 500

---

### GET /api/nutrition-diary/summary?start=2026-01-01&end=2026-01-07
Get aggregated nutrition totals grouped by day for a date range.

- **Auth required**: Yes
- **Query params**:
  - `start` (DateTime, optional, defaults to 7 days ago UTC)
  - `end` (DateTime, optional, defaults to today UTC)
- **Response**:
  ```json
  {
    "success": true,
    "dailyTotals": [
      {
        "date": "2026-01-01",
        "calories": 1800.0,
        "carbs": 220.0,
        "protein": 120.0,
        "fat": 60.0,
        "count": 3
      }
    ],
    "totals": {
      "calories": 12600.0,
      "carbs": 1540.0,
      "protein": 840.0,
      "fat": 420.0,
      "totalDays": 7
    }
  }
  ```
- **Errors**: 400, 401, 500

---

## Nutrition Goal

### GET /api/NutritionGoal?accountId={guid}
Get nutrition goals for a user.

- **Auth required**: No (but accountId required)
- **Query params**: `accountId` (GUID, optional, returns all if omitted)
- **Response**: `{ success: true, data: [{ account_id, targetCalories, targetProtein, targetCarbs, targetFat, targetFiber, targetSugar, targetSalt }] }`
- **Errors**: 400, 500
- **Notes**: Nutrition goals are automatically created/updated when the health survey is submitted.

---

## Subscription Plans

### GET /api/Plan
Get all available subscription plans.

- **Auth required**: No
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "plan_id": "guid",
        "name": "string",
        "description": "string",
        "price": 99000,
        "durationDays": 30,
        "features": "string|json"
      }
    ]
  }
  ```
- **Errors**: 400, 500

---

### GET /api/Subscription?accountId={guid}
Get subscriptions for a specific user.

- **Auth required**: Yes (must match JWT account)
- **Query params**: `accountId` (GUID, optional)
- **Response**: `{ success: true, data: [...] }`
- **Errors**: 403 (Forbidden, if accountId doesn't match JWT), 401, 400, 500

---

### GET /api/Subscription/check-feature?featureKey=mealPlan
Check if the logged-in user has access to a premium feature.

- **Auth required**: Yes
- **Query params**: `featureKey` (string, required)
- **Response**: `{ success: true, data: true|false }`
- **Errors**: 400 (featureKey missing), 401, 500

---

## Payment (PayOS)

### POST /api/Payment/create
Create a PayOS payment link for purchasing a subscription plan.

- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "plan_id": "guid",
    "account_id": "guid"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "checkoutUrl": "https://pay.payos.vn/...",
      "orderCode": 123456789
    }
  }
  ```
- **Errors**: 400, 401, 403, 500
- **Mobile notes**: Open `checkoutUrl` using `url_launcher`. Store `orderCode` to poll payment status.

---

### GET /api/Payment/check-status/{orderCode}
Check if a payment has been completed.

- **Auth required**: No
- **Path param**: `orderCode` (long integer)
- **Response**: `{ success: true, isPaid: true|false }`
- **Errors**: 400, 500
- **Mobile notes**: Poll this endpoint after opening the payment URL until `isPaid` is true.

---

### POST /api/Payment/cancel/{orderCode}
Cancel a pending payment.

- **Auth required**: No
- **Path param**: `orderCode` (long integer)
- **Response**: `{ success: true, data: ... }`
- **Errors**: 400, 500

---

## Ingredients

### GET /api/Ingredient
Get all ingredients.

- **Auth required**: No
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "ingredient_id": "guid",
        "name": "string",
        "calories": 100.0,
        "protein": 10.0,
        "carbs": 15.0,
        "fat": 3.0,
        "unit": "g",
        "image_url": "string|null"
      }
    ]
  }
  ```
- **Errors**: 400, 500

---

### GET /api/Ingredient/{id}
Get a single ingredient by ID.

- **Auth required**: No
- **Path param**: `id` (GUID)
- **Response**: `{ success: true, data: IngredientObject }`
- **Errors**: 404 (not found), 400, 500

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

HTTP status codes used:
- `400 Bad Request` – Validation error or business logic failure
- `401 Unauthorized` – Missing or invalid JWT
- `403 Forbidden` – Insufficient permissions
- `404 Not Found` – Resource does not exist
- `500 Internal Server Error` – Unexpected server error
- `408 Request Timeout` – Client timeout (handled by Dio interceptor)

---

## Important Notes for Mobile Implementation

1. **Date handling**: Always send dates as UTC ISO 8601 strings. The backend normalizes all date kinds to UTC.
2. **GUID format**: All IDs are UUID v4 format (e.g., `"3fa85f64-5717-4562-b3fc-2c963f66afa6"`).
3. **OTP flow**: Login and Register are always two-step. Store the email after the first call, then use it for the OTP verification call.
4. **Survey before features**: If `GET /api/health-survey/profile` returns 404, the user has not completed onboarding. Redirect to the survey.
5. **Favorites flow**: Always call `GET /api/Collection/account/{accountId}/default` first to get the collection ID, then use it for all SavedRecipe calls.
6. **PayOS payment**: The backend redirect URL is hardcoded to the web app. Mobile must open the checkout URL via `url_launcher` and poll `check-status/{orderCode}` to detect payment completion.
7. **Token refresh**: The backend does not implement token refresh. If the token expires, the user must log in again.
8. **Soft deletes**: Most DELETE operations are soft deletes (set `IsDeleted = true`). Deleted records do not appear in GET responses.
