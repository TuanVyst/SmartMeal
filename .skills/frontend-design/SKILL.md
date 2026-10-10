---
name: frontend-design
description: Frontend engineering and UI/UX design standards for SmartMeal (React 19 + Vite web client and Flutter mobile client).
triggers:
  - working on Client/ or ClientMobile/
  - modifying React 19 components, hooks, services, or styles
  - modifying Flutter widgets, providers, screens, or dio networking
  - designing responsive UI, accessibility, notifications, or token flows
---

# Frontend Design & Engineering Skill

Standards, patterns, and conventions for developing web (`Client/`) and mobile (`ClientMobile/`) applications in SmartMeal.

---

## 1. Web Client (React 19 + Vite)

### 1.1 Architecture & Component Hierarchy
- **Functional Components & React 19**:
  - Always write clean functional components. Use React 19 hooks (`useActionState`, `useOptimistic`, standard hooks `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`).
  - Keep components modular and strictly scoped:
    - `src/components/`: Reusable, domain-agnostic UI units (buttons, cards, modals, form inputs).
    - `src/pages/`: Page-level screens handling route layout and orchestration.
    - `src/hooks/`: Encapsulated stateful logic and tracking (e.g. `useActivityTracker.js`).
    - `src/services/`: Pure network and API integration functions.
    - `src/assets/styles/`: Shared CSS and component-specific style files.

### 1.2 State Management & Data Fetching
- Keep state local to the nearest ancestor whenever possible (`useState`, `useReducer`).
- Lift state only when multiple non-sibling components require synchronization.
- Never duplicate server-derived data in state; compute derived values inline or with `useMemo`.
- For background sync and tracking (heartbeats, telemetry), encapsulate timers and listeners within dedicated custom hooks that clean up on unmount.

### 1.3 Networking, Token Management & Interceptors (`Client/src/services/api.js`)
- All backend REST interactions **must** use the centralized Axios instance in `Client/src/services/api.js`.
- **Base URL Resolution**:
  ```javascript
  const apiEndpoint = import.meta.env.VITE_BASE_URL || '';
  const api = axios.create({
    baseURL: apiEndpoint ? `${apiEndpoint}/api` : '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
  });
  ```
- **JWT Authorization Interceptor**:
  - Request interceptor retrieves `token` from `localStorage` and attaches `Authorization: Bearer <token>`.
  - Handle token refresh or session expiration on `401 Unauthorized` responses gracefully: clear stale auth and redirect or dispatch an auth renewal event.
- **Predict Endpoint / AI Integration**:
  - Image multipart prediction calls (`predictImage`) hit the `/predict` route (via Vite proxy or direct AI URL). Always pass `FormData` without overriding `multipart/form-data` boundaries manually.
- **Standardized Error Handling**:
  - The response interceptor must normalize errors into uniform structures `{ message, status, data, originalError }`.
  - Distinguish between client aborts (`ECONNABORTED`), HTTP errors (`error.response`), and network dropouts (`error.request`).

### 1.4 Responsive UI & Accessibility (a11y)
- **Tailwind CSS & Utility-first Layouts**:
  - Mobile-first approach: use breakpoints `sm:`, `md:`, `lg:`, `xl:` systematically.
  - Consistent spacing scale and design tokens (palette, radius, typography).
- **Accessibility Standards**:
  - All interactive elements must have visible focus rings (`focus-visible:ring-2`).
  - Image tags must include descriptive `alt` tags (or `aria-hidden="true"` for decorative icons).
  - ARIA attributes (`aria-expanded`, `aria-label`, `role="alert"`) for modals, drawers, and dynamic notifications.
  - Form controls must be explicitly associated with labels using `htmlFor` and `id`.

### 1.5 Toast & Notification UX
- Use non-blocking, accessible toast notifications for asynchronous actions (save, generate plan, delete, network error).
- Keep notification messages concise, localized, and actionable.
- Ensure error toasts provide human-readable recovery steps (e.g. "Vui lòng thử lại sau" instead of raw stack traces).

---

## 2. Mobile Client (Flutter / Dart `ClientMobile/`)

### 2.1 Feature-First Clean Architecture
Organize by feature under `ClientMobile/lib/features/<feature>/`:
```text
lib/
├── features/
│   ├── nutrition/
│   │   ├── domain/        # Entities, business models, validation
│   │   ├── data/          # Repositories, data sources, DTOs
│   │   └── presentation/  # Screens, widgets, state providers
│   ├── recipes/
│   ├── diary/
│   └── home/
├── widgets/               # Shared cross-feature UI widgets
└── main.dart
```

### 2.2 State Management (Provider & ChangeNotifier)
- Use `ChangeNotifier` and `ChangeNotifierProvider` for feature-level state management (e.g. `RecipeProvider`).
- Isolate rebuilds using `Consumer<T>` or `context.select<T, R>` instead of rebuilding entire screen scaffolds.
- Dispose controllers, stream subscriptions, and timers in `dispose()`.

### 2.3 Networking (Dio) & Secure Storage
- Centralize HTTP operations using a singleton `Dio` client configured with base URL, timeout, and logging interceptors.
- Save sensitive credentials (JWT access/refresh tokens) strictly using `flutter_secure_storage` (`FlutterSecureStorage`), never plain `SharedPreferences`.
- Attach authorization headers through a dedicated Dio request interceptor:
  ```dart
  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await secureStorage.read(key: 'jwt_token');
      if (token != null) {
        options.headers['Authorization'] = 'Bearer $token';
      }
      return handler.next(options);
    },
  ));
  ```

### 2.4 UI & Interaction Guidelines
- Maintain 60fps / 120fps fluid layouts: avoid heavy calculations inside widget `build()` methods.
- Provide shimmer / skeleton placeholders during data loading.
- Respect safe areas (`SafeArea`) and adaptive sizing for diverse screen aspect ratios.
