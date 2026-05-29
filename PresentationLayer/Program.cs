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