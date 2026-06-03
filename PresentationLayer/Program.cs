using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
// Use connection string from appsettings.json (ConnectionStrings:DefaultConnection)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found. Please configure it in appsettings.json.");
}

// Register DbContext using configured connection string
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.AddScoped<Repository.Interfaces.IRecipeRepo, Repository.Implements.RecipeRepo>();
builder.Services.AddScoped<Service.Interfaces.IRecipeService, Service.Implements.RecipeService>();

builder.Services.AddScoped<Repository.Interfaces.ICollectionRepo, Repository.Implements.CollectionRepo>();
builder.Services.AddScoped<Service.Interfaces.ICollectionService, Service.Implements.CollectionService>();

builder.Services.AddScoped<Repository.Interfaces.ISavedRecipeRepo, Repository.Implements.SavedRecipeRepo>();
builder.Services.AddScoped<Service.Interfaces.ISavedRecipeService, Service.Implements.SavedRecipeService>();

builder.Services.AddScoped<Repository.Interfaces.IRecipeTagRepo, Repository.Implements.RecipeTagRepo>();
builder.Services.AddScoped<Service.Interfaces.IRecipeTagService, Service.Implements.RecipeTagService>();

builder.Services.AddScoped<Repository.Interfaces.IRecipeLabelRepo, Repository.Implements.RecipeLabelRepo>();
builder.Services.AddScoped<Service.Interfaces.IRecipeLabelService, Service.Implements.RecipeLabelService>();

builder.Services.AddScoped<Repository.Interfaces.IRecipeIngredientRepo, Repository.Implements.RecipeIngredientRepo>();
builder.Services.AddScoped<Service.Interfaces.IRecipeIngredientService, Service.Implements.RecipeIngredientService>();

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