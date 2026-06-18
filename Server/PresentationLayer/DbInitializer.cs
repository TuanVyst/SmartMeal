using BusinessObject.Entities;
using BusinessObject.Enums;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

namespace PresentationLayer;

public static class DbInitializer
{
    public static async Task Initialize(AppDbContext context)
    {
        // Ensure migration history records exist for already-created tables.
        await EnsureMigrationHistoryAsync(context);

        // Apply any pending migrations safely
        await context.Database.MigrateAsync();

        // Restore existing admin account to original credentials if it exists
        var existingAdmin = await context.Accounts.FirstOrDefaultAsync(a => a.Username == "admin");
        if (existingAdmin != null)
        {
            existingAdmin.Email = "admin@smartmeal.com";
            existingAdmin.Password = BCrypt.Net.BCrypt.HashPassword("admin123");
            context.Accounts.Update(existingAdmin);
            await context.SaveChangesAsync();
        }

        if (await context.Accounts.AnyAsync()) return;

        // Roles
    
        await context.SaveChangesAsync();

        // Accounts
        var adminAccount = new Account
        {
            Account_id = Guid.NewGuid(),
            Username = "admin",
            Password = BCrypt.Net.BCrypt.HashPassword("admin123"),
            Name = "Admin",
            Email = "admin@smartmeal.com",
            Phone = "0123456789",
            Address = "SmartMeal HQ",
            Role = RoleEnum.Admin,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };


        var testUser = new Account
        {
            Account_id = Guid.NewGuid(),
            Username = "testuser",
            Password = BCrypt.Net.BCrypt.HashPassword("test123"),
            Name = "Test User",
            Email = "test@smartmeal.com",
            Phone = "0987654321",
            Address = "123 Test Street",
            Role = RoleEnum.User,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };


        context.Accounts.AddRange(adminAccount, testUser);
        await context.SaveChangesAsync();

        // Ingredient Tags
        var vegTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Vegetable", Category = "Produce" };
        var fruitTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Fruit", Category = "Produce" };
        var meatTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Meat", Category = "Protein" };
        var spiceTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Spice", Category = "Seasoning" };
        var dairyTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Dairy", Category = "Dairy" };
        var grainTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Grain", Category = "Staple" };
        context.IngredientTags.AddRange(vegTag, fruitTag, meatTag, spiceTag, dairyTag, grainTag);
        await context.SaveChangesAsync();

        // Ingredients with NutritionalValues
        var tomato = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Tomato", AveragePrice = 2.5, ImageUrl = "/images/tomato.jpg" };
        var chickenBreast = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Chicken Breast", AveragePrice = 8.0, ImageUrl = "/images/chicken.jpg" };
        var rice = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Rice", AveragePrice = 3.0, ImageUrl = "/images/rice.jpg" };
        var onion = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Onion", AveragePrice = 1.5, ImageUrl = "/images/onion.jpg" };
        var garlic = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Garlic", AveragePrice = 1.0, ImageUrl = "/images/garlic.jpg" };
        var oliveOil = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Olive Oil", AveragePrice = 6.0, ImageUrl = "/images/oliveoil.jpg" };
        var salt = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Salt", AveragePrice = 0.5, ImageUrl = "/images/salt.jpg" };
        var pepper = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Black Pepper", AveragePrice = 1.5, ImageUrl = "/images/pepper.jpg" };
        var egg = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Egg", AveragePrice = 4.0, ImageUrl = "/images/egg.jpg" };
        var milk = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Milk", AveragePrice = 2.0, ImageUrl = "/images/milk.jpg" };
        var broccoli = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Broccoli", AveragePrice = 3.0, ImageUrl = "/images/broccoli.jpg" };
        var carrot = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Carrot", AveragePrice = 1.5, ImageUrl = "/images/carrot.jpg" };
        var pasta = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Pasta", AveragePrice = 2.0, ImageUrl = "/images/pasta.jpg" };
        var salmon = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Salmon", AveragePrice = 12.0, ImageUrl = "/images/salmon.jpg" };
        var lemon = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Lemon", AveragePrice = 1.0, ImageUrl = "/images/lemon.jpg" };
        context.Ingredients.AddRange(tomato, chickenBreast, rice, onion, garlic, oliveOil, salt, pepper, egg, milk, broccoli, carrot, pasta, salmon, lemon);
        await context.SaveChangesAsync();

        // NutritionalValues
        context.NutritionalValues.AddRange(
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = tomato.Ingredient_id, Calories = 18 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = chickenBreast.Ingredient_id, Calories = 165 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = rice.Ingredient_id, Calories = 130 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = onion.Ingredient_id, Calories = 40 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = garlic.Ingredient_id, Calories = 4 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = oliveOil.Ingredient_id, Calories = 119 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = egg.Ingredient_id, Calories = 78 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = milk.Ingredient_id, Calories = 42 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = broccoli.Ingredient_id, Calories = 34 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = carrot.Ingredient_id, Calories = 41 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = pasta.Ingredient_id, Calories = 131 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = salmon.Ingredient_id, Calories = 208 },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = lemon.Ingredient_id, Calories = 17 }
        );
        await context.SaveChangesAsync();

        // IngredientLabels
        context.IngredientLabels.AddRange(
            new IngredientLabel { Id = Guid.NewGuid(), It_id = vegTag.It_id, Ingredient_id = tomato.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = vegTag.It_id, Ingredient_id = onion.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = vegTag.It_id, Ingredient_id = garlic.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = vegTag.It_id, Ingredient_id = broccoli.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = vegTag.It_id, Ingredient_id = carrot.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = meatTag.It_id, Ingredient_id = chickenBreast.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = meatTag.It_id, Ingredient_id = salmon.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = dairyTag.It_id, Ingredient_id = egg.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = dairyTag.It_id, Ingredient_id = milk.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = grainTag.It_id, Ingredient_id = rice.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = grainTag.It_id, Ingredient_id = pasta.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = spiceTag.It_id, Ingredient_id = salt.Ingredient_id },
            new IngredientLabel { Id = Guid.NewGuid(), It_id = spiceTag.It_id, Ingredient_id = pepper.Ingredient_id }
        );
        await context.SaveChangesAsync();

        // Recipe Tags
        var breakfastTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Breakfast", Type = "meal" };
        var lunchTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Lunch", Type = "meal" };
        var dinnerTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Dinner", Type = "meal" };
        var dessertTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Dessert", Type = "meal" };
        var snackTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Snack", Type = "meal" };
        var healthyTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Healthy", Type = "diet" };
        var quickTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Quick", Type = "prep" };
        context.RecipeTags.AddRange(breakfastTag, lunchTag, dinnerTag, dessertTag, snackTag, healthyTag, quickTag);
        await context.SaveChangesAsync();

        // Recipe 1: Chicken Rice Bowl
        var recipe1 = new Recipe
        {
            Recipe_id = Guid.NewGuid(),
            Account_id = adminAccount.Account_id,
            Recipe_name = "Chicken Rice Bowl",
            Description = "A healthy and delicious chicken rice bowl with vegetables.",
            Instruction = "1. Cook rice according to package instructions.\n2. Season chicken breast with salt and pepper.\n3. Pan-fry chicken in olive oil until golden and cooked through.\n4. Sauté broccoli and carrot in the same pan.\n5. Slice chicken and serve over rice with vegetables.",
            CookTime = 25,
            PrepTime = 10,
            Servings = 2,
            Difficulty = "easy",
            IsPublic = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Recipes.Add(recipe1);
        await context.SaveChangesAsync();

        // Recipe 1 Ingredients
        context.RecipeIngredients.AddRange(
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = chickenBreast.Ingredient_id, Quantity = 2, UOM = "piece" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = rice.Ingredient_id, Quantity = 200, UOM = "g" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = broccoli.Ingredient_id, Quantity = 100, UOM = "g" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = carrot.Ingredient_id, Quantity = 1, UOM = "piece" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = oliveOil.Ingredient_id, Quantity = 1, UOM = "tbsp" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 1, UOM = "tsp" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = pepper.Ingredient_id, Quantity = 1, UOM = "tsp" }
        );
        await context.SaveChangesAsync();

        // Recipe 1 Labels
        context.RecipeLabels.AddRange(
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = lunchTag.Rt_Id, Recipe_Id = recipe1.Recipe_id },
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = dinnerTag.Rt_Id, Recipe_Id = recipe1.Recipe_id },
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = healthyTag.Rt_Id, Recipe_Id = recipe1.Recipe_id }
        );
        await context.SaveChangesAsync();

        // Recipe 2: Garlic Butter Salmon
        var recipe2 = new Recipe
        {
            Recipe_id = Guid.NewGuid(),
            Account_id = adminAccount.Account_id,
            Recipe_name = "Garlic Butter Salmon",
            Description = "Pan-seared salmon with garlic butter sauce and lemon.",
            Instruction = "1. Season salmon with salt and pepper.\n2. Heat olive oil in a pan over medium-high heat.\n3. Cook salmon skin-side down for 4 minutes.\n4. Flip and add butter, garlic, and lemon juice.\n5. Cook for another 3 minutes, basting with the butter sauce.\n6. Serve with steamed vegetables.",
            CookTime = 15,
            PrepTime = 5,
            Servings = 2,
            Difficulty = "medium",
            IsPublic = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Recipes.Add(recipe2);
        await context.SaveChangesAsync();

        // Recipe 2 Ingredients
        context.RecipeIngredients.AddRange(
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = salmon.Ingredient_id, Quantity = 2, UOM = "piece" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = garlic.Ingredient_id, Quantity = 3, UOM = "clove" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = lemon.Ingredient_id, Quantity = 1, UOM = "piece" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = oliveOil.Ingredient_id, Quantity = 2, UOM = "tbsp" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 1, UOM = "tsp" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = pepper.Ingredient_id, Quantity = 1, UOM = "tsp" }
        );
        await context.SaveChangesAsync();

        // Recipe 2 Labels
        context.RecipeLabels.AddRange(
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = dinnerTag.Rt_Id, Recipe_Id = recipe2.Recipe_id },
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = healthyTag.Rt_Id, Recipe_Id = recipe2.Recipe_id },
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = quickTag.Rt_Id, Recipe_Id = recipe2.Recipe_id }
        );
        await context.SaveChangesAsync();

        // Recipe 3: Tomato Pasta
        var recipe3 = new Recipe
        {
            Recipe_id = Guid.NewGuid(),
            Account_id = testUser.Account_id,
            Recipe_name = "Simple Tomato Pasta",
            Description = "Easy pasta with fresh tomato garlic sauce.",
            Instruction = "1. Cook pasta in salted boiling water until al dente.\n2. In a pan, sauté garlic in olive oil.\n3. Add diced tomatoes and cook until softened.\n4. Season with salt and pepper.\n5. Toss cooked pasta with the sauce.\n6. Serve hot with grated cheese if desired.",
            CookTime = 20,
            PrepTime = 5,
            Servings = 3,
            Difficulty = "easy",
            IsPublic = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Recipes.Add(recipe3);
        await context.SaveChangesAsync();

        // Recipe 3 Ingredients
        context.RecipeIngredients.AddRange(
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = pasta.Ingredient_id, Quantity = 300, UOM = "g" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = tomato.Ingredient_id, Quantity = 3, UOM = "piece" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = garlic.Ingredient_id, Quantity = 2, UOM = "clove" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = oliveOil.Ingredient_id, Quantity = 2, UOM = "tbsp" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = onion.Ingredient_id, Quantity = 1, UOM = "piece" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 1, UOM = "tsp" },
            new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = pepper.Ingredient_id, Quantity = 1, UOM = "tsp" }
        );
        await context.SaveChangesAsync();

        // Recipe 3 Labels
        context.RecipeLabels.AddRange(
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = lunchTag.Rt_Id, Recipe_Id = recipe3.Recipe_id },
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = dinnerTag.Rt_Id, Recipe_Id = recipe3.Recipe_id },
            new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = quickTag.Rt_Id, Recipe_Id = recipe3.Recipe_id }
        );
        await context.SaveChangesAsync();
    }

    /// <summary>
    /// Ensures the __EFMigrationsHistory table has records matching already-applied migrations.
    /// Uses PL/pgSQL DO block for atomic idempotent operation.
    /// </summary>
    private static async Task EnsureMigrationHistoryAsync(AppDbContext context)
    {
        try
        {
            var rows = await context.Database.ExecuteSqlRawAsync(@"
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM pg_catalog.pg_class c
                        JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
                        WHERE n.nspname='public' AND c.relname='Account'
                    ) THEN
                        IF NOT EXISTS (
                            SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260617072313_InitialCreate'
                        ) THEN
                            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                            VALUES ('20260617072313_InitialCreate', '8.0.11');
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260617162458_AddUniqueTagNameIndexes'
                        ) THEN
                            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                            VALUES ('20260617162458_AddUniqueTagNameIndexes', '8.0.11');
                        END IF;
                    END IF;
                END $$;");

            // Check if records were actually inserted
            var count = await context.Database
                .SqlQueryRaw<long>(@"SELECT CAST(COUNT(*) AS bigint) AS ""Value"" FROM ""__EFMigrationsHistory""")
                .FirstOrDefaultAsync();
            Console.WriteLine($"[DbInitializer] Migration history check: {count} record(s) found.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbInitializer] Warning: Could not verify migration history: {ex.Message}");
        }
    }
}
