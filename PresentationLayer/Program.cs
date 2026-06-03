using DataAccessLayer;
using Microsoft.EntityFrameworkCore;
using Service.Interfaces;
using Service.Implements;
using Repository.Interfaces;
using Repository.Implements;

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
builder.Services.AddControllersWithViews()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Register Repositories
builder.Services.AddScoped<IIngredientRepo, IngredientRepo>();
builder.Services.AddScoped<IIngredientLabelRepo, IngredientLabelRepo>();
builder.Services.AddScoped<IIngredientTagRepo, IngredientTagRepo>();
builder.Services.AddScoped<IAffiliateProductRepo, AffiliateProductRepo>();
builder.Services.AddScoped<IPartnerRepo, PartnerRepo>();
builder.Services.AddScoped<IAccountRepo, AccountRepo>();
builder.Services.AddScoped<IAllergyRepo, AllergyRepo>();
builder.Services.AddScoped<ICollectionRepo, CollectionRepo>();
builder.Services.AddScoped<ICommentRepo, CommentRepo>();
builder.Services.AddScoped<IPlanRepo, PlanRepo>();
builder.Services.AddScoped<IPostRepo, PostRepo>();
builder.Services.AddScoped<IRecipeRepo, RecipeRepo>();
builder.Services.AddScoped<IRecipeLabelRepo, RecipeLabelRepo>();
builder.Services.AddScoped<IRecipeTagRepo, RecipeTagRepo>();
builder.Services.AddScoped<IReportRepo, ReportRepo>();
builder.Services.AddScoped<IRoleRepo, RoleRepo>();
builder.Services.AddScoped<ISavedRecipeRepo, SavedRecipeRepo>();
builder.Services.AddScoped<ISubscriptionRepo, SubscriptionRepo>();
builder.Services.AddScoped<IUserInformationRepo, UserInformationRepo>();
builder.Services.AddScoped<IGroceryItemRepo, GroceryItemRepo>();
builder.Services.AddScoped<IGroceryListRepo, GroceryListRepo>();
builder.Services.AddScoped<INutritionalValueRepo, NutritionalValueRepo>();
builder.Services.AddScoped<IPantryRepo, PantryRepo>();
builder.Services.AddScoped<IRatingRepo, RatingRepo>();
builder.Services.AddScoped<IRecipeIngredientRepo, RecipeIngredientRepo>();
// Register Services
builder.Services.AddScoped<IIngredientService, IngredientService>();
builder.Services.AddScoped<IIngredientLabelService, IngredientLabelService>();
builder.Services.AddScoped<IIngredientTagService, IngredientTagService>();
builder.Services.AddScoped<IAffiliateProductService, AffiliateProductService>();
builder.Services.AddScoped<IPartnerService, PartnerService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IAllergyService, AllergyService>();
builder.Services.AddScoped<ICollectionService, CollectionService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IPlanService, PlanService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IRecipeService, RecipeService>();
builder.Services.AddScoped<IRecipeLabelService, RecipeLabelService>();
builder.Services.AddScoped<IRecipeTagService, RecipeTagService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<IRoleService, RoleService>();
builder.Services.AddScoped<ISavedRecipeService, SavedRecipeService>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IUserInformationService, UserInformationService>();
builder.Services.AddScoped<IGroceryItemService, GroceryItemService>();
builder.Services.AddScoped<IGroceryListService, GroceryListService>();
builder.Services.AddScoped<INutritionalValueService, NutritionalValueService>();
builder.Services.AddScoped<IPantryService, PantryService>();
builder.Services.AddScoped<IRatingService, RatingService>();
builder.Services.AddScoped<IRecipeIngredientService, RecipeIngredientService>();
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