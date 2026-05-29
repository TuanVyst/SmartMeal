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

var app = builder.Build();

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