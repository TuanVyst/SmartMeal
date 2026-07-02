# SmartMeal API Missing Report

- **Project:** SmartMeal
- **Repo:** SmartMeal
- **BE API:** `http://localhost:5267/api`
- **FE Dev:** `http://localhost:5174`
- **Last updated:** 2026-06-28

---

## 📊 Tổng quan API (144 endpoints)

> **—** = Bỏ qua
> **Role:** 🔓 Public | 👤 User | 🔒 Admin | 🌐 User+Admin
> **Status:** Hoàn thành | Đã gán chưa test | Chưa gán | Chưa có UI | Bỏ qua

### Auth (6 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 1 | Hoàn thành | 🔓 Public | POST | `/auth/login` | Đăng nhập | Login | P0 |
| 2 | Hoàn thành | 🔓 Public | POST | `/auth/register` | Đăng ký | Register | P0 |
| 3 | Hoàn thành | 🔓 Public | POST | `/auth/verify-otp` | Xác thực OTP | Login | P0 |
| 4 | Hoàn thành | 🔓 Public | POST | `/auth/verify-register-otp` | Xác thực OTP đăng ký | Register | P0 |
| 5 | Hoàn thành | 🔓 Public | POST | `/auth/google-login` | Đăng nhập Google | Login | P0 |
| 6 | Hoàn thành | 👤 User | PUT | `/auth/avatar` | Đổi avatar | Profile | P0 |

### Ingredient (6 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 7 | Hoàn thành | 🔓 Public | GET | `/ingredient` | Danh sách nguyên liệu | Nutrition, MealSuggestion, IngredientList | P0 |
| 8 | Hoàn thành | 🔒 Admin | POST | `/ingredient` | Thêm nguyên liệu | IngredientForm | P0 |
| 9 | Hoàn thành | 🔓 Public | GET | `/ingredient/{id}` | Chi tiết nguyên liệu | IngredientDetail, IngredientForm | P0 |
| 10 | Hoàn thành | 🔒 Admin | PUT | `/ingredient/{id}` | Sửa nguyên liệu | IngredientForm | P0 |
| 11 | Hoàn thành | 🔒 Admin | DELETE | `/ingredient/{id}` | Xóa nguyên liệu | IngredientList | P0 |
| 12 | Hoàn thành | 🔓 Public | GET | `/ingredientTag` | Danh sách tag nguyên liệu | IngredientForm | P0 |

### Recipe (7 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 13 | Hoàn thành | 🔓 Public | GET | `/recipe` | Danh sách recipe | Nutrition, MealSuggestion | P0 |
| 14 | Hoàn thành | 🔓 Public | GET | `/recipe/{id}` | Chi tiết recipe | MealDetail | P0 |
| 15 | Hoàn thành (Quy làm) | 👤 User | POST | `/recipe` | Tạo recipe | recipeService.create() → RecipeForm | P2 |
| 16 | Chưa gán | 🌐 User+Admin | PUT | `/recipe/{id}` | Sửa recipe | — | P2 |
| 17 | Chưa gán | 🌐 User+Admin | DELETE | `/recipe/{id}` | Xóa recipe | — | P2 |
| 18 | Chưa có UI | 🔓 Public | GET | `/recipe/ingredients` | Nguyên liệu recipe | — | P2 |
| 19 | Chưa gán | 👤 User | GET | `/recipe/suggest/pantry/{accountId}` | Gợi ý từ pantry | — | P0 |

### SavedRecipe (7 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 20 | Hoàn thành | 👤 User | GET | `/saved-recipe` | Danh sách recipe đã lưu | Favorites | P0 |
| 21 | Bỏ qua | 👤 User | GET | `/saved-recipe/{id}` | Chi tiết recipe đã lưu | — | P0 |
| 22 | Chưa gán | 👤 User | GET | `/saved-recipe/collection/{collectionId}` | Recipe theo bộ sưu tập | — | P0 |
| 23 | Hoàn thành | 👤 User | POST | `/saved-recipe/toggle` | Lưu/bỏ lưu recipe | FavoriteContext | P0 |
| 24 | Chưa gán | 👤 User | POST | `/saved-recipe` | Tạo saved recipe | — | P0 |
| 25 | Chưa gán | 👤 User | PUT | `/saved-recipe/{id}` | Sửa saved recipe | — | P0 |
| 26 | Chưa gán | 👤 User | DELETE | `/saved-recipe/{id}` | Xóa saved recipe | — | P0 |

### Collection (6 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 27 | Hoàn thành | 👤 User | GET | `/collection/account/{accountId}/default` | Bộ sưu tập mặc định | FavoriteContext | P0 |
| 28 | Hoàn thành | 👤 User | POST | `/collection` | Tạo bộ sưu tập | FavoriteContext | P0 |
| 29 | Chưa gán | 👤 User | GET | `/collection` | Danh sách bộ sưu tập | — | P0 |
| 30 | Chưa gán | 👤 User | GET | `/collection/{id}` | Chi tiết bộ sưu tập | — | P0 |
| 31 | Chưa gán | 👤 User | PUT | `/collection/{id}` | Sửa bộ sưu tập | — | P0 |
| 32 | Chưa gán | 👤 User | DELETE | `/collection/{id}` | Xóa bộ sưu tập | — | P0 |

### NutritionLog (5 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 33 | Hoàn thành | 👤 User | GET | `/nutritionlog` | Danh sách log | Dashboard, Nutrition | P0 |
| 34 | Hoàn thành | 👤 User | POST | `/nutritionlog` | Tạo log | Nutrition | P0 |
| 35 | Hoàn thành | 👤 User | DELETE | `/nutritionlog/{id}` | Xóa log | Nutrition | P0 |
| 36 | Chưa gán | 👤 User | GET | `/nutritionlog/{id}` | Chi tiết log | — | P0 |
| 37 | Chưa gán | 👤 User | PUT | `/nutritionlog/{id}` | Sửa log | — | P0 |

### NutritionGoal (3 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 38 | Hoàn thành | 👤 User | GET | `/nutritiongoal` | Danh sách mục tiêu | Nutrition | P0 |
| 39 | Hoàn thành | 👤 User | POST | `/nutritiongoal` | Tạo mục tiêu | Nutrition | P0 |
| 40 | Hoàn thành | 👤 User | PUT | `/nutritiongoal/{id}` | Sửa mục tiêu | Nutrition | P0 |

### Allergy (5 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 41 | Hoàn thành | 👤 User | GET | `/allergy` | Danh sách dị ứng | MealSuggestion | P0 |
| 42 | Hoàn thành | 👤 User | POST | `/allergy` | Thêm dị ứng | MealSuggestion | P0 |
| 43 | Hoàn thành | 👤 User | DELETE | `/allergy/{id}` | Xóa dị ứng | MealSuggestion | P0 |
| 44 | Chưa gán | 👤 User | GET | `/allergy/{id}` | Chi tiết dị ứng | — | P0 |
| 45 | Chưa gán | 👤 User | PUT | `/allergy/{id}` | Sửa dị ứng | — | P0 |

### HealthSurvey (4 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 46 | Hoàn thành | 👤 User | POST | `/health-survey` | Gửi khảo sát | HealthSurveyModal | P0 |
| 47 | Hoàn thành | 👤 User | GET | `/health-survey/profile` | Lấy profile sức khỏe | HealthProfileContext | P0 |
| 48 | Hoàn thành | 👤 User | PUT | `/health-survey/profile` | Cập nhật profile | HealthProfileContext | P0 |
| 49 | Hoàn thành | 👤 User | GET | `/health-survey/bmi-history` | Lịch sử BMI | HealthProfileEditor | P0 |

### NutritionDiary (4 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 50 | Hoàn thành | 👤 User | POST | `/nutrition-diary` | Tạo nhật ký | DiaryEntryDrawer | P0 |
| 51 | Hoàn thành | 👤 User | GET | `/nutrition-diary?date=` | Nhật ký theo ngày | useNutritionDiary | P0 |
| 52 | Hoàn thành | 👤 User | DELETE | `/nutrition-diary/{id}` | Xóa nhật ký | useNutritionDiary | P0 |
| 53 | Hoàn thành | 👤 User | GET | `/nutrition-diary/summary` | Tổng kết nhật ký | Service | P0 |

### Pantry (5 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 54 | Chưa gán | 👤 User | GET | `/pantry` | Danh sách tủ nguyên liệu | — | P0 |
| 55 | Chưa gán | 👤 User | GET | `/pantry/{id}` | Chi tiết pantry item | — | P0 |
| 56 | Chưa gán | 👤 User | POST | `/pantry` | Thêm vào tủ | — | P0 |
| 57 | Chưa gán | 👤 User | PUT | `/pantry/{id}` | Sửa pantry item | — | P0 |
| 58 | Chưa gán | 👤 User | DELETE | `/pantry/{id}` | Xóa pantry item | — | P0 |

### UserDietPlan (5 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 59 | Chưa gán | 👤 User | GET | `/userdietplan` | Danh sách kế hoạch | — | P1 |
| 60 | Chưa gán | 👤 User | GET | `/userdietplan/{id}` | Chi tiết kế hoạch | — | P1 |
| 61 | Chưa gán | 👤 User | POST | `/userdietplan` | Tạo kế hoạch | — | P1 |
| 62 | Chưa gán | 👤 User | PUT | `/userdietplan/{id}` | Sửa kế hoạch | — | P1 |
| 63 | Chưa gán | 👤 User | DELETE | `/userdietplan/{id}` | Xóa kế hoạch | — | P1 |

### DietPlan (5 endpoints)

| # | Status | Role | Method | Endpoint | Mô tả | Trang gọi | Priority |
|---|---|---|---|---|---|---|---|
| 64 | Chưa gán | 🔓 Public | GET | `/dietplan` | Danh sách diet plan | —