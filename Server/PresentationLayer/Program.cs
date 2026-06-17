using DataAccessLayer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PresentationLayer;
using System.Text;



DotNetEnv.Env.TraversePath().Load();

var builder = WebApplication.CreateBuilder(args);
// Use connection string from appsettings.json (ConnectionStrings:DefaultConnection)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrWhiteSpace(connectionString))
{
    throw new InvalidOperationException("Connection string 'DefaultConnection' not found. Please configure it in appsettings.json.");
}

builder.Services.AddMemoryCache();

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
builder.Services.AddSwaggerGen(c =>
{
    // Định nghĩa security scheme cho Swagger (Nút Authorize)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header sử dụng Bearer scheme. \r\n\r\n
                      Nhập 'Bearer' [khoảng trắng] và sau đó dán token của bạn vào.
                      \r\n\r\nVí dụ: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Yêu cầu security scheme này cho tất cả các endpoint
    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// GroceryList
builder.Services.AddScoped<Repository.Interfaces.IGroceryListRepo, Repository.Implements.GroceryListRepo>();
builder.Services.AddScoped<Service.Interfaces.IGroceryListService, Service.Implements.GroceryListService>();

// GroceryItem
builder.Services.AddScoped<Repository.Interfaces.IGroceryItemRepo, Repository.Implements.GroceryItemRepo>();
builder.Services.AddScoped<Service.Interfaces.IGroceryItemService, Service.Implements.GroceryItemService>();


// Allergy
builder.Services.AddScoped<Repository.Interfaces.IAllergyRepo, Repository.Implements.AllergyRepo>();
builder.Services.AddScoped<Service.Interfaces.IAllergyService, Service.Implements.AllergyService>();

// Pantry
builder.Services.AddScoped<Repository.Interfaces.IPantryRepo, Repository.Implements.PantryRepo>();
builder.Services.AddScoped<Service.Interfaces.IPantryService, Service.Implements.PantryService>();

// Ingredient (for cross-repo validation in AllergyService/PantryService)
builder.Services.AddScoped<Repository.Interfaces.IIngredientRepo, Repository.Implements.IngredientRepo>();
builder.Services.AddScoped<Service.Interfaces.IIngredientService, Service.Implements.IngredientService>();
builder.Services.AddScoped<Repository.Interfaces.IIngredientTagRepo, Repository.Implements.IngredientTagRepo>();
builder.Services.AddScoped<Service.Interfaces.IIngredientTagService, Service.Implements.IngredientTagService>();
builder.Services.AddScoped<Repository.Interfaces.IIngredientLabelRepo, Repository.Implements.IngredientLabelRepo>();
builder.Services.AddScoped<Repository.Interfaces.INutritionalValueRepo, Repository.Implements.NutritionalValueRepo>();

// Account
builder.Services.AddScoped<Repository.Interfaces.IAccountRepo, Repository.Implements.AccountRepo>();
builder.Services.AddScoped<Service.Interfaces.IAccountService, Service.Implements.AccountService>();

//Email
builder.Services.AddScoped<Service.Interfaces.IEmailService, Service.Implements.EmailService>();

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

// CORS - allow FE dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DataAccessLayer.AppDbContext>();
    await DbInitializer.Initialize(dbContext);
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

app.UseRouting();
app.UseCors("AllowClient");

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();