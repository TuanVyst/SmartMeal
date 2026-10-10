---
name: backend-design
description: Backend engineering, Clean Architecture, and EF Core standards for SmartMeal (.NET 8 Web API).
triggers:
  - working on Server/
  - modifying PresentationLayer, Service, Repository, DataAccessLayer, or BusinessObject
  - writing EF Core migrations, LINQ queries, DTOs, or controllers
  - configuring database connection strings, Swagger, or dependency injection
---

# Backend Design & Engineering Skill

Standards, patterns, and conventions for developing the SmartMeal .NET 8 Web API (`Server/`).

---

## 1. Clean Architecture Layers & Responsibilities

The server follows a strict 5-tier Clean Architecture:
```text
Server/
├── PresentationLayer/    # Web API Controllers, Filters, Middleware, Program.cs, Swagger
├── Service/              # Business logic, orchestration, validation (Interfaces & Implements)
├── Repository/           # Abstractions over data access, complex querying (Interfaces & Implements)
├── DataAccessLayer/      # AppDbContext, Entity Configurations, EF Core Migrations
└── BusinessObject/       # Domain Entities, DTOs (RequestModels & ResponseModels)
```

### Dependency Rules:
1. **`PresentationLayer`** references `Service` and `BusinessObject`.
   - **NEVER** inject `AppDbContext` or repository interfaces directly into controllers. Controllers only communicate via service interfaces (e.g. `IMealPlanningService`).
2. **`Service`** references `Repository`, `DataAccessLayer` (if needed for unit-of-work abstractions), and `BusinessObject`.
3. **`Repository`** references `DataAccessLayer` and `BusinessObject`.
4. **`DataAccessLayer`** references `BusinessObject`.
5. **`BusinessObject`** has zero inward dependencies on other application layers.

---

## 2. Controller & Envelope Standards

### 2.1 Standardized Response Envelopes
All endpoints should return consistent JSON envelopes:
- **Success**:
  ```json
  {
    "data": { ... },
    "message": "Thành công"
  }
  ```
- **Error**:
  ```json
  {
    "message": "Mô tả lỗi chi tiết hoặc mã lỗi",
    "errors": [ ... ]
  }
  ```

### 2.2 Controller Design Pattern
```csharp
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MealPlanController : ControllerBase
{
    private readonly IMealPlanningService _mealPlanningService;

    public MealPlanController(IMealPlanningService mealPlanningService)
    {
        _mealPlanningService = mealPlanningService;
    }

    [HttpGet("active")]
    [ProducesResponseType(typeof(ApiResponse<PlanResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetActivePlan(CancellationToken cancellationToken)
    {
        try
        {
            var accountId = GetAccountId();
            var plan = await _mealPlanningService.GetActivePlanAsync(accountId, cancellationToken);
            return Ok(new { data = plan });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
```

---

## 3. Entity Framework Core (EF Core) Best Practices

### 3.1 AsNoTracking for Read Operations
Always use `.AsNoTracking()` for read-only queries to prevent the EF change tracker from incurring memory overhead:
```csharp
var plans = await _context.Plans
    .AsNoTracking()
    .Where(p => p.AccountId == accountId && p.IsActive)
    .ToListAsync(cancellationToken);
```

### 3.2 Eliminating N+1 Query Anti-Patterns
- Eager load required relations with `.Include()` and `.ThenInclude()`.
- Prefer explicit projections using `.Select()` to fetch only required columns into DTOs directly from the database query.
- Never trigger deferred execution within loops (e.g. iterating a collection and issuing database queries for each item).

### 3.3 Asynchronous Patterns
- Every database interaction **MUST** use asynchronous methods (`ToListAsync()`, `FirstOrDefaultAsync()`, `SaveChangesAsync()`).
- Propagate `CancellationToken` across controller actions, services, and repositories.

---

## 4. DTO Mapping & Validation

- Request payloads must use dedicated DTOs in `BusinessObject/DTOs/RequestModels/` (e.g. `PlanRequest.cs`, `RecordRecipeSelectRequest.cs`).
- Response payloads must use dedicated DTOs in `BusinessObject/DTOs/ResponseModels/` (e.g. `PlanResponseDto.cs`).
- Do not expose entity instances or navigation cycles directly in API responses.
- Implement validation (via DataAnnotations or FluentValidation) before processing inputs in the service layer.

---

## 5. Database Migrations & Connection Management

### 5.1 Migration Execution Command
When adding or applying migrations, specify the startup project (`-s PresentationLayer`) and data project (`-p DataAccessLayer`):
```bash
dotnet ef migrations add <MigrationName> -s PresentationLayer -p DataAccessLayer
dotnet ef database update -s PresentationLayer -p DataAccessLayer
```

### 5.2 Naming & Standards
- Migration names must be PascalCase, descriptive, and timestamped by the tooling (e.g. `AddRecipeSelectTrackingToUserSessionLog`).
- Ensure entity relationships define appropriate delete behaviors (`OnDelete: Restrict` or `Cascade` where explicitly required).
- Always keep connection strings abstracted in `appsettings.json` / environment variables (`ConnectionStrings__DefaultConnection`).

---

## 6. Swagger / OpenAPI Documentation

- Configure Swagger in `PresentationLayer/Program.cs` with JWT Bearer security scheme definitions so authorized endpoints can be tested directly.
- Annotate actions with `[ProducesResponseType]` and XML documentation comments to provide clear endpoint schemas.
