# API Reference & Service Contracts

Documentation of primary endpoints exposed by the SmartMeal backend and AI services.

---

## 1. AI Service Endpoints (`smartmeal-predict`)

Base URL: `http://<service-ip>:8000` (or `https://api.ocgi.space/predict`)

### `GET /health`
Returns service runtime health and model verification status.

**Response `200 OK`**:
```json
{
  "device": "CPU",
  "model": "best.onnx",
  "runtime": "ONNX Runtime",
  "status": "ok"
}
```

### `POST /predict`
Processes an uploaded image and detects contained ingredients.

**Request**:
- Content-Type: `multipart/form-data`
- Body: `image: <binary file>`

**Response `200 OK`**:
```json
{
  "success": true,
  "count": 2,
  "detections": [
    {
      "class_id": 1,
      "class_name": "tomato",
      "confidence": 0.94,
      "box": [120, 45, 310, 290]
    },
    {
      "class_id": 4,
      "class_name": "onion",
      "confidence": 0.88,
      "box": [320, 80, 450, 220]
    }
  ]
}
```

---

## 2. Server API Key Endpoints (`smartmeal-api`)

Base URL: `https://api.ocgi.space`

### Authentication (`/api/Auth`)
- `POST /api/Auth/register`: Register user credentials.
- `POST /api/Auth/login`: Authenticate and obtain JWT Bearer token.
- `POST /api/Auth/google-login`: Authenticate with Google ID token.

### Recipes & Ingredients (`/api/Recipe`, `/api/Ingredient`)
- `GET /api/Recipe`: Paginated recipe query with tag, label, and allergy filtering.
- `GET /api/Recipe/{id}`: Detailed recipe instructions, ingredients, and nutrition facts.
- `POST /api/Recipe`: Create recipe entry (Admin/Partner only).
- `GET /api/Ingredient`: List recognized ingredients and calorie estimates.

### Nutrition & Meal Plans (`/api/MealPlan`, `/api/NutritionDiary`)
- `POST /api/MealPlan/generate`: Generate customized weekly/daily meal plan based on health constraints.
- `POST /api/MealPlan/suggest-for-date`: Suggest meals for a single date (`?date=YYYY-MM-DD&meals=...&focus=...`).
- `POST /api/MealPlan/suggest-for-date-range`: Suggest meals across a multi-day range (`?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&meals=...&focus=...`). Enforces future-or-today and max 30 days constraints.
- `GET /api/MealPlan/week`: Fetch 7-day Monday–Sunday meal plan view for a target date (`?date=YYYY-MM-DD`).
- `GET /api/NutritionDiary`: Fetch user consumption logs for specific date ranges.
- `POST /api/NutritionDiary/log`: Log meal consumption and compute remaining macro allowance.

### Health Profile (`/api/HealthProfile`, `/api/MedicalCondition`)
- `GET /api/HealthProfile`: Fetch current user metrics (BMI, allergies, dietary goals).
- `PUT /api/HealthProfile`: Update physical stats and health preferences.
- `GET /api/MedicalCondition`: Pre-configured medical conditions affecting diet recommendations.
