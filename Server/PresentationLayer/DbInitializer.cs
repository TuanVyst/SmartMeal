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
            // Update ingredient serving sizes if they are outdated
            var dbOliveOil = await context.Ingredients.Include(i => i.Nutritional_value).FirstOrDefaultAsync(i => i.Name == "Dầu ô-liu");
            if (dbOliveOil?.Nutritional_value != null && dbOliveOil.Nutritional_value.ServingSize != 1)
            {
                dbOliveOil.Nutritional_value.ServingSize = 1;
                context.NutritionalValues.Update(dbOliveOil.Nutritional_value);
            }

            var dbEgg = await context.Ingredients.Include(i => i.Nutritional_value).FirstOrDefaultAsync(i => i.Name == "Trứng");
            if (dbEgg?.Nutritional_value != null && dbEgg.Nutritional_value.ServingSize != 1)
            {
                dbEgg.Nutritional_value.ServingSize = 1;
                context.NutritionalValues.Update(dbEgg.Nutritional_value);
            }

            var dbLemon = await context.Ingredients.Include(i => i.Nutritional_value).FirstOrDefaultAsync(i => i.Name == "Chanh");
            if (dbLemon?.Nutritional_value != null && dbLemon.Nutritional_value.ServingSize != 1)
            {
                dbLemon.Nutritional_value.ServingSize = 1;
                context.NutritionalValues.Update(dbLemon.Nutritional_value);
            }

            var dbSalt = await context.Ingredients.Include(i => i.Nutritional_value).FirstOrDefaultAsync(i => i.Name == "Muối");
            if (dbSalt?.Nutritional_value != null)
            {
                dbSalt.Nutritional_value.ServingSize = 5;
                dbSalt.Nutritional_value.ServingUnit = "g";
                dbSalt.Nutritional_value.Salt = 5;
                context.NutritionalValues.Update(dbSalt.Nutritional_value);
                await context.SaveChangesAsync();
            }

            // Fix all NutritionalValues: old Sodium(mg) values stored as Salt, convert to Salt(g)
            var saltNvId = dbSalt?.Nutritional_value?.Nv_id;
            var allNvs = await context.NutritionalValues.Where(nv => nv.Nv_id != saltNvId).ToListAsync();
            foreach (var nv in allNvs)
            {
                if (nv.Salt.HasValue && nv.Salt.Value >= 0.3)
                {
                    nv.Salt = Math.Round(nv.Salt.Value * 0.00254, 3);
                    context.NutritionalValues.Update(nv);
                }
            }
            await context.SaveChangesAsync();

            // Force seed recipes to ensure up-to-date recipe ingredient quantities and nutrition facts
            await SeedMatchingRecipesAsync(context);

            // Recalculate existing nutrition logs to sync nutrition values
            await RecalculateNutritionLogsAsync(context);

            return;
        }

        // Roles
    
        await context.SaveChangesAsync();

        // Accounts
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

        // Ingredient Tags
        var vegTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Rau củ", Category = "Thực vật" };
        var fruitTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Trái cây", Category = "Thực vật" };
        var meatTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Thịt & Hải sản", Category = "Protein" };
        var spiceTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Gia vị", Category = "NẾm nếm" };
        var dairyTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Sữa & Trứng", Category = "Dairy" };
        var grainTag = new IngredientTag { It_id = Guid.NewGuid(), Name = "Ngũ cốc", Category = "Lương thực" };
        context.IngredientTags.AddRange(vegTag, fruitTag, meatTag, spiceTag, dairyTag, grainTag);
        await context.SaveChangesAsync();

        // Ingredients with NutritionalValues
        var tomato = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Cà chua", AveragePrice = 2.5, ImageUrl = "/images/tomato.jpg" };
        var chickenBreast = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Thịt gà", AveragePrice = 8.0, ImageUrl = "/images/chicken.jpg" };
        var rice = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Gạo", AveragePrice = 3.0, ImageUrl = "/images/rice.jpg" };
        var onion = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Hành tây", AveragePrice = 1.5, ImageUrl = "/images/onion.jpg" };
        var garlic = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Tỏi", AveragePrice = 1.0, ImageUrl = "/images/garlic.jpg" };
        var oliveOil = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Dầu ô-liu", AveragePrice = 6.0, ImageUrl = "/images/oliveoil.jpg" };
        var salt = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Muối", AveragePrice = 0.5, ImageUrl = "/images/salt.jpg" };
        var pepper = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Tiêu đen", AveragePrice = 1.5, ImageUrl = "/images/pepper.jpg" };
        var egg = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Trứng", AveragePrice = 4.0, ImageUrl = "/images/egg.jpg" };
        var milk = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Sữa", AveragePrice = 2.0, ImageUrl = "/images/milk.jpg" };
        var broccoli = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Bông cải xanh", AveragePrice = 3.0, ImageUrl = "/images/broccoli.jpg" };
        var carrot = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Cà rốt", AveragePrice = 1.5, ImageUrl = "/images/carrot.jpg" };
        var pasta = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Mì ý", AveragePrice = 2.0, ImageUrl = "/images/pasta.jpg" };
        var salmon = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Cá hồi", AveragePrice = 12.0, ImageUrl = "/images/salmon.jpg" };
        var lemon = new Ingredient { Ingredient_id = Guid.NewGuid(), Name = "Chanh", AveragePrice = 1.0, ImageUrl = "/images/lemon.jpg" };
        context.Ingredients.AddRange(tomato, chickenBreast, rice, onion, garlic, oliveOil, salt, pepper, egg, milk, broccoli, carrot, pasta, salmon, lemon);
        await context.SaveChangesAsync();

        // NutritionalValues (Salt values in grams: Salt(g) ≈ Sodium(mg) × 0.00254)
        context.NutritionalValues.AddRange(
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = tomato.Ingredient_id, Calories = 18, Protein = 0.9, Carbs = 3.9, Fat = 0.2, Fiber = 1.2, Sugar = 2.6, Salt = 0.01, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = chickenBreast.Ingredient_id, Calories = 165, Protein = 31, Carbs = 0, Fat = 3.6, Fiber = 0, Sugar = 0, Salt = 0.19, Cholesterol = 85, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = rice.Ingredient_id, Calories = 130, Protein = 2.7, Carbs = 28, Fat = 0.3, Fiber = 0.4, Sugar = 0.1, Salt = 0.003, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = onion.Ingredient_id, Calories = 40, Protein = 1.1, Carbs = 9.3, Fat = 0.1, Fiber = 1.7, Sugar = 4.2, Salt = 0.01, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = garlic.Ingredient_id, Calories = 4, Protein = 0.2, Carbs = 1.0, Fat = 0.02, Fiber = 0.1, Sugar = 0.03, Salt = 0.001, Cholesterol = 0, ServingSize = 3, ServingUnit = "clove" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = oliveOil.Ingredient_id, Calories = 119, Protein = 0, Carbs = 0, Fat = 13.5, Fiber = 0, Sugar = 0, Salt = 0.001, Cholesterol = 0, ServingSize = 1, ServingUnit = "tbsp" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = egg.Ingredient_id, Calories = 78, Protein = 6.3, Carbs = 0.6, Fat = 5.3, Fiber = 0, Sugar = 0.6, Salt = 0.16, Cholesterol = 186, ServingSize = 1, ServingUnit = "piece" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = milk.Ingredient_id, Calories = 42, Protein = 3.4, Carbs = 5, Fat = 1, Fiber = 0, Sugar = 5, Salt = 0.11, Cholesterol = 5, ServingSize = 100, ServingUnit = "ml" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = broccoli.Ingredient_id, Calories = 34, Protein = 2.8, Carbs = 6.6, Fat = 0.4, Fiber = 2.6, Sugar = 1.7, Salt = 0.08, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = carrot.Ingredient_id, Calories = 41, Protein = 0.9, Carbs = 9.6, Fat = 0.2, Fiber = 2.8, Sugar = 4.7, Salt = 0.17, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = pasta.Ingredient_id, Calories = 131, Protein = 5, Carbs = 25, Fat = 1.1, Fiber = 1.8, Sugar = 0.8, Salt = 0.02, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = salmon.Ingredient_id, Calories = 208, Protein = 20, Carbs = 0, Fat = 13, Fiber = 0, Sugar = 0, Salt = 0.15, Cholesterol = 55, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = lemon.Ingredient_id, Calories = 17, Protein = 0.6, Carbs = 5.4, Fat = 0.2, Fiber = 1.6, Sugar = 1.5, Salt = 0.003, Cholesterol = 0, ServingSize = 1, ServingUnit = "piece" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = salt.Ingredient_id, Calories = 0, Protein = 0, Carbs = 0, Fat = 0, Fiber = 0, Sugar = 0, Salt = 5, Cholesterol = 0, ServingSize = 5, ServingUnit = "g" }
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
        var breakfastTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Bữa sáng", Type = "meal" };
        var lunchTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Bữa trưa", Type = "meal" };
        var dinnerTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Bữa tối", Type = "meal" };
        var dessertTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Tráng miệng", Type = "meal" };
        var snackTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Nhẹ", Type = "meal" };
        var healthyTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Lành mạnh", Type = "diet" };
        var quickTag = new RecipeTag { Rt_Id = Guid.NewGuid(), Name = "Nhanh", Type = "prep" };
        context.RecipeTags.AddRange(breakfastTag, lunchTag, dinnerTag, dessertTag, snackTag, healthyTag, quickTag);
        await context.SaveChangesAsync();

        await SeedMatchingRecipesAsync(context);
    }

    private static async Task SeedMatchingRecipesAsync(AppDbContext context)
    {
        // 1. Fetch accounts
        var adminAccount = await context.Accounts.FirstOrDefaultAsync(a => a.Username == "admin");
        var testUser = await context.Accounts.FirstOrDefaultAsync(a => a.Username == "testuser");
        if (adminAccount == null || testUser == null) return;

        // 2. Clear existing recipes if any
        var oldRecipes = await context.Recipes.ToListAsync();
        if (oldRecipes.Any())
        {
            var oldRecipeIds = oldRecipes.Select(r => r.Recipe_id).ToList();
            
            var oldRecipeIngs = await context.RecipeIngredients.Where(ri => oldRecipeIds.Contains(ri.Recipe_id)).ToListAsync();
            context.RecipeIngredients.RemoveRange(oldRecipeIngs);

            var oldRecipeLabels = await context.RecipeLabels.Where(rl => oldRecipeIds.Contains(rl.Recipe_Id)).ToListAsync();
            context.RecipeLabels.RemoveRange(oldRecipeLabels);

            var nutritionLogs = await context.NutritionLogs.Where(nl => nl.Recipe_id != null && oldRecipeIds.Contains(nl.Recipe_id.Value)).ToListAsync();
            foreach (var log in nutritionLogs)
            {
                log.Recipe_id = null;
            }
            context.NutritionLogs.UpdateRange(nutritionLogs);

            context.Recipes.RemoveRange(oldRecipes);
            await context.SaveChangesAsync();
        }

        // 3. Fetch tags
        var lunchTag = await context.RecipeTags.FirstOrDefaultAsync(t => t.Name == "Bữa trưa");
        var dinnerTag = await context.RecipeTags.FirstOrDefaultAsync(t => t.Name == "Bữa tối");
        var healthyTag = await context.RecipeTags.FirstOrDefaultAsync(t => t.Name == "Lành mạnh");
        var quickTag = await context.RecipeTags.FirstOrDefaultAsync(t => t.Name == "Nhanh");

        // 4. Fetch ingredients
        var chickenBreast = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Thịt gà");
        var garlic = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Tỏi");
        var onion = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Hành tây");
        var broccoli = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Bông cải xanh");
        var carrot = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Cà rốt");
        var rice = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Gạo");
        var egg = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Trứng");
        var salmon = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Cá hồi");
        var lemon = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Chanh");
        var oliveOil = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Dầu ô-liu");
        var pasta = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Mì ý");
        var tomato = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Cà chua");
        var salt = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Muối");
        var pepper = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Tiêu đen");

        // 5. Seed Recipe 1: Gà xào rau củ
        var recipe1 = new Recipe
        {
            Recipe_id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Account_id = adminAccount.Account_id,
            Recipe_name = "Gà Xào Rau Củ",
            Description = "Món ăn nhanh chóng và bổ dưỡng với thịt gà mềm mại và rau củ tươi giòn, phong cách ẩm thực châu Á.",
            Instruction = "1. Thái gà thành lát mỏng và sơ chế rau củ.\n2. Đun nóng dầu trong chảo hoặc wok ở lửa vừa-mạnh.\n3. Cho gà vào rán đến khi vàng, sau đó vớt ra.\n4. Phi thơm tỏi, hành, bông cải và cà rốt cho đến khi chín mềm.\n5. Cho gà vào lại, nêm gia vị rồi xào đều.\n6. Dọn nóng kèm cơm trắng.",
            CookTime = 20,
            PrepTime = 5,
            Servings = 2,
            Difficulty = "easy",
            IsPublic = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Recipes.Add(recipe1);

        // Recipe 1 Ingredients
        if (chickenBreast != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = chickenBreast.Ingredient_id, Quantity = 200, UOM = "g" });
        if (garlic != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = garlic.Ingredient_id, Quantity = 3, UOM = "clove" });
        if (onion != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = onion.Ingredient_id, Quantity = 100, UOM = "g" });
        if (broccoli != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = broccoli.Ingredient_id, Quantity = 150, UOM = "g" });
        if (carrot != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = carrot.Ingredient_id, Quantity = 100, UOM = "g" });
        if (rice != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = rice.Ingredient_id, Quantity = 200, UOM = "g" });
        if (oliveOil != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = oliveOil.Ingredient_id, Quantity = 1, UOM = "tbsp" });
        if (salt != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 5, UOM = "g" });
        if (pepper != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = pepper.Ingredient_id, Quantity = 1, UOM = "tsp" });

        // Recipe 1 Labels
        if (lunchTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = lunchTag.Rt_Id, Recipe_Id = recipe1.Recipe_id });
        if (dinnerTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = dinnerTag.Rt_Id, Recipe_Id = recipe1.Recipe_id });
        if (healthyTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = healthyTag.Rt_Id, Recipe_Id = recipe1.Recipe_id });

        // 6. Seed Recipe 2: Cơm chiên trứng
        var recipe2 = new Recipe
        {
            Recipe_id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Account_id = adminAccount.Account_id,
            Recipe_name = "Cơm Chiên Trứng",
            Description = "Món cơm chiên đơn giản mà thơm ngon với trứng bác và rau củ.",
            Instruction = "1. Đun nóng dầu trong chảo hoặc wok.\n2. Đập trứng vào chảo, bác đến khi chín rồi đẩy sang một bên.\n3. Phi thơm hành và tỏi ở bên còn lại cho đến khi mềm.\n4. Cho cơm vào, nước tương và đảo đều.\n5. Trộn đều với trứng và đảo cho nhiệt đều khắp.\n6. Dọn ngay ăn nóng là ngon nhất.",
            CookTime = 10,
            PrepTime = 5,
            Servings = 2,
            Difficulty = "easy",
            IsPublic = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Recipes.Add(recipe2);

        // Recipe 2 Ingredients
        if (egg != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = egg.Ingredient_id, Quantity = 2, UOM = "piece" });
        if (rice != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = rice.Ingredient_id, Quantity = 300, UOM = "g" });
        if (onion != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = onion.Ingredient_id, Quantity = 100, UOM = "g" });
        if (garlic != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = garlic.Ingredient_id, Quantity = 2, UOM = "clove" });
        if (oliveOil != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = oliveOil.Ingredient_id, Quantity = 1, UOM = "tbsp" });
        if (salt != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 5, UOM = "g" });

        // Recipe 2 Labels
        if (lunchTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = lunchTag.Rt_Id, Recipe_Id = recipe2.Recipe_id });
        if (quickTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = quickTag.Rt_Id, Recipe_Id = recipe2.Recipe_id });

        // 7. Seed Recipe 3: Cá hồi sốt bơ tỏi
        var recipe3 = new Recipe
        {
            Recipe_id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Account_id = adminAccount.Account_id,
            Recipe_name = "Cá Hồi Sốt Bơ Tỏi",
            Description = "Cá hồi chiên ăn với sốt bơ tỏi thơm lừng và chanh tươi mát.",
            Instruction = "1. Ướp cá hồi với muối và tiêu.\n2. Đun nóng dầu ô-liu trong chảo ở lửa vừa-mạnh.\n3. Chiên cá mặt da trước 4 phút.\n4. Lật mặt, cho bơ, tỏi và nước cốt chanh vào.\n5. Chiên thêm 3 phút, liên tục rưới sốt lên cá.\n6. Dọn kèm rau củ hấp.",
            CookTime = 10,
            PrepTime = 5,
            Servings = 2,
            Difficulty = "medium",
            IsPublic = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Recipes.Add(recipe3);

        // Recipe 3 Ingredients
        if (salmon != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = salmon.Ingredient_id, Quantity = 300, UOM = "g" });
        if (garlic != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = garlic.Ingredient_id, Quantity = 3, UOM = "clove" });
        if (lemon != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = lemon.Ingredient_id, Quantity = 1, UOM = "piece" });
        if (oliveOil != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = oliveOil.Ingredient_id, Quantity = 2, UOM = "tbsp" });
        if (onion != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = onion.Ingredient_id, Quantity = 100, UOM = "g" });
        if (salt != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 5, UOM = "g" });
        if (pepper != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = pepper.Ingredient_id, Quantity = 1, UOM = "tsp" });

        // Recipe 3 Labels
        if (dinnerTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = dinnerTag.Rt_Id, Recipe_Id = recipe3.Recipe_id });
        if (healthyTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = healthyTag.Rt_Id, Recipe_Id = recipe3.Recipe_id });
        if (quickTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = quickTag.Rt_Id, Recipe_Id = recipe3.Recipe_id });

        // 8. Seed Recipe 4: Mì ý sốt cà chua
        var recipe4 = new Recipe
        {
            Recipe_id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Account_id = testUser.Account_id,
            Recipe_name = "Mì Ý Sốt Cà Chua",
            Description = "Mì ý nấu đơn giản với sốt cà chua tươi và tỏi.",
            Instruction = "1. Luộc mì trong nước sôi có muối cho đến khi chín vừa.\n2. Phi thơm tỏi và hành trong dầu ô-liu.\n3. Cho cà chua thái hạt lựu vào xào cho đến khi mềm.\n4. Nêm muối tiêu.\n5. Trộn mì với sốt.\n6. Dọn nóng, có thể rắc phô mai nếu thích.",
            CookTime = 15,
            PrepTime = 5,
            Servings = 3,
            Difficulty = "easy",
            IsPublic = true,
            CreatedAt = DateTime.UtcNow
        };
        context.Recipes.Add(recipe4);

        // Recipe 4 Ingredients
        if (pasta != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe4.Recipe_id, Ingredient_id = pasta.Ingredient_id, Quantity = 300, UOM = "g" });
        if (tomato != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe4.Recipe_id, Ingredient_id = tomato.Ingredient_id, Quantity = 300, UOM = "g" });
        if (garlic != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe4.Recipe_id, Ingredient_id = garlic.Ingredient_id, Quantity = 2, UOM = "clove" });
        if (oliveOil != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe4.Recipe_id, Ingredient_id = oliveOil.Ingredient_id, Quantity = 2, UOM = "tbsp" });
        if (onion != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe4.Recipe_id, Ingredient_id = onion.Ingredient_id, Quantity = 100, UOM = "g" });
        if (salt != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe4.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 5, UOM = "g" });
        if (pepper != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe4.Recipe_id, Ingredient_id = pepper.Ingredient_id, Quantity = 1, UOM = "tsp" });

        // Recipe 4 Labels
        if (lunchTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = lunchTag.Rt_Id, Recipe_Id = recipe4.Recipe_id });
        if (dinnerTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = dinnerTag.Rt_Id, Recipe_Id = recipe4.Recipe_id });
        if (quickTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = quickTag.Rt_Id, Recipe_Id = recipe4.Recipe_id });

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
