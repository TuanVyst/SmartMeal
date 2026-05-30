using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

// 1. Nạp biến môi trường từ .env TRƯỚC TIÊN
try
{
    var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
    DotNetEnv.Env.Load(envPath);
}
catch
{
    // .env file not found or error loading - use system environment variables
}

var builder = WebApplication.CreateBuilder(args);

// 2. Lấy giá trị từ biến môi trường
var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT");
var dbName = Environment.GetEnvironmentVariable("DB_NAME");
var dbUser = Environment.GetEnvironmentVariable("DB_USER");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

// 3. Tự lắp ráp Connection String
var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword};Trust Server Certificate=true";

// 4. Khởi tạo DbContext với chuỗi vừa ráp
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.
builder.Services.AddControllersWithViews();

// [CẬP NHẬT QUAN TRỌNG] Phải có 2 dòng này thì Swagger mới hoạt động được
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// GroceryList
builder.Services.AddScoped<Repository.Interfaces.IGroceryListRepo, Repository.Implements.GroceryListRepo>();
builder.Services.AddScoped<Service.Interfaces.IGroceryListService, Service.Implements.GroceryListService>();

// GroceryItem
builder.Services.AddScoped<Repository.Interfaces.IGroceryItemRepo, Repository.Implements.GroceryItemRepo>();
builder.Services.AddScoped<Service.Interfaces.IGroceryItemService, Service.Implements.GroceryItemService>();

// Rating
builder.Services.AddScoped<Repository.Interfaces.IRatingRepo, Repository.Implements.RatingRepo>();
builder.Services.AddScoped<Service.Interfaces.IRatingService, Service.Implements.RatingService>();

// Allergy
builder.Services.AddScoped<Repository.Interfaces.IAllergyRepo, Repository.Implements.AllergyRepo>();
builder.Services.AddScoped<Service.Interfaces.IAllergyService, Service.Implements.AllergyService>();

// Pantry
builder.Services.AddScoped<Repository.Interfaces.IPantryRepo, Repository.Implements.PantryRepo>();
builder.Services.AddScoped<Service.Interfaces.IPantryService, Service.Implements.PantryService>();

// Ingredient (for cross-repo validation in AllergyService/PantryService)
builder.Services.AddScoped<Repository.Interfaces.IIngredientRepo, Repository.Implements.IngredientRepo>();

var app = builder.Build();

// Seed database after app is built
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DataAccessLayer.AppDbContext>();
    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();
    if (!db.Roles.Any())
    {
        db.Roles.Add(new BusinessObject.Entities.Role { Name = "User", Description = "Default role" });
        db.SaveChanges();
    }
    if (!db.Accounts.Any())
    {
        var roleId = db.Roles.First().Role_id;
        db.Accounts.Add(new BusinessObject.Entities.Account
        {
            Account_id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Role_id = roleId,
            Username = "testuser1",
            Password = "testpass1"
        });
        db.Accounts.Add(new BusinessObject.Entities.Account
        {
            Account_id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Role_id = roleId,
            Username = "testuser2",
            Password = "testpass2"
        });

        // Seed Ingredient for tests
        db.Ingredients.Add(new BusinessObject.Entities.Ingredient
        {
            Ingredient_id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Name = "Test Ingredient",
            AveragePrice = 10.0,
            ImageUrl = "http://example.com/image.jpg",
            IsDeleted = false
        });

        // Seed Recipe for tests
        db.Recipes.Add(new BusinessObject.Entities.Recipe
        {
            Recipe_id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Account_id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Recipe_name = "Test Recipe",
            Description = "Test Description",
            Instruction = "Test Instructions",
            CookTime = 30,
            PrepTime = 10,
            Servings = 2,
            Difficulty = "easy",
            IsPublic = true,
            CreatedAt = DateTime.UtcNow
        });

        db.SaveChanges();
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "RAG Chatbot API v1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();