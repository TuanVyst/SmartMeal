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

        if (await context.Accounts.AnyAsync())
        {
            // Update ingredient serving sizes if they are outdated
            var dbOliveOil = await context.Ingredients.Include(i => i.Nutritional_value).FirstOrDefaultAsync(i => i.Name == "Olive Oil");
            if (dbOliveOil?.Nutritional_value != null && dbOliveOil.Nutritional_value.ServingSize != 1)
            {
                dbOliveOil.Nutritional_value.ServingSize = 1;
                context.NutritionalValues.Update(dbOliveOil.Nutritional_value);
            }

            var dbEgg = await context.Ingredients.Include(i => i.Nutritional_value).FirstOrDefaultAsync(i => i.Name == "Egg");
            if (dbEgg?.Nutritional_value != null && dbEgg.Nutritional_value.ServingSize != 1)
            {
                dbEgg.Nutritional_value.ServingSize = 1;
                context.NutritionalValues.Update(dbEgg.Nutritional_value);
            }

            var dbLemon = await context.Ingredients.Include(i => i.Nutritional_value).FirstOrDefaultAsync(i => i.Name == "Lemon");
            if (dbLemon?.Nutritional_value != null && dbLemon.Nutritional_value.ServingSize != 1)
            {
                dbLemon.Nutritional_value.ServingSize = 1;
                context.NutritionalValues.Update(dbLemon.Nutritional_value);
            }
            await context.SaveChangesAsync();

            var mockRecipeId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var hasCorrectQuantities = await context.RecipeIngredients.AnyAsync(ri => ri.Recipe_id == mockRecipeId && ri.Ingredient.Name == "Onion" && ri.Quantity == 100);
            if (!hasCorrectQuantities)
            {
                await SeedMatchingRecipesAsync(context);
            }

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
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = tomato.Ingredient_id, Calories = 18, Protein = 0.9, Carbs = 3.9, Fat = 0.2, Fiber = 1.2, Sugar = 2.6, Sodium = 5, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = chickenBreast.Ingredient_id, Calories = 165, Protein = 31, Carbs = 0, Fat = 3.6, Fiber = 0, Sugar = 0, Sodium = 74, Cholesterol = 85, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = rice.Ingredient_id, Calories = 130, Protein = 2.7, Carbs = 28, Fat = 0.3, Fiber = 0.4, Sugar = 0.1, Sodium = 1, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = onion.Ingredient_id, Calories = 40, Protein = 1.1, Carbs = 9.3, Fat = 0.1, Fiber = 1.7, Sugar = 4.2, Sodium = 4, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = garlic.Ingredient_id, Calories = 4, Protein = 0.2, Carbs = 1.0, Fat = 0.02, Fiber = 0.1, Sugar = 0.03, Sodium = 0.5, Cholesterol = 0, ServingSize = 3, ServingUnit = "clove" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = oliveOil.Ingredient_id, Calories = 119, Protein = 0, Carbs = 0, Fat = 13.5, Fiber = 0, Sugar = 0, Sodium = 0.3, Cholesterol = 0, ServingSize = 1, ServingUnit = "tbsp" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = egg.Ingredient_id, Calories = 78, Protein = 6.3, Carbs = 0.6, Fat = 5.3, Fiber = 0, Sugar = 0.6, Sodium = 62, Cholesterol = 186, ServingSize = 1, ServingUnit = "piece" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = milk.Ingredient_id, Calories = 42, Protein = 3.4, Carbs = 5, Fat = 1, Fiber = 0, Sugar = 5, Sodium = 44, Cholesterol = 5, ServingSize = 100, ServingUnit = "ml" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = broccoli.Ingredient_id, Calories = 34, Protein = 2.8, Carbs = 6.6, Fat = 0.4, Fiber = 2.6, Sugar = 1.7, Sodium = 33, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = carrot.Ingredient_id, Calories = 41, Protein = 0.9, Carbs = 9.6, Fat = 0.2, Fiber = 2.8, Sugar = 4.7, Sodium = 69, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = pasta.Ingredient_id, Calories = 131, Protein = 5, Carbs = 25, Fat = 1.1, Fiber = 1.8, Sugar = 0.8, Sodium = 6, Cholesterol = 0, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = salmon.Ingredient_id, Calories = 208, Protein = 20, Carbs = 0, Fat = 13, Fiber = 0, Sugar = 0, Sodium = 59, Cholesterol = 55, ServingSize = 100, ServingUnit = "g" },
            new NutritionalValue { Nv_id = Guid.NewGuid(), Ingredient_id = lemon.Ingredient_id, Calories = 17, Protein = 0.6, Carbs = 5.4, Fat = 0.2, Fiber = 1.6, Sugar = 1.5, Sodium = 1, Cholesterol = 0, ServingSize = 1, ServingUnit = "piece" }
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
        var lunchTag = await context.RecipeTags.FirstOrDefaultAsync(t => t.Name == "Lunch");
        var dinnerTag = await context.RecipeTags.FirstOrDefaultAsync(t => t.Name == "Dinner");
        var healthyTag = await context.RecipeTags.FirstOrDefaultAsync(t => t.Name == "Healthy");
        var quickTag = await context.RecipeTags.FirstOrDefaultAsync(t => t.Name == "Quick");

        // 4. Fetch ingredients
        var chickenBreast = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Chicken Breast");
        var garlic = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Garlic");
        var onion = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Onion");
        var broccoli = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Broccoli");
        var carrot = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Carrot");
        var rice = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Rice");
        var egg = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Egg");
        var salmon = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Salmon");
        var lemon = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Lemon");
        var oliveOil = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Olive Oil");
        var pasta = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Pasta");
        var tomato = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Tomato");
        var salt = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Salt");
        var pepper = await context.Ingredients.FirstOrDefaultAsync(i => i.Name == "Black Pepper");

        // 5. Seed Recipe 1: Classic Chicken Stir Fry
        var recipe1 = new Recipe
        {
            Recipe_id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Account_id = adminAccount.Account_id,
            Recipe_name = "Classic Chicken Stir Fry",
            Description = "A quick and delicious Asian-inspired dish with tender chicken and crisp vegetables.",
            Instruction = "1. Slice the chicken into thin strips and chop the vegetables.\n2. Heat oil in a wok or large frying pan over medium-high heat.\n3. Cook the chicken until browned, then remove from the pan.\n4. Stir-fry the garlic, onion, broccoli, and carrots until tender-crisp.\n5. Return the chicken to the pan, add soy sauce, and toss everything together.\n6. Serve hot over a bed of steamed rice.",
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
        if (salt != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 1, UOM = "tsp" });
        if (pepper != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe1.Recipe_id, Ingredient_id = pepper.Ingredient_id, Quantity = 1, UOM = "tsp" });

        // Recipe 1 Labels
        if (lunchTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = lunchTag.Rt_Id, Recipe_Id = recipe1.Recipe_id });
        if (dinnerTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = dinnerTag.Rt_Id, Recipe_Id = recipe1.Recipe_id });
        if (healthyTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = healthyTag.Rt_Id, Recipe_Id = recipe1.Recipe_id });

        // 6. Seed Recipe 2: Egg Fried Rice
        var recipe2 = new Recipe
        {
            Recipe_id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Account_id = adminAccount.Account_id,
            Recipe_name = "Egg Fried Rice",
            Description = "Simple yet satisfying fried rice with scrambled eggs and vegetables.",
            Instruction = "1. Heat a splash of oil in a large pan or wok.\n2. Scramble the eggs and push them to one side of the pan.\n3. Add onions and garlic to the empty side and cook until softened.\n4. Add the cooked rice and soy sauce, stirring constantly to combine.\n5. Toss with the scrambled eggs until everything is heated through.\n6. Garnish with green onions if desired and serve immediately.",
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
        if (salt != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe2.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 1, UOM = "tsp" });

        // Recipe 2 Labels
        if (lunchTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = lunchTag.Rt_Id, Recipe_Id = recipe2.Recipe_id });
        if (quickTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = quickTag.Rt_Id, Recipe_Id = recipe2.Recipe_id });

        // 7. Seed Recipe 3: Garlic Butter Salmon
        var recipe3 = new Recipe
        {
            Recipe_id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            Account_id = adminAccount.Account_id,
            Recipe_name = "Garlic Butter Salmon",
            Description = "Pan-seared salmon with garlic butter sauce and lemon.",
            Instruction = "1. Season salmon with salt and pepper.\n2. Heat olive oil in a pan over medium-high heat.\n3. Cook salmon skin-side down for 4 minutes.\n4. Flip and add butter, garlic, and lemon juice.\n5. Cook for another 3 minutes, basting with the butter sauce.\n6. Serve with steamed vegetables.",
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
        if (salt != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 1, UOM = "tsp" });
        if (pepper != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe3.Recipe_id, Ingredient_id = pepper.Ingredient_id, Quantity = 1, UOM = "tsp" });

        // Recipe 3 Labels
        if (dinnerTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = dinnerTag.Rt_Id, Recipe_Id = recipe3.Recipe_id });
        if (healthyTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = healthyTag.Rt_Id, Recipe_Id = recipe3.Recipe_id });
        if (quickTag != null) context.RecipeLabels.Add(new RecipeLabel { Id = Guid.NewGuid(), Rt_Id = quickTag.Rt_Id, Recipe_Id = recipe3.Recipe_id });

        // 8. Seed Recipe 4: Simple Tomato Pasta
        var recipe4 = new Recipe
        {
            Recipe_id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            Account_id = testUser.Account_id,
            Recipe_name = "Simple Tomato Pasta",
            Description = "Easy pasta with fresh tomato garlic sauce.",
            Instruction = "1. Cook pasta in salted boiling water until al dente.\n2. In a pan, sauté garlic and onion in olive oil.\n3. Add diced tomatoes and cook until softened.\n4. Season with salt and pepper.\n5. Toss cooked pasta with the sauce.\n6. Serve hot with grated cheese if desired.",
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
        if (salt != null) context.RecipeIngredients.Add(new RecipeIngredient { RI_id = Guid.NewGuid(), Recipe_id = recipe4.Recipe_id, Ingredient_id = salt.Ingredient_id, Quantity = 1, UOM = "tsp" });
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
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalSodium'
                        ) THEN
                            ALTER TABLE ""NutritionLog"" ADD COLUMN ""TotalSodium"" double precision;
                        END IF;
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_catalog.pg_attribute a
                            JOIN pg_catalog.pg_class c ON c.oid = a.attrelid
                            JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
                            WHERE n.nspname = 'public' AND c.relname = 'NutritionLog' AND a.attname = 'TotalCholesterol'
                        ) THEN
                            ALTER TABLE ""NutritionLog"" ADD COLUMN ""TotalCholesterol"" double precision;
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
                        log.TotalSodium = (ingredient.Nutritional_value.Sodium ?? 0) * multiplier;
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
                            totalSod += (ri.Ingredient.Nutritional_value.Sodium ?? 0) * multiplier;
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
                    log.TotalSodium = totalSod * portion;
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
