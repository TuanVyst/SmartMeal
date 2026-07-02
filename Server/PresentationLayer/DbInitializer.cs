using System.Text.Json;
using BusinessObject.Entities;
using BusinessObject.Enums;
using DataAccessLayer;
using Microsoft.EntityFrameworkCore;

namespace PresentationLayer;

public static class DbInitializer
{
    // JSON DTOs for deserialization
    private record IngredientTagDto(string Name, string Category);
    private record RecipeTagDto(string Name, string Type);
    private record NutritionalValuesDto(double Calories, double? Protein, double? Carbs, double? Fat,
        double? Fiber, double? Sugar, double? Salt, double? Cholesterol, double? ServingSize, string? ServingUnit);
    private record IngredientDto(string Name, double AveragePrice, string ImageUrl,
        NutritionalValuesDto NutritionalValues, List<string> TagNames);
    private record RecipeIngredientDto(string Name, int Quantity, string UOM);
    private record RecipeDto(string Recipe_name, string Description, string Instruction,
        int CookTime, int PrepTime, int Servings, string Difficulty, bool IsPublic,
        string AccountUsername, List<RecipeIngredientDto> Ingredients, List<string> TagNames);

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    private static string SeedDataPath()
    {
        // Try bin output first, then source folder
        var binPath = Path.Combine(AppContext.BaseDirectory, "SeedData");
        if (Directory.Exists(binPath)) return binPath;
        var srcPath = Path.Combine(Directory.GetCurrentDirectory(), "PresentationLayer", "SeedData");
        if (Directory.Exists(srcPath)) return srcPath;
        return binPath; // fallback
    }

    private static async Task<T[]> LoadJson<T>(string fileName)
    {
        var path = Path.Combine(SeedDataPath(), fileName);
        var json = await File.ReadAllTextAsync(path);
        return JsonSerializer.Deserialize<T[]>(json, JsonOpts) ?? [];
    }

    public static async Task Initialize(AppDbContext context)
    {
        // Ensure migration history records exist for already-created tables.
        await EnsureMigrationHistoryAsync(context);

        // Apply any pending migrations safely
        await context.Database.MigrateAsync();

        // After migrations, ensure Sodium→Salt column renames are applied
        await EnsureSaltColumnsAsync(context);

        // Check for English data and clear the database if found to force a Vietnamese re-seed
        var hasEnglishIngredients = await context.Ingredients.AnyAsync(i => i.Name == "Tomato" || i.Name == "Garlic");
        var hasEnglishTags = await context.IngredientTags.AnyAsync(t => t.Name == "VEGETABLE" || t.Name == "GRAIN");
        if (hasEnglishIngredients || hasEnglishTags)
        {
            context.Allergies.RemoveRange(await context.Allergies.ToListAsync());
            context.NutritionLogs.RemoveRange(await context.NutritionLogs.ToListAsync());
            context.RecipeIngredients.RemoveRange(await context.RecipeIngredients.ToListAsync());
            context.RecipeLabels.RemoveRange(await context.RecipeLabels.ToListAsync());
            context.SavedRecipes.RemoveRange(await context.SavedRecipes.ToListAsync());
            context.Recipes.RemoveRange(await context.Recipes.ToListAsync());
            context.IngredientLabels.RemoveRange(await context.IngredientLabels.ToListAsync());
            context.NutritionalValues.RemoveRange(await context.NutritionalValues.ToListAsync());
            context.Ingredients.RemoveRange(await context.Ingredients.ToListAsync());
            context.IngredientTags.RemoveRange(await context.IngredientTags.ToListAsync());
            context.RecipeTags.RemoveRange(await context.RecipeTags.ToListAsync());
            context.Accounts.RemoveRange(await context.Accounts.ToListAsync());
            await context.SaveChangesAsync();
        }

        // Restore existing admin account to original credentials if it exists
        var existingAdmin = await context.Accounts.FirstOrDefaultAsync(a => a.Username == "admin");
        if (existingAdmin != null)
        {
            existingAdmin.Email = "qdam100@gmail.com";
            existingAdmin.Password = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            context.Accounts.Update(existingAdmin);
            await context.SaveChangesAsync();
        }

        if (await context.Accounts.AnyAsync())
        {
            // On existing DB: upsert new tags + ingredients from JSON that are missing
            await UpsertIngredientTagsFromJsonAsync(context);
            await UpsertRecipeTagsFromJsonAsync(context);
            await UpsertIngredientsFromJsonAsync(context);
            // Re-seed recipes from JSON (clear and re-add)
            await SeedRecipesFromJsonAsync(context);

            // Recalculate existing nutrition logs to sync nutrition values
            await RecalculateNutritionLogsAsync(context);

            return;
        }

        // === Fresh DB: full seed from JSON ===
        await SeedAllFromJsonAsync(context);
    }

    private static async Task SeedAllFromJsonAsync(AppDbContext context)
    {
        // 1. Accounts
        var adminAccount = new Account
        {
            Account_id = Guid.NewGuid(),
            Username = "admin",
            Password = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
            Name = "Admin",
            Email = "qdam100@gmail.com",
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

        // 2. Ingredient Tags
        var itagDtos = await LoadJson<IngredientTagDto>("ingredient_tags.json");
        var itagDict = new Dictionary<string, IngredientTag>();
        foreach (var dto in itagDtos)
        {
            var tag = new IngredientTag { It_id = Guid.NewGuid(), Name = dto.Name, Category = dto.Category };
            itagDict[dto.Name] = tag;
        }
        context.IngredientTags.AddRange(itagDict.Values);
        await context.SaveChangesAsync();

        // 3. Ingredients + NutritionalValues + IngredientLabels
        var ings = await LoadJson<IngredientDto>("ingredients.json");
        var ingDict = new Dictionary<string, Ingredient>();
        foreach (var dto in ings)
        {
            var ing = new Ingredient
            {
                Ingredient_id = Guid.NewGuid(),
                Name = dto.Name,
                AveragePrice = dto.AveragePrice,
                ImageUrl = dto.ImageUrl
            };
            ingDict[dto.Name] = ing;
            context.Ingredients.Add(ing);

            var nv = dto.NutritionalValues;
            context.NutritionalValues.Add(new NutritionalValue
            {
                Nv_id = Guid.NewGuid(),
                Ingredient_id = ing.Ingredient_id,
                Calories = nv.Calories,
                Protein = nv.Protein,
                Carbs = nv.Carbs,
                Fat = nv.Fat,
                Fiber = nv.Fiber,
                Sugar = nv.Sugar,
                Salt = nv.Salt,
                Cholesterol = nv.Cholesterol,
                ServingSize = nv.ServingSize,
                ServingUnit = nv.ServingUnit
            });

            foreach (var tagName in dto.TagNames)
            {
                if (itagDict.TryGetValue(tagName, out var tag))
                {
                    context.IngredientLabels.Add(new IngredientLabel
                    {
                        Id = Guid.NewGuid(),
                        It_id = tag.It_id,
                        Ingredient_id = ing.Ingredient_id
                    });
                }
            }
        }
        await context.SaveChangesAsync();

        // 4. Recipe Tags
        var rtagDtos = await LoadJson<RecipeTagDto>("recipe_tags.json");
        var rtagDict = new Dictionary<string, RecipeTag>();
        foreach (var dto in rtagDtos)
        {
            var tag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = dto.Name, Type = dto.Type };
            rtagDict[dto.Name] = tag;
        }
        context.RecipeTags.AddRange(rtagDict.Values);
        await context.SaveChangesAsync();

        // 5. Recipes
        var accounts = await context.Accounts.ToListAsync();
        var accountDict = accounts.ToDictionary(a => a.Username!);
        await SeedRecipesFromJsonAsync(context);
    }

    private static async Task UpsertIngredientTagsFromJsonAsync(AppDbContext context)
    {
        var tagDtos = await LoadJson<IngredientTagDto>("ingredient_tags.json");
        var existingNames = new HashSet<string>(await context.IngredientTags.Select(t => t.Name).ToListAsync());
        foreach (var dto in tagDtos)
        {
            if (existingNames.Contains(dto.Name)) continue;
            context.IngredientTags.Add(new IngredientTag { It_id = Guid.NewGuid(), Name = dto.Name, Category = dto.Category });
        }
        if (context.ChangeTracker.HasChanges())
            await context.SaveChangesAsync();
    }

    private static async Task UpsertRecipeTagsFromJsonAsync(AppDbContext context)
    {
        var tagDtos = await LoadJson<RecipeTagDto>("recipe_tags.json");
        var existingNames = new HashSet<string>(await context.RecipeTags.Select(t => t.Name).ToListAsync());
        foreach (var dto in tagDtos)
        {
            if (existingNames.Contains(dto.Name)) continue;
            context.RecipeTags.Add(new RecipeTag { Rt_Id = Guid.NewGuid(), Name = dto.Name, Type = dto.Type });
        }
        if (context.ChangeTracker.HasChanges())
            await context.SaveChangesAsync();
    }

    private static async Task UpsertIngredientsFromJsonAsync(AppDbContext context)
    {
        var ings = await LoadJson<IngredientDto>("ingredients.json");
        var existingNames = new HashSet<string>(await context.Ingredients.Select(i => i.Name).ToListAsync());
        var itagNames = await context.IngredientTags.Select(t => t.Name).ToDictionaryAsync(t => t, t => t);

        foreach (var dto in ings)
        {
            if (existingNames.Contains(dto.Name)) continue;

            var ing = new Ingredient
            {
                Ingredient_id = Guid.NewGuid(),
                Name = dto.Name,
                AveragePrice = dto.AveragePrice,
                ImageUrl = dto.ImageUrl
            };
            context.Ingredients.Add(ing);

            var nv = dto.NutritionalValues;
            context.NutritionalValues.Add(new NutritionalValue
            {
                Nv_id = Guid.NewGuid(),
                Ingredient_id = ing.Ingredient_id,
                Calories = nv.Calories,
                Protein = nv.Protein,
                Carbs = nv.Carbs,
                Fat = nv.Fat,
                Fiber = nv.Fiber,
                Sugar = nv.Sugar,
                Salt = nv.Salt,
                Cholesterol = nv.Cholesterol,
                ServingSize = nv.ServingSize,
                ServingUnit = nv.ServingUnit
            });

            foreach (var tagName in dto.TagNames)
            {
                if (itagNames.TryGetValue(tagName, out _))
                {
                    var tag = await context.IngredientTags.FirstAsync(t => t.Name == tagName);
                    context.IngredientLabels.Add(new IngredientLabel
                    {
                        Id = Guid.NewGuid(),
                        It_id = tag.It_id,
                        Ingredient_id = ing.Ingredient_id
                    });
                }
            }
        }
        await context.SaveChangesAsync();
    }

    private static async Task SeedRecipesFromJsonAsync(AppDbContext context)
    {
        var accounts = await context.Accounts.ToListAsync();
        var accountDict = accounts.ToDictionary(a => a.Username!);

        // Clear existing recipes
        var oldRecipes = await context.Recipes.ToListAsync();
        if (oldRecipes.Any())
        {
            var oldIds = oldRecipes.Select(r => r.Recipe_id).ToList();
            context.RecipeIngredients.RemoveRange(
                await context.RecipeIngredients.Where(ri => oldIds.Contains(ri.Recipe_id)).ToListAsync());
            context.RecipeLabels.RemoveRange(
                await context.RecipeLabels.Where(rl => oldIds.Contains(rl.Recipe_Id)).ToListAsync());
            var logs = await context.NutritionLogs.Where(nl => nl.Recipe_id != null && oldIds.Contains(nl.Recipe_id.Value)).ToListAsync();
            foreach (var log in logs) log.Recipe_id = null;
            context.NutritionLogs.UpdateRange(logs);
            context.Recipes.RemoveRange(oldRecipes);
            await context.SaveChangesAsync();
        }

        // Load recipe tags + ingredients
        var rtagDict = await context.RecipeTags.ToDictionaryAsync(t => t.Name, t => t);
        var ingDict = await context.Ingredients.ToDictionaryAsync(i => i.Name, i => i);

        var recipes = await LoadJson<RecipeDto>("recipes.json");
        var seedDate = DateTime.UtcNow;

        foreach (var dto in recipes)
        {
            if (!accountDict.TryGetValue(dto.AccountUsername, out var owner)) continue;

            var recipe = new Recipe
            {
                Recipe_id = Guid.NewGuid(),
                Account_id = owner.Account_id,
                Recipe_name = dto.Recipe_name,
                Description = dto.Description,
                Instruction = dto.Instruction,
                CookTime = dto.CookTime,
                PrepTime = dto.PrepTime,
                Servings = dto.Servings,
                Difficulty = dto.Difficulty,
                IsPublic = dto.IsPublic,
                CreatedAt = seedDate
            };
            context.Recipes.Add(recipe);

            foreach (var riDto in dto.Ingredients)
            {
                if (!ingDict.TryGetValue(riDto.Name, out var ing)) continue;
                context.RecipeIngredients.Add(new RecipeIngredient
                {
                    RI_id = Guid.NewGuid(),
                    Recipe_id = recipe.Recipe_id,
                    Ingredient_id = ing.Ingredient_id,
                    Quantity = riDto.Quantity,
                    UOM = riDto.UOM
                });
            }

            foreach (var tagName in dto.TagNames)
            {
                if (rtagDict.TryGetValue(tagName, out var tag))
                {
                    context.RecipeLabels.Add(new RecipeLabel
                    {
                        Id = Guid.NewGuid(),
                        Rt_Id = tag.Rt_Id,
                        Recipe_Id = recipe.Recipe_id
                    });
                }
            }
        }
        await context.SaveChangesAsync();
        Console.WriteLine($"[DbInitializer] Seeded {recipes.Length} recipes from JSON.");
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
                    IF NOT EXISTS (
                        SELECT 1 FROM pg_catalog.pg_class c
                        JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
                        WHERE n.nspname='public' AND c.relname='__EFMigrationsHistory'
                    ) THEN
                        CREATE TABLE ""__EFMigrationsHistory"" (
                            ""MigrationId"" character varying(150) NOT NULL,
                            ""ProductVersion"" character varying(32) NOT NULL,
                            CONSTRAINT ""PK___EFMigrationsHistory"" PRIMARY KEY (""MigrationId"")
                        );
                    END IF;

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
                            SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260618103559_InitialCreate'
                        ) THEN
                            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                            VALUES ('20260618103559_InitialCreate', '8.0.11');
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260617162458_AddUniqueTagNameIndexes'
                        ) THEN
                            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                            VALUES ('20260617162458_AddUniqueTagNameIndexes', '8.0.11');
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260620140009_InitialCreate'
                        ) THEN
                            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                            VALUES ('20260620140009_InitialCreate', '8.0.11');
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260621120113_AddNutritionalValueFields'
                        ) THEN
                            INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                            VALUES ('20260621120113_AddNutritionalValueFields', '8.0.11');
                        END IF;
                    END IF;

                    -- Đồng bộ các cột dinh dưỡng cho NutritionLog nếu thiếu
                    IF EXISTS (
                        SELECT 1 FROM pg_catalog.pg_class c
                        JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
                        WHERE n.nspname='public' AND c.relname='NutritionLog'
                    ) THEN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalCalories'
                        ) THEN
                            ALTER TABLE ""NutritionLog"" ADD COLUMN ""TotalCalories"" double precision;
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalProtein'
                        ) THEN
                            ALTER TABLE ""NutritionLog"" ADD COLUMN ""TotalProtein"" double precision;
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalCarbs'
                        ) THEN
                            ALTER TABLE ""NutritionLog"" ADD COLUMN ""TotalCarbs"" double precision;
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalFat'
                        ) THEN
                            ALTER TABLE ""NutritionLog"" ADD COLUMN ""TotalFat"" double precision;
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalFiber'
                        ) THEN
                            ALTER TABLE ""NutritionLog"" ADD COLUMN ""TotalFiber"" double precision;
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalSugar'
                        ) THEN
                            ALTER TABLE ""NutritionLog"" ADD COLUMN ""TotalSugar"" double precision;
                        END IF;
                        -- If TotalSalt column already exists (renamed by old raw SQL), fake the RenameSodiumToSalt migration
                        -- so MigrateAsync() won't try to rename again
                        IF EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalSalt'
                        ) AND EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionalValues' AND a.attname = 'Salt'
                        ) AND NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalSodium'
                        ) THEN
                            IF NOT EXISTS (
                                SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260619164255_RenameSodiumToSalt'
                            ) THEN
                                INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                                VALUES ('20260619164255_RenameSodiumToSalt', '8.0.11');
                            END IF;
                            IF NOT EXISTS (
                                SELECT 1 FROM ""__EFMigrationsHistory"" WHERE ""MigrationId"" = '20260618120526_AddDetailedNutritionalValues'
                            ) THEN
                                INSERT INTO ""__EFMigrationsHistory"" (""MigrationId"", ""ProductVersion"")
                                VALUES ('20260618120526_AddDetailedNutritionalValues', '8.0.11');
                            END IF;
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

    private static async Task EnsureSaltColumnsAsync(AppDbContext context)
    {
        try
        {
            await context.Database.ExecuteSqlRawAsync(@"
                DO $$
                BEGIN
                    -- Rename NutritionLog.TotalSodium → TotalSalt (if needed)
                    IF EXISTS (
                        SELECT 1 FROM pg_catalog.pg_attribute a
                        JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                        WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalSodium'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM pg_catalog.pg_attribute a
                        JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                        WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalSalt'
                    ) THEN
                        ALTER TABLE ""NutritionLog"" RENAME COLUMN ""TotalSodium"" TO ""TotalSalt"";
                    END IF;

                    -- Rename NutritionalValues.Sodium → Salt (if needed)
                    IF EXISTS (
                        SELECT 1 FROM pg_catalog.pg_attribute a
                        JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                        WHERE n.nspname = 'public' AND c.relname = 'NutritionalValues' AND a.attname = 'Sodium'
                    ) AND NOT EXISTS (
                        SELECT 1 FROM pg_catalog.pg_attribute a
                        JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                        WHERE n.nspname = 'public' AND c.relname = 'NutritionalValues' AND a.attname = 'Salt'
                    ) THEN
                        ALTER TABLE ""NutritionalValues"" RENAME COLUMN ""Sodium"" TO ""Salt"";
                    END IF;
                END $$;");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbInitializer] Warning: Could not rename salt columns: {ex.Message}");
        }
    }

    private static async Task RecalculateNutritionLogsAsync(AppDbContext context)
    {
        try
        {
            Console.WriteLine("[DbInitializer] Recalculating existing nutrition logs...");
            var logs = await context.NutritionLogs.ToListAsync();
            foreach (var log in logs)
            {
                if (log.Ingredient_id.HasValue)
                {
                    var ingredient = await context.Ingredients
                        .Include(i => i.Nutritional_value)
                        .FirstOrDefaultAsync(i => i.Ingredient_id == log.Ingredient_id.Value);

                    if (ingredient?.Nutritional_value != null)
                    {
                        var multiplier = (log.Quantity ?? 100.0) / (ingredient.Nutritional_value.ServingSize ?? 100.0);
                        if (multiplier <= 0) multiplier = 1.0;

                        log.TotalCalories = ingredient.Nutritional_value.Calories * multiplier;
                        log.TotalProtein = (ingredient.Nutritional_value.Protein ?? 0) * multiplier;
                        log.TotalCarbs = (ingredient.Nutritional_value.Carbs ?? 0) * multiplier;
                        log.TotalFat = (ingredient.Nutritional_value.Fat ?? 0) * multiplier;
                        log.TotalFiber = (ingredient.Nutritional_value.Fiber ?? 0) * multiplier;
                        log.TotalSugar = (ingredient.Nutritional_value.Sugar ?? 0) * multiplier;
                        log.TotalSalt = (ingredient.Nutritional_value.Salt ?? 0) * multiplier;
                        log.TotalCholesterol = (ingredient.Nutritional_value.Cholesterol ?? 0) * multiplier;
                    }
                }
                else if (log.Recipe_id.HasValue)
                {
                    var recipeIngredients = await context.RecipeIngredients
                        .Include(ri => ri.Ingredient)
                        .ThenInclude(i => i.Nutritional_value)
                        .Where(ri => ri.Recipe_id == log.Recipe_id.Value && !ri.IsDeleted)
                        .ToListAsync();
                    
                    var recipe = await context.Recipes.FirstOrDefaultAsync(r => r.Recipe_id == log.Recipe_id.Value);
                    double servings = recipe?.Servings ?? 1.0;
                    if (servings <= 0) servings = 1.0;

                    double totalCal = 0;
                    double totalPro = 0;
                    double totalCarb = 0;
                    double totalFat = 0;
                    double totalFib = 0;
                    double totalSug = 0;
                    double totalSod = 0;
                    double totalChol = 0;

                    foreach (var ri in recipeIngredients)
                    {
                        if (ri.Ingredient?.Nutritional_value != null)
                        {
                            var multiplier = (ri.Quantity) / (ri.Ingredient.Nutritional_value.ServingSize ?? 100.0);
                            if (multiplier <= 0) multiplier = 1.0;

                            totalCal += ri.Ingredient.Nutritional_value.Calories * multiplier;
                            totalPro += (ri.Ingredient.Nutritional_value.Protein ?? 0) * multiplier;
                            totalCarb += (ri.Ingredient.Nutritional_value.Carbs ?? 0) * multiplier;
                            totalFat += (ri.Ingredient.Nutritional_value.Fat ?? 0) * multiplier;
                            totalFib += (ri.Ingredient.Nutritional_value.Fiber ?? 0) * multiplier;
                            totalSug += (ri.Ingredient.Nutritional_value.Sugar ?? 0) * multiplier;
                            totalSod += (ri.Ingredient.Nutritional_value.Salt ?? 0) * multiplier;
                            totalChol += (ri.Ingredient.Nutritional_value.Cholesterol ?? 0) * multiplier;
                        }
                    }

                    totalCal /= servings;
                    totalPro /= servings;
                    totalCarb /= servings;
                    totalFat /= servings;
                    totalFib /= servings;
                    totalSug /= servings;
                    totalSod /= servings;
                    totalChol /= servings;

                    var portion = log.Quantity ?? 1.0;
                    log.TotalCalories = totalCal * portion;
                    log.TotalProtein = totalPro * portion;
                    log.TotalCarbs = totalCarb * portion;
                    log.TotalFat = totalFat * portion;
                    log.TotalFiber = totalFib * portion;
                    log.TotalSugar = totalSug * portion;
                    log.TotalSalt = totalSod * portion;
                    log.TotalCholesterol = totalChol * portion;
                }
            }
            await context.SaveChangesAsync();
            Console.WriteLine($"[DbInitializer] Successfully recalculated {logs.Count} nutrition logs.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbInitializer] Error recalculating nutrition logs: {ex.Message}");
        }
    }
}
