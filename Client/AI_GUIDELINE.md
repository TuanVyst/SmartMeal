# SmartMeal Frontend Development Guideline

## Project Overview

SmartMeal is a meal planning and food recommendation system.

Technology Stack:

* Frontend: React + Vite
* Backend: ASP.NET Core Web API
* Database: SQL Server
* Architecture:

  * BusinessObject
  * DataAccessLayer
  * Repository
  * Service
  * PresentationLayer (API)

Frontend must communicate ONLY through backend APIs.

Do not access database directly from frontend.

---

# Frontend Folder Structure

```text
src/
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
│
├── components/
│   ├── common/
│   ├── forms/
│   ├── tables/
│   └── layout/
│
├── pages/
│   ├── auth/
│   ├── dashboard/
│   ├── food/
│   ├── mealplan/
│   ├── recipe/
│   └── profile/
│
├── services/
│   ├── api.js
│   ├── authService.js
│   ├── foodService.js
│   ├── mealPlanService.js
│   └── recipeService.js
│
├── routes/
│   └── AppRoutes.jsx
│
├── context/
│   └── AuthContext.jsx
│
├── hooks/
│
├── layouts/
│   ├── MainLayout.jsx
│   └── AuthLayout.jsx
│
├── utils/
│
├── App.jsx
└── main.jsx
```

---

# Coding Rules

## Component Rules

* One component per file.
* Use functional components only.
* Use React Hooks.
* Avoid class components.
* Keep components small and reusable.

Example:

```jsx
export default function FoodCard() {
    return (
        <div>
            Food Card
        </div>
    );
}
```

---

# API Rules

All API calls must be placed inside:

```text
src/services/
```

Never call API directly inside UI components.

Bad:

```jsx
axios.get(...)
```

inside page component.

Good:

```jsx
foodService.getFoods()
```

---

# Authentication Rules

Use JWT Authentication.

Store token in:

```javascript
localStorage
```

Use:

```text
AuthContext
```

to manage login state.

---

# Routing Rules

Use:

```javascript
react-router-dom
```

Every page must be registered in:

```text
routes/AppRoutes.jsx
```

Example:

```jsx
<Route path="/foods" element={<FoodPage />} />
```

---

# UI Design Rules

Theme:

* Modern
* Clean
* Healthcare style
* White background
* Green primary color
* Responsive design

Preferred Colors:

```css
Primary: #22C55E
Primary Dark: #16A34A
Background: #F8FAFC
Text: #1E293B
```

---

# Responsive Rules

Must support:

* Desktop
* Tablet
* Mobile

Preferred:

* Flexbox
* CSS Grid

Avoid fixed widths.

Use:

```css
max-width
```

instead of hardcoded width values.

---

# Pages Required

## Authentication

* Login
* Register
* Forgot Password

## Dashboard

* Dashboard Home

## Food Management

* Food List
* Food Detail

## Meal Planning

* Meal Plan List
* Create Meal Plan

## Recipe

* Recipe List
* Recipe Detail

## User Profile

* Profile
* Edit Profile

---

# Layout Structure

MainLayout:

```text
--------------------------------
Sidebar
--------------------------------
Header
--------------------------------
Page Content
--------------------------------
Footer
```

Authentication pages should use:

```text
AuthLayout
```

without Sidebar.

---

# Naming Convention

Components:

```text
PascalCase
```

Example:

```text
FoodCard.jsx
MealPlanTable.jsx
```

Variables:

```text
camelCase
```

Example:

```javascript
foodList
mealPlanData
```

Constants:

```javascript
UPPER_CASE
```

Example:

```javascript
API_BASE_URL
```

---

# Libraries Allowed

Required:

```bash
npm install axios
npm install react-router-dom
```

Optional:

```bash
npm install react-icons
npm install sweetalert2
npm install react-hook-form
```

---

# AI Assistant Instructions

When generating code:

1. Follow the folder structure exactly.
2. Do not generate backend code.
3. Do not generate database code.
4. Do not create duplicate components.
5. Reuse existing components whenever possible.
6. Always separate:

   * UI
   * Business Logic
   * API Calls
7. Write clean and maintainable code.
8. Prefer readability over optimization.
9. Use English naming for all files and code.
10. Generate complete working React code.

```
```
