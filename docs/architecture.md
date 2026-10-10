# SmartMeal Architecture & System Design Documentation

This document describes the architectural topology, deployment configuration, core module structures, cross-service communication flows, and CI/CD lifecycle of the **SmartMeal** platform.

---

## 1. System Topology Overview

SmartMeal is an intelligent meal recommendation and dietary tracking platform comprising a **.NET 8 Clean Architecture** backend, a **Python / Flask / ONNX Runtime** AI computer vision engine, a **React 19 / Vite** single-page web app, and a **Flutter (Dart 3)** cross-platform mobile application.

```mermaid
graph TB
    subgraph Clients["Client Tier"]
        WebClient["React 19 Web App (Vite)<br/>Hosted on Vercel"]
        MobileClient["Flutter Mobile App (Android/iOS)<br/>Dio + Provider"]
    end

    subgraph IngressTier["Ingress & Gateway"]
        Gateway["Cilium Gateway API<br/>(api.ocgi.space / 10.20.20.15)"]
        HttpRouteApi["HTTPRoute: smartmeal-api<br/>Path: / , /api/* , /swagger/*"]
        HttpRoutePredict["HTTPRoute: smartmeal-predict<br/>Path: /predict/*"]
    end

    subgraph ServiceMesh["Kubernetes Cluster (Namespace: smartmeal)"]
        ApiPod["smartmeal-api (.NET 8)<br/>Port: 80 / TCP<br/>PresentationLayer, Service, Repository"]
        PredictPod["smartmeal-predict (Flask + ONNX)<br/>Port: 8000 / TCP<br/>YOLOv8 best.onnx"]
    end

    subgraph StorageExternal["Data & External Services"]
        Postgres[("PostgreSQL 15+<br/>Port: 5432 / TCP")]
        Cloudinary["Cloudinary CDN<br/>Image Storage"]
        PayOS["PayOS Payment Gateway<br/>Checkout & Webhooks"]
        SendGrid["SendGrid Email API<br/>OTP Authentication"]
    end

    WebClient -->|HTTPS REST| Gateway
    MobileClient -->|HTTPS REST| Gateway

    Gateway --> HttpRouteApi
    Gateway --> HttpRoutePredict

    HttpRouteApi --> ApiPod
    HttpRoutePredict --> PredictPod

    ApiPod --> Postgres
    ApiPod --> Cloudinary
    ApiPod --> PayOS
    ApiPod --> SendGrid
    PredictPod -.->|Model Inference| PredictPod
```

---

## 2. Infrastructure & Deployment Architecture

### 2.1 Kubernetes Gateway API & Routing
SmartMeal uses Kubernetes **Gateway API** with Cilium CNI and MetalLB load balancing in production:
- **Namespace**: `smartmeal`
- **Gateway**: `shared-gateway` (`gatewayClassName: cilium`, IP: `10.20.20.15`)
- **Host**: `api.ocgi.space`

#### HTTPRoute Rules:
```mermaid
flowchart LR
    Request["Incoming Request: api.ocgi.space"]
    GW["Gateway: shared-gateway"]
    MatchPrefix{"Path Match"}
    BackendApi["Service: smartmeal-api:80"]
    BackendPredict["Service: smartmeal-predict:8000"]

    Request --> GW --> MatchPrefix
    MatchPrefix -->|"/", "/api/*", "/swagger/*"| BackendApi
    MatchPrefix -->|"/predict/*"| BackendPredict
```

### 2.2 Kubernetes Network Policies
Zero-trust network security is enforced in `infra/k8s/overlay/prod/network-policy.yaml`:
- **Default Deny All**: `smartmeal-default-deny-all` blocks all ingress and egress by default across the namespace.
- **smartmeal-api-netpol**:
  - Ingress: Port 80 (TCP) from Gateway/Ingress.
  - Egress: Port 53 (UDP/TCP) to `kube-dns`, Port 5432 (TCP) to PostgreSQL, Port 443 (TCP) for HTTPS external outbound (PayOS, SendGrid, Cloudinary).
- **smartmeal-predict-netpol**:
  - Ingress: Port 8000 (TCP) from Gateway.
  - Egress: Port 53 (UDP/TCP) to `kube-dns` only (fully isolated; no external internet access).

---

## 3. Backend Module Class Diagrams (Clean Architecture)

SmartMeal adheres to Clean Architecture with four distinct project layers:
1. **BusinessObject**: Core entities, data annotations, and DTO request/response models.
2. **DataAccessLayer**: `AppDbContext`, EF Core migrations, and model binding.
3. **Repository**: Data access abstractions (`IRecipeRepo`, `IPlanRepo`, etc.) and implementations using EF Core.
4. **Service**: Domain business logic, caching, external SDKs (`IRecipeService`, `IMealPlanningService`, etc.).
5. **PresentationLayer**: ASP.NET Core Web API Controllers, Background Services, and Swagger UI.

### 3.1 Recipe & Nutrition Module

```mermaid
classDiagram
    class RecipeController {
        -IRecipeService _recipeService
        +GetAll()
        +GetById(Guid id)
        +GetRecommendedForMe()
        +SuggestByCalories(double targetCalories)
        +Create(RecipeRequest request)
    }

    class IRecipeService {
        <<interface>>
        +GetAllRecipes()
        +GetRecipeById(Guid id)
        +GetRecommendedRecipes(Guid accountId)
        +SuggestRecipesByCalories(double targetCalories, double tolerance)
        +CreateRecipe(RecipeRequest request)
    }

    class RecipeService {
        -IRecipeRepo _recipeRepo
        -IHealthProfileRepo _profileRepo
        -IAllergyRepo _allergyRepo
        +GetAllRecipes()
        +GetRecommendedRecipes(Guid accountId)
    }

    class IRecipeRepo {
        <<interface>>
        +GetAll()
        +GetById(Guid id)
        +Create(Recipe recipe)
        +Update(Recipe recipe)
        +Delete(Guid id)
    }

    class RecipeRepo {
        -AppDbContext _context
    }

    class Recipe {
        +Guid Recipe_id
        +Guid Account_id
        +string Recipe_name
        +string Instruction
        +int CookTime
        +int PrepTime
        +List~RecipeIngredient~ RecipeIngredients
    }

    RecipeController --> IRecipeService
    RecipeService ..|> IRecipeService
    RecipeService --> IRecipeRepo
    RecipeRepo ..|> IRecipeRepo
    RecipeRepo --> Recipe
```

### 3.2 Authentication & User Lifecycle Module

```mermaid
classDiagram
    class AuthController {
        -IAccountService _service
        +Register(RegisterRequest request)
        +VerifyRegisterOtp(VerifyOtpRequest request)
        +Login(LoginRequest request)
        +GoogleLogin(GoogleLoginRequest request)
        +UpdateAvatar(UpdateAvatarRequest request)
    }

    class IAccountService {
        <<interface>>
        +Login(LoginRequest request)
        +Register(RegisterRequest request)
        +VerifyOtp(VerifyOtpRequest request)
        +GoogleLogin(GoogleLoginRequest request)
    }

    class AccountService {
        -IAccountRepo _accountRepo
        -IEmailService _emailService
        -IMemoryCache _cache
        -IConfiguration _config
        +Login()
        +Register()
        +VerifyOtp()
    }

    class IMemoryCache {
        <<interface>>
        +TryGetValue(key, out val)
        +Set(key, val, options)
        +Remove(key)
    }

    class Account {
        +Guid Account_id
        +string Username
        +string Password
        +int Role
        +string Email
    }

    AuthController --> IAccountService
    AccountService ..|> IAccountService
    AccountService --> IMemoryCache
    AccountService --> Account
```

---

## 4. Frontend & Mobile Client Architecture

### 4.1 React Web Client (`Client/src`)
- **State & Networking**: Axios instance with request/response interceptors (`src/services/api.js`).
- **Feature Structure**:
  - `src/pages/MealDetail`: Recipe rendering and portion breakdown.
  - `src/pages/ingredient-detection`: Image upload and direct canvas rendering of ONNX bounding boxes.
  - `src/pages/admin`: User management, subscription stats, and content moderation.
  - `src/hooks/useActivityTracker.js`: Sends heartbeat telemetry every 30s to `/api/Activity/heartbeat` and monitors first-recipe interaction.

### 4.2 Flutter Mobile Client (`ClientMobile/lib`)
- **Architecture**: Clean Architecture / Feature-Driven Design:
  - `core/network/api_client.dart`: Singleton `Dio` instance with Bearer JWT interceptors and error mappings.
  - `core/constants/api_constants.dart`: Centralized endpoint catalog with platform-aware IP resolution (Web, Android Emulator, Real Device).
  - `features/{auth,recipes,diary,meal_plan,onboarding,profile}/`: Domain entities, data sources, and Provider state management.

```mermaid
classDiagram
    class ApiClient {
        +Dio dio
        +InterceptorsWrapper authInterceptor
        -_handleError(DioException error)
    }

    class RecipeService {
        -ApiClient _client
        +getRecipes()
        +getRecipeDetails(String id)
        +getRecommendedRecipes()
    }

    class RecipeProvider {
        -RecipeService _recipeService
        +List~Recipe~ recipes
        +bool isLoading
        +fetchRecipes()
    }

    class MealSuggestionsScreen {
        +build(BuildContext context)
    }

    MealSuggestionsScreen --> RecipeProvider
    RecipeProvider --> RecipeService
    RecipeService --> ApiClient
```

---

## 5. Sequence & Communication Flows

### 5.1 AI Ingredient Detection & Recipe Recommendation Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Web/Mobile)
    participant Client as Client Application
    participant Gateway as Cilium Gateway
    participant Predict as smartmeal-predict (AI)
    participant Api as smartmeal-api (.NET)
    participant DB as PostgreSQL

    User->>Client: Capture / upload fridge image
    Client->>Gateway: POST /predict (multipart/form-data)
    Gateway->>Predict: Route /predict to port 8000
    Predict->>Predict: Preprocess image & run ONNX inference
    Predict-->>Client: 200 OK {success: true, detections: [Tomato, Onion]}
    Client->>Client: Extract detected class names
    Client->>Gateway: GET /api/Recipe/ingredients?ingredientIds=...
    Gateway->>Api: Route /api/Recipe/... to port 80
    Api->>DB: Query recipes matching ingredients with allergy exclusion
    DB-->>Api: Recipe entity set
    Api-->>Client: 200 OK [Matching recipes list]
    Client-->>User: Display recipe cards matching detected items
```

### 5.2 Subscription Checkout & Webhook Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Client as Client
    participant Api as smartmeal-api
    participant PayOS as PayOS Payment Gateway
    participant DB as PostgreSQL

    User->>Client: Select Pro Subscription Plan
    Client->>Api: POST /api/Payment/create {planId}
    Api->>PayOS: Create checkout link via PayOS SDK
    PayOS-->>Api: Return checkoutUrl & orderCode
    Api-->>Client: Return checkoutUrl
    Client->>User: Redirect to PayOS checkout page
    User->>PayOS: Completes bank transfer / QR payment
    PayOS->>Api: POST /api/Payment/webhook (Signed IPN Payload)
    Api->>Api: Verify PayOS HMAC signature
    Api->>DB: Insert Subscription (Status: Active) & update User Tier
    DB-->>Api: Confirmed
    Api-->>PayOS: 200 OK (Webhook handled)
    User->>Client: Redirect to /payment/success
    Client->>Api: GET /api/Subscription/check-feature
    Api-->>Client: 200 OK (Pro features unlocked)
```

---

## 6. CI/CD Lifecycle & Conventional Commits

The deployment automation defined in `.github/workflows/main.yml` coordinates semantic versioning, multi-container builds, and GitOps manifest updates:

```mermaid
flowchart TD
    Push["Push to master or tag created"]
    
    subgraph TagJob["Job 1: Auto Tag Release (ubuntu-22.04)"]
        Checkout1["actions/checkout@v4 (fetch-depth: 0)"]
        Filter["dorny/paths-filter@v3 (Server/**, AI/**)"]
        Semver["paulhatch/semantic-version@v5.4.0<br/>Major: BREAKING CHANGE / breaking:<br/>Minor: feat:"]
        CalcTag["Resolve Tag:<br/>If ref is tag -> use tag<br/>If backend changed & bump=0 -> auto-increment minor<br/>Tag & push: git push origin vX.Y.Z"]
    end

    subgraph BuildJob["Job 2: Build & Push Images (ubuntu-22.04)"]
        LoginGHCR["docker/login-action@v3 (ghcr.io)"]
        BuildServer["docker/build-push-action@v5<br/>Target: smartmeal-server:vX.Y.Z & :latest"]
        BuildAI["docker/build-push-action@v5<br/>Target: smartmeal-predict:vX.Y.Z & :latest"]
    end

    subgraph DeployJob["Job 3: GitOps Manifest Update (ubuntu-22.04)"]
        SetupKustomize["imranismail/setup-kustomize@v3"]
        EditImage["kustomize edit set image<br/>smartmeal-server:vX.Y.Z<br/>smartmeal-predict:vX.Y.Z"]
        GitCommit["stefanzweifel/git-auto-commit-action@v5<br/>Commit: chore(k8s): update image tags to vX.Y.Z [skip ci]"]
    end

    Push --> Checkout1 --> Filter --> Semver --> CalcTag
    CalcTag --> BuildJob
    LoginGHCR --> BuildServer --> DeployJob
    LoginGHCR --> BuildAI --> DeployJob
    SetupKustomize --> EditImage --> GitCommit
```

### Conventional Commit Specifications:
- `feat:`: Increments **Minor** version (e.g. `v1.1.0` $\rightarrow$ `v1.2.0`).
- `fix:` / `perf:` / `refactor:`: Increments **Patch** version.
- `BREAKING CHANGE:` / `breaking:`: Increments **Major** version.
- If backend changes are present in `Server/` or `AI/` without explicit prefix bumping, the workflow automatically increments the minor version to ensure image builds always receive unique release tags.
