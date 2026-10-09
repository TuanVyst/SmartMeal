# SmartMeal API Reference & Service Contracts

This document provides a comprehensive technical reference for all API endpoints exposed by the SmartMeal backend (`Server/PresentationLayer`) and the AI computer vision service (`AI/src/smartmeal_predict/app.py`).

---

## 1. Global API Standards & Conventions

### 1.1 Base URLs
- **Production API**: `https://api.ocgi.space`
- **Predict AI Service (Direct/Internal)**: `http://smartmeal-predict:8000` (or routed via `https://api.ocgi.space/predict`)
- **Local Development (.NET)**: `http://localhost:5267` or `https://localhost:7080`
- **Local Development (AI)**: `http://localhost:8000`

### 1.2 Authentication & Headers
Protected endpoints require an `Authorization` header containing an HMAC-SHA256 signed JWT:
```http
Authorization: Bearer <jwt_token>
```
Standard headers:
- `Content-Type: application/json` (or `multipart/form-data` for file uploads)
- `Accept: application/json`

### 1.3 Response Envelopes & Error Handling

Standard successful responses return serialized DTOs or collections:
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "name": "Mediterranean Salad",
  "status": "Active"
}
```

Standard error payloads adhere to ProblemDetails / ASP.NET response contracts:
```json
{
  "message": "Detailed error message or failure description",
  "status": 400,
  "errors": {
    "Field": ["Validation error message"]
  }
}
```

---

## 2. AI Inference Service Endpoints (`smartmeal-predict`)

### 2.1 Service Health Check
- **Endpoint**: `GET /health` (or `GET /predict/health` depending on route prefix)
- **Auth**: None
- **Description**: Verifies model status, runtime engine, and inference device.
- **Response `200 OK`**:
```json
{
  "status": "ok",
  "model": "/app/models/best.onnx",
  "runtime": "ONNX Runtime",
  "device": "CPU"
}
```

### 2.2 Ingredient Image Detection
- **Endpoint**: `POST /predict`
- **Auth**: None
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `image` (binary file, required): Raw JPEG, PNG, or WebP image.
- **Response `200 OK`**:
```json
{
  "success": true,
  "detections": [
    {
      "class_id": 19,
      "class_name": "Tomato",
      "confidence": 0.9412,
      "box": [124.5, 80.2, 340.1, 295.8]
    },
    {
      "class_id": 20,
      "class_name": "Onion",
      "confidence": 0.8845,
      "box": [310.0, 95.4, 450.2, 225.1]
    }
  ]
}
```
- **Response `400 Bad Request`**:
```json
{
  "success": false,
  "message": "Missing 'image' in multipart form data"
}
```

---

## 3. Backend Presentation Layer API (`smartmeal-api`)

### 3.1 Authentication & User Management (`/api/Auth`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/Auth/register` | Anonymous | Register account and trigger email OTP verification |
| `POST` | `/api/Auth/verify-register-otp` | Anonymous | Complete registration by validating OTP code |
| `POST` | `/api/Auth/login` | Anonymous | Authenticate with username and password |
| `POST` | `/api/Auth/verify-otp` | Anonymous | Verify secondary OTP login challenge |
| `POST` | `/api/Auth/google-login` | Anonymous | Authenticate or register using Google OAuth ID token |
| `PUT` | `/api/Auth/avatar` | Bearer JWT | Upload and update current user avatar image |
| `GET` | `/api/Auth/accounts` | Admin | Retrieve all registered user accounts |
| `PUT` | `/api/Auth/accounts/{id}` | Admin | Update account details and role status |

#### `POST /api/Auth/login` Request & Response
```json
// Request
{
  "username": "user@example.com",
  "password": "Password123!"
}

// Response 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "role": "User",
  "accountId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "username": "user@example.com",
  "name": "Jane Doe",
  "avatarUrl": "https://res.cloudinary.com/..."
}
```

---

### 3.2 Recipe Management (`/api/Recipe`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/Recipe` | Anonymous | Retrieve all public recipes |
| `GET` | `/api/Recipe/{id}` | Anonymous | Retrieve detailed recipe info by ID |
| `GET` | `/api/Recipe/recommended-for-me` | Bearer JWT | Personalized recipes matching user health & allergy profile |
| `GET` | `/api/Recipe/ingredients` | Anonymous | Query recipes filtered by ingredient IDs (`?ingredientIds=...`) |
| `GET` | `/api/Recipe/suggest-by-calories` | Bearer JWT | Suggestions matching caloric budget (`?targetCalories=600&tolerancePercent=20`) |
| `GET` | `/api/Recipe/suggest/pantry/{accountId}` | Anonymous | Recipes cookable from current pantry stocks |
| `POST` | `/api/Recipe` | Bearer JWT | Create new recipe |
| `PUT` | `/api/Recipe/{id}` | Bearer JWT | Update existing recipe |
| `DELETE` | `/api/Recipe/{id}` | Bearer JWT | Soft-delete recipe |

---

### 3.3 Meal Planning Engine (`/api/MealPlan`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/MealPlan/generate?days=7` | Bearer JWT | Generate preview meal plan schedule based on goals & constraints |
| `POST` | `/api/MealPlan/{id}/confirm` | Bearer JWT | Commit and activate generated draft meal plan |
| `GET` | `/api/MealPlan/active` | Bearer JWT | Fetch current active meal plan schedule |
| `GET` | `/api/MealPlan/all` | Bearer JWT | Retrieve all historical meal plans for user |
| `GET` | `/api/MealPlan/check-date?date=YYYY-MM-DD` | Bearer JWT | Verify scheduled meals for given calendar date |
| `GET` | `/api/MealPlan/week?date=YYYY-MM-DD` | Bearer JWT | Fetch full 7-day schedule slice around target date |
| `POST` | `/api/MealPlan/suggest-for-date` | Bearer JWT | Generate on-demand meal suggestions for specific date |
| `POST` | `/api/MealPlan/suggest-next` | Bearer JWT | Predict and recommend next upcoming meal |
| `PUT` | `/api/MealPlan/{id}/swap` | Bearer JWT | Swap recipe inside specific meal plan slot |
| `DELETE` | `/api/MealPlan/{id}/entry/{entryId}` | Bearer JWT | Remove single entry from daily slot |

---

### 3.4 Nutrition Diary & Goals (`/api/nutrition-diary`, `/api/NutritionGoal`, `/api/NutritionLog`)

#### Nutrition Diary (`/api/nutrition-diary`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/nutrition-diary` | Bearer JWT | Add daily consumption entry (recipe or ingredient) |
| `GET` | `/api/nutrition-diary?date=YYYY-MM-DD` | Bearer JWT | Get meal entries and daily total macros for date |
| `DELETE` | `/api/nutrition-diary/{id}` | Bearer JWT | Remove diary entry |
| `GET` | `/api/nutrition-diary/summary` | Bearer JWT | Aggregate macro report between `start` and `end` dates |

#### Nutrition Goal (`/api/NutritionGoal`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/NutritionGoal` | Bearer JWT | Get nutrition goals (`?accountId=...`) |
| `GET` | `/api/NutritionGoal/{id}` | Bearer JWT | Get goal by ID |
| `POST` | `/api/NutritionGoal` | Bearer JWT | Create daily nutritional macro thresholds |
| `PUT` | `/api/NutritionGoal/{id}` | Bearer JWT | Update nutritional targets |
| `DELETE` | `/api/NutritionGoal/{id}` | Bearer JWT | Delete nutritional goal |

---

### 3.5 Health Profile & Survey (`/api/health-survey`, `/api/HealthProfile`, `/api/HealthReport`)

#### Health Survey (`/api/health-survey`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/health-survey` | Bearer JWT | Submit comprehensive onboarding survey (biometrics + allergies) |
| `GET` | `/api/health-survey/profile` | Bearer JWT | Fetch unified health profile and dietary preferences |
| `PUT` | `/api/health-survey/profile` | Bearer JWT | Update health metrics and preferences |
| `GET` | `/api/health-survey/bmi-history` | Bearer JWT | Retrieve historical BMI trends |

#### Health Report (`/api/HealthReport`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/HealthReport` | Bearer JWT | Calculate BMR, TDEE, recommended calories, and macro balance |

---

### 3.6 Ingredients & Nutritional Values

#### Ingredients (`/api/Ingredient`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/Ingredient` | Anonymous | Get list of all recognized ingredients |
| `GET` | `/api/Ingredient/{id}` | Anonymous | Get single ingredient details |
| `POST` | `/api/Ingredient` | Admin | Create ingredient entry |
| `PUT` | `/api/Ingredient/{id}` | Admin | Update ingredient |
| `DELETE` | `/api/Ingredient/{id}` | Admin | Soft-delete ingredient |

#### Nutritional Values (`/api/NutritionalValue`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/NutritionalValue` | Anonymous | List nutritional value records |
| `GET` | `/api/NutritionalValue/{id}` | Anonymous | Get nutritional value by ID |
| `POST` | `/api/NutritionalValue` | Admin | Add nutritional breakdown per ingredient |
| `PUT` | `/api/NutritionalValue/{id}` | Admin | Update nutritional details |
| `DELETE` | `/api/NutritionalValue/{id}` | Admin | Delete nutritional record |

---

### 3.7 Pantry Inventory & Allergies

#### Pantry (`/api/Pantry`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/Pantry` | Bearer JWT | Fetch household pantry items |
| `GET` | `/api/Pantry/{id}` | Bearer JWT | Get pantry item by ID |
| `POST` | `/api/Pantry` | Bearer JWT | Add item to pantry inventory |
| `PUT` | `/api/Pantry/{id}` | Bearer JWT | Update pantry stock or expiration date |
| `DELETE` | `/api/Pantry/{id}` | Bearer JWT | Remove item from pantry |

#### Allergies (`/api/Allergy`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/Allergy` | Bearer JWT | List allergen ingredients (`?accountId=...`) |
| `POST` | `/api/Allergy` | Bearer JWT | Add ingredient allergen constraint |
| `DELETE` | `/api/Allergy/{id}` | Bearer JWT | Remove allergy restriction |

---

### 3.8 Grocery Lists & Items (`/api/GroceryList`, `/api/GroceryItem`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/GroceryList` | Bearer JWT | Fetch user shopping lists |
| `POST` | `/api/GroceryList` | Bearer JWT | Create shopping list |
| `GET` | `/api/GroceryItem` | Bearer JWT | Get items in shopping list |
| `POST` | `/api/GroceryItem` | Bearer JWT | Add item to shopping list |
| `PUT` | `/api/GroceryItem/{id}` | Bearer JWT | Toggle `IsPurchased` flag or update quantity |
| `DELETE` | `/api/GroceryItem/{id}` | Bearer JWT | Remove item |

---

### 3.9 Subscriptions & Payments (`/api/Plan`, `/api/Subscription`, `/api/Payment`)

#### Subscription Plans (`/api/Plan`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/Plan` | Anonymous | List available subscription tiers |
| `GET` | `/api/Plan/{id}` | Anonymous | Get plan details |
| `POST` | `/api/Plan` | Admin | Create subscription plan |
| `PUT` | `/api/Plan/{id}` | Admin | Update plan pricing/features |
| `DELETE` | `/api/Plan/{id}` | Admin | Soft-delete plan |

#### Subscriptions (`/api/Subscription`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/Subscription` | Bearer JWT | Retrieve active subscriptions |
| `GET` | `/api/Subscription/check-feature?featureKey=...` | Bearer JWT | Evaluate feature access flag against active subscription |
| `POST` | `/api/Subscription` | Bearer JWT | Create manual subscription |

#### Payment Integration (`/api/Payment` - PayOS Gateway)
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/Payment/create` | Bearer JWT | Generate PayOS checkout URL and order code |
| `GET` | `/api/Payment/check-status/{orderCode}` | Anonymous | Poll payment status |
| `POST` | `/api/Payment/cancel/{orderCode}` | Anonymous | Cancel pending payment checkout |
| `POST/PUT` | `/api/Payment/webhook` | Anonymous | PayOS IPN webhook handler verifying signed transaction |
| `GET` | `/api/Payment/return` | Anonymous | Return redirect URL handler after payment |

---

### 3.10 Collections & Saved Recipes (`/api/Collection`, `/api/SavedRecipe`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/Collection` | Bearer JWT | Retrieve user recipe collections |
| `POST` | `/api/Collection` | Bearer JWT | Create new recipe collection folder |
| `POST` | `/api/SavedRecipe/toggle` | Bearer JWT | Bookmark or un-bookmark recipe into default/custom collection |
| `GET` | `/api/SavedRecipe/collection/{collectionId}` | Bearer JWT | List all recipes saved within specified collection |

---

### 3.11 User Activity & Session Analytics (`/api/Activity`, `/api/Statistic`)

#### Activity Tracking (`/api/Activity`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/Activity/heartbeat` | Anonymous / JWT | Heartbeat ping to maintain active user session duration |
| `POST` | `/api/Activity/record-recipe-select` | Anonymous / JWT | Record first recipe clicked within session and conversion time |

#### Statistics (`/api/Statistic`)
| Method | Route | Auth | Description |
|---|---|---|---|
| `GET` | `/api/Statistic/subscriptions` | Admin | Aggregate subscription revenue and conversion metrics |
| `GET` | `/api/Statistic/weekly-engagement` | Admin | Session duration, heartbeat counts, and recipe discovery analytics |

---

### 3.12 Media Uploads (`/api/Upload`)

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/Upload/image` | Anonymous / JWT | Upload image multipart form to Cloudinary CDN storage |
