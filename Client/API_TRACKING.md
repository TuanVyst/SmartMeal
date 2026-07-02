# API Integration Tracking Table

- **Project:** SmartMeal
- **BE API:** `http://localhost:5267/api`
- **FE Dev:** `http://localhost:5174`
- **Last updated:** 2026-07-02

## Legend
- :white_check_mark: Hoàn thành (service + UI)
- :large_orange_diamond: Đã có service, chưa có UI
- :x: Chưa gán

---

## Auth (6) - authService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 1 | :white_check_mark: | POST | `/auth/login` | `authService.login()` |
| 2 | :white_check_mark: | POST | `/auth/register` | `authService.register()` |
| 3 | :white_check_mark: | POST | `/auth/verify-otp` | `authService.verifyOtp()` |
| 4 | :white_check_mark: | POST | `/auth/verify-register-otp` | `authService.verifyRegisterOtp()` |
| 5 | :white_check_mark: | POST | `/auth/google-login` | `authService.googleLogin()` |
| 6 | :white_check_mark: | PUT | `/auth/avatar` | `authService.updateAvatar()` |

## Ingredient (6) - foodService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 7 | :white_check_mark: | GET | `/ingredient` | `getIngredients()` |
| 8 | :white_check_mark: | POST | `/ingredient` | `createIngredient()` |
| 9 | :white_check_mark: | GET | `/ingredient/{id}` | `getIngredientById()` |
| 10 | :white_check_mark: | PUT | `/ingredient/{id}` | `updateIngredient()` |
| 11 | :white_check_mark: | DELETE | `/ingredient/{id}` | `deleteIngredient()` |
| 12 | :white_check_mark: | GET | `/ingredientTag` | `getIngredientTags()` |

## Recipe (7) - recipeService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 13 | :white_check_mark: | GET | `/recipe` | `recipeService.getAll()` |
| 14 | :white_check_mark: | GET | `/recipe/{id}` | `recipeService.getById()` |
| 15 | :white_check_mark: | POST | `/recipe` | `recipeService.create()` |
| 16 | :white_check_mark: | PUT | `/recipe/{id}` | `recipeService.update()` |
| 17 | :white_check_mark: | DELETE | `/recipe/{id}` | `recipeService.delete()` |
| 18 | :large_orange_diamond: | GET | `/recipe/ingredients` | `recipeService.getByIngredients()` |
| 19 | :white_check_mark: | GET | `/recipe/suggest/pantry/{id}` | `recipeService.suggestFromPantry()` |

## SavedRecipe (7) - savedRecipeService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 20 | :white_check_mark: | GET | `/saved-recipe` | `savedRecipeService.getAll()` |
| 21 | :large_orange_diamond: | GET | `/saved-recipe/{id}` | `savedRecipeService.getById()` |
| 22 | :white_check_mark: | GET | `/saved-recipe/collection/{id}` | `savedRecipeService.getByCollectionId()` |
| 23 | :white_check_mark: | POST | `/saved-recipe/toggle` | `savedRecipeService.toggle()` |
| 24 | :white_check_mark: | POST | `/saved-recipe` | `savedRecipeService.create()` |
| 25 | :white_check_mark: | PUT | `/saved-recipe/{id}` | `savedRecipeService.update()` |
| 26 | :white_check_mark: | DELETE | `/saved-recipe/{id}` | `savedRecipeService.delete()` |

## Collection (6) - savedRecipeService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 27 | :white_check_mark: | GET | `/collection/account/{id}/default` | `savedRecipeService.getDefaultCollection()` |
| 28 | :white_check_mark: | POST | `/collection` | `savedRecipeService.createCollection()` |
| 29 | :white_check_mark: | GET | `/collection` | `savedRecipeService.getAllCollections()` |
| 30 | :white_check_mark: | GET | `/collection/{id}` | `savedRecipeService.getCollectionById()` |
| 31 | :white_check_mark: | PUT | `/collection/{id}` | `savedRecipeService.updateCollection()` |
| 32 | :white_check_mark: | DELETE | `/collection/{id}` | `savedRecipeService.deleteCollection()` |

## NutritionLog (5) - nutritionLogService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 33 | :white_check_mark: | GET | `/nutritionlog` | `nutritionLogService.getAll()` |
| 34 | :white_check_mark: | POST | `/nutritionlog` | `nutritionLogService.create()` |
| 35 | :white_check_mark: | DELETE | `/nutritionlog/{id}` | `nutritionLogService.delete()` |
| 36 | :white_check_mark: | GET | `/nutritionlog/{id}` | `nutritionLogService.getById()` |
| 37 | :white_check_mark: | PUT | `/nutritionlog/{id}` | `nutritionLogService.update()` |

## NutritionGoal (3) - nutritionGoalService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 38 | :white_check_mark: | GET | `/nutritiongoal` | `nutritionGoalService.getAll()` |
| 39 | :white_check_mark: | POST | `/nutritiongoal` | `nutritionGoalService.create()` |
| 40 | :white_check_mark: | PUT | `/nutritiongoal/{id}` | `nutritionGoalService.update()` |

## Allergy (5) - allergyService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 41 | :white_check_mark: | GET | `/allergy` | `allergyService.getAll()` |
| 42 | :white_check_mark: | POST | `/allergy` | `allergyService.create()` |
| 43 | :white_check_mark: | DELETE | `/allergy/{id}` | `allergyService.delete()` |
| 44 | :white_check_mark: | GET | `/allergy/{id}` | `allergyService.getById()` |
| 45 | :white_check_mark: | PUT | `/allergy/{id}` | `allergyService.update()` |

## HealthSurvey (4) - healthSurveyService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 46 | :white_check_mark: | POST | `/health-survey` | `submitHealthSurvey()` |
| 47 | :white_check_mark: | GET | `/health-survey/profile` | `getHealthProfile()` |
| 48 | :white_check_mark: | PUT | `/health-survey/profile` | `updateHealthProfile()` |
| 49 | :white_check_mark: | GET | `/health-survey/bmi-history` | `getBmiHistory()` |

## NutritionDiary (4) - nutritionDiaryService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 50 | :white_check_mark: | POST | `/nutrition-diary` | `addDiaryEntry()` |
| 51 | :white_check_mark: | GET | `/nutrition-diary?date=` | `getDiaryByDate()` |
| 52 | :white_check_mark: | DELETE | `/nutrition-diary/{id}` | `deleteDiaryEntry()` |
| 53 | :white_check_mark: | GET | `/nutrition-diary/summary` | `getDiarySummary()` |

## Pantry (5) - pantryService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 54 | :white_check_mark: | GET | `/pantry` | `pantryService.getAll()` |
| 55 | :white_check_mark: | GET | `/pantry/{id}` | `pantryService.getById()` |
| 56 | :white_check_mark: | POST | `/pantry` | `pantryService.create()` |
| 57 | :white_check_mark: | PUT | `/pantry/{id}` | `pantryService.update()` |
| 58 | :white_check_mark: | DELETE | `/pantry/{id}` | `pantryService.delete()` |

## UserDietPlan (5) - userDietPlanService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 59 | :white_check_mark: | GET | `/userdietplan` | `userDietPlanService.getAll()` |
| 60 | :white_check_mark: | GET | `/userdietplan/{id}` | `userDietPlanService.getById()` |
| 61 | :white_check_mark: | POST | `/userdietplan` | `userDietPlanService.create()` |
| 62 | :white_check_mark: | PUT | `/userdietplan/{id}` | `userDietPlanService.update()` |
| 63 | :white_check_mark: | DELETE | `/userdietplan/{id}` | `userDietPlanService.delete()` |

## DietPlan (5) - dietPlanService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 64 | :white_check_mark: | GET | `/dietplan` | `dietPlanService.getAll()` |
| 65 | :white_check_mark: | GET | `/dietplan/{id}` | `dietPlanService.getById()` |
| 66 | :white_check_mark: | POST | `/dietplan` | `dietPlanService.create()` |
| 67 | :white_check_mark: | PUT | `/dietplan/{id}` | `dietPlanService.update()` |
| 68 | :white_check_mark: | DELETE | `/dietplan/{id}` | `dietPlanService.delete()` |

## GroceryList (5) - groceryService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 69 | :white_check_mark: | GET | `/grocerylist` | `groceryListService.getAll()` |
| 70 | :white_check_mark: | GET | `/grocerylist/{id}` | `groceryListService.getById()` |
| 71 | :white_check_mark: | POST | `/grocerylist` | `groceryListService.create()` |
| 72 | :white_check_mark: | PUT | `/grocerylist/{id}` | `groceryListService.update()` |
| 73 | :white_check_mark: | DELETE | `/grocerylist/{id}` | `groceryListService.delete()` |

## GroceryItem (5) - groceryService.js
| # | Status | Method | Endpoint | Service Function |
|---|---|---|---|---|
| 74 | :white_check_mark: | GET | `/groceryitem` | `groceryItemService.getAll()` |
| 75 | :white_check_mark: | GET | `/groceryitem/{id}` | `groceryItemService.getById()` |
| 76 | :white_check_mark: | POST | `/groceryitem` | `groceryItemService.create()` |
| 77 | :white_check_mark: | PUT | `/groceryitem/{id}` | `groceryItemService.update()` |
| 78 | :white_check_mark: | DELETE | `/groceryitem/{id}` | `groceryItemService.delete()` |

---

## Tổng kết
- **Tổng API có service:** 78
- **Hoàn thành (service + UI):** 64
- **Có service, chưa UI:** 14
- **Chưa gán:** 0