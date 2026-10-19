-- ===========================================================================
-- SmartMeal: 30 Authentic Vietnamese Recipes Seed Script for Supabase PostgreSQL
-- Source: d:\chi_ti_t_180_m_n_n_ph_n_1_1_30.md
-- Generated: 2026-10-20
-- ===========================================================================

DO $$
DECLARE
    v_admin_id uuid;
    v_recipe_id uuid;
    v_tag_id uuid;
    v_ing_id uuid;
BEGIN
    SELECT "Account_id" INTO v_admin_id FROM "Account" WHERE "Role" = 1 LIMIT 1;
    IF v_admin_id IS NULL THEN
        SELECT "Account_id" INTO v_admin_id FROM "Account" LIMIT 1;
    END IF;
    IF v_admin_id IS NULL THEN
        RAISE NOTICE 'No Account found in database. Using a fallback UUID for Account_id.';
        v_admin_id := '00000000-0000-0000-0000-000000000001'::uuid;
    END IF;

    -- 2. Ensure Recipe Tags Exist
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Bữa phụ', 'meal', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Bữa sáng', 'meal', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Bữa trưa', 'meal', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Bữa tối', 'meal', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Canh & Súp', 'cook', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Chay', 'diet', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Chiên', 'cook', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Hầm / Ninh', 'cook', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Kho / Rim', 'cook', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Luộc / Hấp', 'cook', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Lành mạnh', 'diet', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Nhanh', 'meal', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Salad / Trộn', 'cook', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Tráng miệng', 'cook', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Xào', 'cook', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Ăn kèm', 'meal', false) ON CONFLICT ("Name") DO NOTHING;
    INSERT INTO "Recipe_tag" ("Rt_Id", "Name", "Type", "IsDeleted") VALUES (gen_random_uuid(), 'Ăn vặt', 'meal', false) ON CONFLICT ("Name") DO NOTHING;

    -- 3. Upsert Recipes, Tags & Ingredients
    -- Recipe #1: Rau lang xào tỏi
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Rau lang xào tỏi' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Rau lang xào tỏi', 'Món rau dân dã, xanh mướt, giòn ngọt thơm lừng mùi tỏi phi, cực kỳ đưa cơm.', 'Bước 1 (Sơ chế): Nhặt lấy phần ngọn và lá non của rau lang, tước xơ phần cuống, rửa sạch để ráo. Tỏi bóc vỏ, đập dập.
Bước 2 (Chần rau): Đun sôi nồi nước, cho rau lang vào chần sơ khoảng 1 phút rồi vớt ra rổ cho ráo (giúp rau giữ màu xanh).
Bước 3 (Xào rau): Cho dầu ăn vào chảo, phi thơm tỏi. Cho rau lang vào xào nhanh tay trên lửa lớn, nêm hạt nêm và xíu nước mắm cho vừa miệng, tắt bếp.', 5, 10, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món rau dân dã, xanh mướt, giòn ngọt thơm lừng mùi tỏi phi, cực kỳ đưa cơm.', "Instruction" = 'Bước 1 (Sơ chế): Nhặt lấy phần ngọn và lá non của rau lang, tước xơ phần cuống, rửa sạch để ráo. Tỏi bóc vỏ, đập dập.
Bước 2 (Chần rau): Đun sôi nồi nước, cho rau lang vào chần sơ khoảng 1 phút rồi vớt ra rổ cho ráo (giúp rau giữ màu xanh).
Bước 3 (Xào rau): Cho dầu ăn vào chảo, phi thơm tỏi. Cho rau lang vào xào nhanh tay trên lửa lớn, nêm hạt nêm và xíu nước mắm cho vừa miệng, tắt bếp.', "CookTime" = 5, "PrepTime" = 10, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau lang') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau lang', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'mớ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'củ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #2: Cà pháo muối xổi
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Cà pháo muối xổi' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Cà pháo muối xổi', 'Món ăn kèm chua cay, giòn tan, kích thích vị giác đặc trưng của bữa cơm miền Bắc.', 'Bước 1 (Sơ chế): Cà pháo cắt cuống, thái lát mỏng ngâm ngay vào âu nước muối loãng có vắt chút chanh trong 15 phút để cà không bị thâm và bớt nhựa. Vớt ra rửa sạch, để thật ráo.
Bước 2 (Pha mắm): Giã nhuyễn tỏi, ớt. Pha hỗn hợp nước mắm, đường, nước cốt chanh sao cho có vị chua mặn ngọt hài hòa.
Bước 3 (Trộn cà): Cho cà pháo vào âu, đổ hỗn hợp nước mắm tỏi ớt vào trộn đều. Bọc màng bọc thực phẩm, để khoảng 1-2 tiếng là có thể ăn được.', 0, 15, 4, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món ăn kèm chua cay, giòn tan, kích thích vị giác đặc trưng của bữa cơm miền Bắc.', "Instruction" = 'Bước 1 (Sơ chế): Cà pháo cắt cuống, thái lát mỏng ngâm ngay vào âu nước muối loãng có vắt chút chanh trong 15 phút để cà không bị thâm và bớt nhựa. Vớt ra rửa sạch, để thật ráo.
Bước 2 (Pha mắm): Giã nhuyễn tỏi, ớt. Pha hỗn hợp nước mắm, đường, nước cốt chanh sao cho có vị chua mặn ngọt hài hòa.
Bước 3 (Trộn cà): Cho cà pháo vào âu, đổ hỗn hợp nước mắm tỏi ớt vào trộn đều. Bọc màng bọc thực phẩm, để khoảng 1-2 tiếng là có thể ăn được.', "CookTime" = 0, "PrepTime" = 15, "Servings" = 4, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Ăn kèm' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Cà pháo trắng') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Cà pháo trắng', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 300, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Ớt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Ớt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Chanh') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Chanh', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối hạt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối hạt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #3: Rau muống luộc dầm sấu
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Rau muống luộc dầm sấu' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Rau muống luộc dầm sấu', 'Bát nước luộc thanh mát, chua dịu vị sấu cùng đĩa rau muống xanh ngắt là hương vị mùa hè khó quên.', 'Bước 1 (Sơ chế): Rau muống nhặt phần non, rửa sạch qua nhiều nước. Sấu cạo vỏ, rửa sạch.
Bước 2 (Luộc rau): Đun sôi nồi nước, cho chút muối để rau xanh. Thả rau muống vào luộc lật đều, rau chín vớt ra đĩa cho tơi.
Bước 3 (Dầm sấu): Thả sấu vào phần nước luộc rau đun thêm 3-5 phút cho sấu mềm. Tắt bếp, múc sấu ra bát dầm nát, bỏ hạt rồi đổ lại nước sấu chua vào nồi nước luộc.', 10, 10, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Bát nước luộc thanh mát, chua dịu vị sấu cùng đĩa rau muống xanh ngắt là hương vị mùa hè khó quên.', "Instruction" = 'Bước 1 (Sơ chế): Rau muống nhặt phần non, rửa sạch qua nhiều nước. Sấu cạo vỏ, rửa sạch.
Bước 2 (Luộc rau): Đun sôi nồi nước, cho chút muối để rau xanh. Thả rau muống vào luộc lật đều, rau chín vớt ra đĩa cho tơi.
Bước 3 (Dầm sấu): Thả sấu vào phần nước luộc rau đun thêm 3-5 phút cho sấu mềm. Tắt bếp, múc sấu ra bát dầm nát, bỏ hạt rồi đổ lại nước sấu chua vào nồi nước luộc.', "CookTime" = 10, "PrepTime" = 10, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau muống') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau muống', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'mớ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Sấu xanh') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Sấu xanh', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 3, 'quả', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Ớt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Ớt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #4: Dưa giá muối chua
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Dưa giá muối chua' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Dưa giá muối chua', 'Dưa giá giòn sần sật, chua ngọt dịu nhẹ, thường dùng kèm thịt kho hột vịt giúp chống ngán hiệu quả.', 'Bước 1 (Sơ chế): Giá đỗ rửa sạch để ráo. Hẹ rửa sạch cắt khúc. Cà rốt gọt vỏ, bào sợi nhỏ. Trộn đều cả ba.
Bước 2 (Làm nước muối): Pha nước ấm với muối, đường, chút giấm nếm có vị lợ lợ, chua ngọt nhẹ. Khuấy tan.
Bước 3 (Muối chua): Cho hỗn hợp giá vào hũ thủy tinh, đổ ngập nước muối đã pha. Đậy kín nắp để ở nhiệt độ phòng khoảng 1 ngày là chua giòn tới nái.', 0, 15, 4, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Dưa giá giòn sần sật, chua ngọt dịu nhẹ, thường dùng kèm thịt kho hột vịt giúp chống ngán hiệu quả.', "Instruction" = 'Bước 1 (Sơ chế): Giá đỗ rửa sạch để ráo. Hẹ rửa sạch cắt khúc. Cà rốt gọt vỏ, bào sợi nhỏ. Trộn đều cả ba.
Bước 2 (Làm nước muối): Pha nước ấm với muối, đường, chút giấm nếm có vị lợ lợ, chua ngọt nhẹ. Khuấy tan.
Bước 3 (Muối chua): Cho hỗn hợp giá vào hũ thủy tinh, đổ ngập nước muối đã pha. Đậy kín nắp để ở nhiệt độ phòng khoảng 1 ngày là chua giòn tới nái.', "CookTime" = 0, "PrepTime" = 15, "Servings" = 4, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Ăn kèm' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Giá đỗ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Giá đỗ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 300, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hẹ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hẹ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 50, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Cà rốt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Cà rốt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'củ nhỏ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Giấm trắng') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Giấm trắng', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #5: Canh rau tập tàng nấu tôm
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Canh rau tập tàng nấu tôm' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Canh rau tập tàng nấu tôm', 'Món canh ngọt lịm kết hợp từ nhiều loại rau quê và tôm tươi, mang đậm chất mộc mạc miền Trung.', 'Bước 1 (Sơ chế): Rau nhặt sạch, rửa kỹ, thái nhỏ nếu lá to. Tôm bóc vỏ, bỏ chỉ lưng, băm thô. Hành tím băm nhuyễn.
Bước 2 (Xào tôm): Phi thơm hành tím với xíu dầu ăn, cho tôm vào xào săn lại.
Bước 3 (Nấu canh): Đổ nước lọc vừa đủ vào nồi tôm xào đun sôi. Thả rau tập tàng vào, đun sôi bùng lại, nêm nếm hạt nêm vừa ăn rồi tắt bếp ngay để rau không bị nát.', 10, 15, 4, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món canh ngọt lịm kết hợp từ nhiều loại rau quê và tôm tươi, mang đậm chất mộc mạc miền Trung.', "Instruction" = 'Bước 1 (Sơ chế): Rau nhặt sạch, rửa kỹ, thái nhỏ nếu lá to. Tôm bóc vỏ, bỏ chỉ lưng, băm thô. Hành tím băm nhuyễn.
Bước 2 (Xào tôm): Phi thơm hành tím với xíu dầu ăn, cho tôm vào xào săn lại.
Bước 3 (Nấu canh): Đổ nước lọc vừa đủ vào nồi tôm xào đun sôi. Thả rau tập tàng vào, đun sôi bùng lại, nêm nếm hạt nêm vừa ăn rồi tắt bếp ngay để rau không bị nát.', "CookTime" = 10, "PrepTime" = 15, "Servings" = 4, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Canh & Súp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau tập tàng') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau tập tàng', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tôm tươi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tôm tươi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 150, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành tím') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành tím', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #6: Canh hẹ đậu hũ non
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Canh hẹ đậu hũ non' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Canh hẹ đậu hũ non', 'Món canh giải nhiệt cực nhanh, thanh đạm, thơm mùi lá hẹ đặc trưng.', 'Bước 1 (Sơ chế): Hẹ rửa sạch, cắt khúc dài 3cm. Đậu hũ non thái khối vuông vừa ăn, làm nhẹ tay tránh nát.
Bước 2 (Đun nước dùng): Cho nước vào nồi đun sôi (nếu dùng thịt băm thì xào chín thịt trước rồi mới đổ nước). Nêm nếm gia vị, hạt nêm cho vừa miệng.
Bước 3 (Nấu canh): Thả đậu hũ non vào nồi đun sôi lăn tăn khoảng 2 phút. Cho hẹ vào, tắt bếp ngay, rắc thêm chút tiêu.', 10, 5, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món canh giải nhiệt cực nhanh, thanh đạm, thơm mùi lá hẹ đặc trưng.', "Instruction" = 'Bước 1 (Sơ chế): Hẹ rửa sạch, cắt khúc dài 3cm. Đậu hũ non thái khối vuông vừa ăn, làm nhẹ tay tránh nát.
Bước 2 (Đun nước dùng): Cho nước vào nồi đun sôi (nếu dùng thịt băm thì xào chín thịt trước rồi mới đổ nước). Nêm nếm gia vị, hạt nêm cho vừa miệng.
Bước 3 (Nấu canh): Thả đậu hũ non vào nồi đun sôi lăn tăn khoảng 2 phút. Cho hẹ vào, tắt bếp ngay, rắc thêm chút tiêu.', "CookTime" = 10, "PrepTime" = 5, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Canh & Súp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đậu hũ non') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đậu hũ non', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, '1-2 hộp/miếng', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hẹ tươi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hẹ tươi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 100, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Thịt băm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Thịt băm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tiêu') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tiêu', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #7: Đậu bắp luộc chấm chao
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Đậu bắp luộc chấm chao' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Đậu bắp luộc chấm chao', 'Đậu bắp giòn ngọt, giữ nguyên độ nhớt bổ dưỡng chấm cùng chao béo ngậy đậm đà.', 'Bước 1 (Sơ chế): Đậu bắp rửa sạch, cắt bỏ phần cuống cứng (không cắt lẹm vào ruột để tránh ra nhiều nhớt khi luộc).
Bước 2 (Luộc đậu bắp): Đun sôi nồi nước với chút muối. Thả đậu bắp vào luộc 3-4 phút đến khi chín tới, vớt ra ngâm nước đá cho giòn và xanh.
Bước 3 (Pha chao): Tán nhuyễn viên chao cùng ít nước chao, thêm đường, vắt xíu chanh và cắt ớt lát vào khuấy đều cho vừa vị ngọt mặn.', 5, 5, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Đậu bắp giòn ngọt, giữ nguyên độ nhớt bổ dưỡng chấm cùng chao béo ngậy đậm đà.', "Instruction" = 'Bước 1 (Sơ chế): Đậu bắp rửa sạch, cắt bỏ phần cuống cứng (không cắt lẹm vào ruột để tránh ra nhiều nhớt khi luộc).
Bước 2 (Luộc đậu bắp): Đun sôi nồi nước với chút muối. Thả đậu bắp vào luộc 3-4 phút đến khi chín tới, vớt ra ngâm nước đá cho giòn và xanh.
Bước 3 (Pha chao): Tán nhuyễn viên chao cùng ít nước chao, thêm đường, vắt xíu chanh và cắt ớt lát vào khuấy đều cho vừa vị ngọt mặn.', "CookTime" = 5, "PrepTime" = 5, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đậu bắp') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đậu bắp', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 300, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Chao trắng/đỏ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Chao trắng/đỏ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 2, 'viên', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Ớt tươi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Ớt tươi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Chanh') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Chanh', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #8: Thịt luộc cuốn bánh tráng
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Thịt luộc cuốn bánh tráng' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Thịt luộc cuốn bánh tráng', 'Món ăn dân dã, thanh mát với thịt ba chỉ béo ngậy, bún tươi và các loại rau thơm ăn kèm.', 'Bước 1 (Sơ chế): Rửa sạch thịt. Rửa sạch rau sống, dưa leo thái lát mỏng dọc.
Bước 2 (Luộc thịt): Luộc thịt ngập nước cùng 1 củ hành khô đập dập và xíu muối. Thịt chín vớt ra ngâm nước lạnh cho trắng giòn, sau đó thái lát thật mỏng.
Bước 3 (Thưởng thức): Dọn thịt ra đĩa. Bày bánh tráng, bún, rau sống, dưa leo và chén mắm ra. Trải bánh tráng, xếp rau bún, thịt rồi cuốn chặt tay chấm mắm.', 20, 15, 4, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món ăn dân dã, thanh mát với thịt ba chỉ béo ngậy, bún tươi và các loại rau thơm ăn kèm.', "Instruction" = 'Bước 1 (Sơ chế): Rửa sạch thịt. Rửa sạch rau sống, dưa leo thái lát mỏng dọc.
Bước 2 (Luộc thịt): Luộc thịt ngập nước cùng 1 củ hành khô đập dập và xíu muối. Thịt chín vớt ra ngâm nước lạnh cho trắng giòn, sau đó thái lát thật mỏng.
Bước 3 (Thưởng thức): Dọn thịt ra đĩa. Bày bánh tráng, bún, rau sống, dưa leo và chén mắm ra. Trải bánh tráng, xếp rau bún, thịt rồi cuốn chặt tay chấm mắm.', "CookTime" = 20, "PrepTime" = 15, "Servings" = 4, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Salad / Trộn' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Thịt ba chỉ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Thịt ba chỉ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 400, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Bánh tráng') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Bánh tráng', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Bún tươi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Bún tươi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau sống các loại') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau sống các loại', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dưa leo') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dưa leo', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Mắm nêm hoặc nước mắm chua ngọt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Mắm nêm hoặc nước mắm chua ngọt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành khô') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành khô', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #9: Su su xào tỏi
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Su su xào tỏi' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Su su xào tỏi', 'Su su xanh mướt, giòn sần sật quyện với hương tỏi phi thơm nức mũi.', 'Bước 1 (Sơ chế): Su su gọt vỏ (đeo găng tay để tránh nhựa), rửa sạch, bổ đôi bỏ hạt rồi thái sợi hoặc thái lát mỏng. Tỏi băm nhuyễn.
Bước 2 (Xào tỏi): Đun nóng chảo dầu, phi thơm tỏi băm đến khi hơi ngả vàng.
Bước 3 (Xào su su): Đổ su su vào xào nhanh trên lửa lớn. Nêm hạt nêm, đảo đều tay khoảng 3-4 phút cho su su chín tới, tắt bếp rắc tiêu.', 5, 10, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Su su xanh mướt, giòn sần sật quyện với hương tỏi phi thơm nức mũi.', "Instruction" = 'Bước 1 (Sơ chế): Su su gọt vỏ (đeo găng tay để tránh nhựa), rửa sạch, bổ đôi bỏ hạt rồi thái sợi hoặc thái lát mỏng. Tỏi băm nhuyễn.
Bước 2 (Xào tỏi): Đun nóng chảo dầu, phi thơm tỏi băm đến khi hơi ngả vàng.
Bước 3 (Xào su su): Đổ su su vào xào nhanh trên lửa lớn. Nêm hạt nêm, đảo đều tay khoảng 3-4 phút cho su su chín tới, tắt bếp rắc tiêu.', "CookTime" = 5, "PrepTime" = 10, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Su su') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Su su', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 2, 'quả', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'củ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tiêu') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tiêu', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #10: Canh bí đao nấu sườn non
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Canh bí đao nấu sườn non' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Canh bí đao nấu sườn non', 'Bát canh thanh mát, sườn mềm ngọt xương, bí đao trong vắt giúp thanh nhiệt cơ thể.', 'Bước 1 (Sơ chế): Sườn non chặt miếng vừa ăn, rửa sạch chần qua nước sôi rồi xả lại. Bí đao gọt vỏ, bỏ ruột, thái miếng dày. Hành ngò xắt nhỏ.
Bước 2 (Ninh sườn): Cho sườn vào nồi nước nấu sôi, hớt bọt cho nước trong. Hạ lửa nhỏ ninh khoảng 15-20 phút cho sườn mềm, nêm chút muối.
Bước 3 (Nấu canh): Thả bí đao vào nồi sườn, đun đến khi miếng bí trong lại (chín tới). Nêm nếm gia vị vừa ăn, rắc hành ngò và tắt bếp.', 25, 10, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Bát canh thanh mát, sườn mềm ngọt xương, bí đao trong vắt giúp thanh nhiệt cơ thể.', "Instruction" = 'Bước 1 (Sơ chế): Sườn non chặt miếng vừa ăn, rửa sạch chần qua nước sôi rồi xả lại. Bí đao gọt vỏ, bỏ ruột, thái miếng dày. Hành ngò xắt nhỏ.
Bước 2 (Ninh sườn): Cho sườn vào nồi nước nấu sôi, hớt bọt cho nước trong. Hạ lửa nhỏ ninh khoảng 15-20 phút cho sườn mềm, nêm chút muối.
Bước 3 (Nấu canh): Thả bí đao vào nồi sườn, đun đến khi miếng bí trong lại (chín tới). Nêm nếm gia vị vừa ăn, rắc hành ngò và tắt bếp.', "CookTime" = 25, "PrepTime" = 10, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Canh & Súp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Hầm / Ninh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Bí đao') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Bí đao', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 300, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Sườn non') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Sườn non', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 200, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành lá') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành lá', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Ngò rí') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Ngò rí', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tiêu') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tiêu', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #11: Đậu phộng rang muối
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Đậu phộng rang muối' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Đậu phộng rang muối', 'Món nhắm, món ăn kèm kinh điển, hạt đậu giòn tan áo lớp muối mặn mặn bùi bùi.', 'Bước 1 (Rang đậu): Bắc chảo lên bếp, cho đậu phộng vào rang lửa nhỏ, đảo đều tay liên tục để đậu không bị cháy vỏ.
Bước 2 (Thêm dầu): Khi đậu bắt đầu lách tách và vỏ áo sậm màu, nhỏ vào 1 thìa cafe dầu ăn, đảo đều cho hạt đậu bóng và giòn rụm. Tắt bếp.
Bước 3 (Trộn muối): Chờ đậu nguội bớt (còn hơi ấm), cho muối bột canh vào xóc đều để muối bám quanh hạt đậu. Để nguội hoàn toàn rồi cất hũ kín.', 10, 0, 4, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món nhắm, món ăn kèm kinh điển, hạt đậu giòn tan áo lớp muối mặn mặn bùi bùi.', "Instruction" = 'Bước 1 (Rang đậu): Bắc chảo lên bếp, cho đậu phộng vào rang lửa nhỏ, đảo đều tay liên tục để đậu không bị cháy vỏ.
Bước 2 (Thêm dầu): Khi đậu bắt đầu lách tách và vỏ áo sậm màu, nhỏ vào 1 thìa cafe dầu ăn, đảo đều cho hạt đậu bóng và giòn rụm. Tắt bếp.
Bước 3 (Trộn muối): Chờ đậu nguội bớt (còn hơi ấm), cho muối bột canh vào xóc đều để muối bám quanh hạt đậu. Để nguội hoàn toàn rồi cất hũ kín.', "CookTime" = 10, "PrepTime" = 0, "Servings" = 4, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Ăn vặt' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa phụ' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đậu phộng hạt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đậu phộng hạt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'Lạc - 200g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối bột canh hoặc muối tinh') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối bột canh hoặc muối tinh', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #12: Trứng chiên hành tây
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Trứng chiên hành tây' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Trứng chiên hành tây', 'Biến tấu đơn giản của trứng chiên giúp món ăn xốp hơn, thơm ngọt vị hành tây chín.', 'Bước 1 (Sơ chế): Hành tây bóc vỏ, thái hạt lựu nhỏ. Trứng đập ra bát, nêm chút nước mắm, tiêu, đánh tan nổi bọt.
Bước 2 (Xào hành): Cho chút dầu ăn vào chảo, xào qua hành tây cho mềm và ngọt nước. Trút hành tây vào bát trứng trộn đều.
Bước 3 (Chiên trứng): Đun nóng dầu ăn trong chảo, đổ bát trứng hành tây vào tráng đều. Chiên vàng một mặt rồi lật chiên chín mặt còn lại, lấy ra đĩa cắt miếng.', 5, 5, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Biến tấu đơn giản của trứng chiên giúp món ăn xốp hơn, thơm ngọt vị hành tây chín.', "Instruction" = 'Bước 1 (Sơ chế): Hành tây bóc vỏ, thái hạt lựu nhỏ. Trứng đập ra bát, nêm chút nước mắm, tiêu, đánh tan nổi bọt.
Bước 2 (Xào hành): Cho chút dầu ăn vào chảo, xào qua hành tây cho mềm và ngọt nước. Trút hành tây vào bát trứng trộn đều.
Bước 3 (Chiên trứng): Đun nóng dầu ăn trong chảo, đổ bát trứng hành tây vào tráng đều. Chiên vàng một mặt rồi lật chiên chín mặt còn lại, lấy ra đĩa cắt miếng.', "CookTime" = 5, "PrepTime" = 5, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa sáng' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chiên' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Trứng gà') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Trứng gà', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 3, 'quả', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành tây') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành tây', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, '1/2 củ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tiêu') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tiêu', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #13: Cơm cháy kho quẹt
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Cơm cháy kho quẹt' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Cơm cháy kho quẹt', 'Miếng cơm cháy giòn rụm bẻ ra quệt đẫm nước mắm mỡ hành tôm khô mặn ngọt cay xé lưỡi.', 'Bước 1 (Ép cơm cháy): Dùng chảo chống dính, quết mỏng lớp dầu, dàn đều cơm nguội ép chặt, chiên lửa nhỏ đến khi vàng giòn 1 mặt thì lật mặt chiên tiếp.
Bước 2 (Làm kho quẹt): Thịt ba chỉ thái hạt lựu, thắng ra mỡ, vớt tóp mỡ ra riêng. Dùng mỡ heo phi hành, cho tôm khô (đã ngâm mềm) vào xào săn.
Bước 3 (Rim mắm): Pha mắm, đường, nước lọc đổ vào chảo tôm khô. Rim lửa nhỏ đến khi hỗn hợp kẹo lại, cho tóp mỡ, ớt tươi, tiêu vào đảo đều rồi tắt bếp.', 15, 15, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Miếng cơm cháy giòn rụm bẻ ra quệt đẫm nước mắm mỡ hành tôm khô mặn ngọt cay xé lưỡi.', "Instruction" = 'Bước 1 (Ép cơm cháy): Dùng chảo chống dính, quết mỏng lớp dầu, dàn đều cơm nguội ép chặt, chiên lửa nhỏ đến khi vàng giòn 1 mặt thì lật mặt chiên tiếp.
Bước 2 (Làm kho quẹt): Thịt ba chỉ thái hạt lựu, thắng ra mỡ, vớt tóp mỡ ra riêng. Dùng mỡ heo phi hành, cho tôm khô (đã ngâm mềm) vào xào săn.
Bước 3 (Rim mắm): Pha mắm, đường, nước lọc đổ vào chảo tôm khô. Rim lửa nhỏ đến khi hỗn hợp kẹo lại, cho tóp mỡ, ớt tươi, tiêu vào đảo đều rồi tắt bếp.', "CookTime" = 15, "PrepTime" = 15, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Kho / Rim' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Ăn vặt' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Cơm nguội') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Cơm nguội', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Thịt ba chỉ nhiều mỡ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Thịt ba chỉ nhiều mỡ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 100, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tôm khô') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tôm khô', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 30, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tiêu') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tiêu', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Ớt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Ớt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành khô') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành khô', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #14: Canh măng chua cá hú
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Canh măng chua cá hú' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Canh măng chua cá hú', 'Vị chua thanh của măng kết hợp vị béo ngậy của cá hú làm nên món canh đưa cơm số 1 miền Tây.', 'Bước 1 (Sơ chế): Cá hú rửa sạch với nước muối/chanh khử tanh. Măng chua rửa vắt ráo. Cà chua bổ múi cau. Rau ngổ, ngò gai thái nhỏ.
Bước 2 (Chiên sơ cá): Phi thơm tỏi, cho cá hú vào áp chảo sơ 2 mặt cho thịt cá săn lại, bớt tanh. Đổ nước lọc vào đun sôi.
Bước 3 (Nấu canh): Xào qua măng và cà chua rồi trút vào nồi canh cá. Nêm nếm gia vị chua ngọt vừa miệng, cá chín thì rắc ngò gai, ngổ lên và tắt bếp.', 20, 15, 4, 'medium', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Vị chua thanh của măng kết hợp vị béo ngậy của cá hú làm nên món canh đưa cơm số 1 miền Tây.', "Instruction" = 'Bước 1 (Sơ chế): Cá hú rửa sạch với nước muối/chanh khử tanh. Măng chua rửa vắt ráo. Cà chua bổ múi cau. Rau ngổ, ngò gai thái nhỏ.
Bước 2 (Chiên sơ cá): Phi thơm tỏi, cho cá hú vào áp chảo sơ 2 mặt cho thịt cá săn lại, bớt tanh. Đổ nước lọc vào đun sôi.
Bước 3 (Nấu canh): Xào qua măng và cà chua rồi trút vào nồi canh cá. Nêm nếm gia vị chua ngọt vừa miệng, cá chín thì rắc ngò gai, ngổ lên và tắt bếp.', "CookTime" = 20, "PrepTime" = 15, "Servings" = 4, "Difficulty" = 'medium' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Canh & Súp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Khúc cá hú') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Khúc cá hú', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 300, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Măng chua') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Măng chua', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 200, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Cà chua') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Cà chua', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Ngò gai') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Ngò gai', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau ngổ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau ngổ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi băm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi băm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #15: Bầu luộc chấm kho quẹt
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Bầu luộc chấm kho quẹt' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Bầu luộc chấm kho quẹt', 'Miếng bầu non xanh ngọt luộc chín tới chấm cùng nồi kho quẹt đậm đà mặn ngọt.', 'Bước 1 (Sơ chế): Bầu non để nguyên vỏ hoặc gọt vỏ tùy ý, rửa sạch, cắt khoanh dày rồi bổ đôi hoặc bổ làm tư.
Bước 2 (Luộc bầu): Đun sôi lượng nước vừa đủ cùng một chút muối. Thả bầu vào luộc lửa lớn khoảng 5 phút đến khi bầu chín trong.
Bước 3 (Thưởng thức): Vớt bầu ra đĩa để ráo. Làm nóng lại niêu kho quẹt để chấm kèm. Nước luộc bầu làm canh rất ngọt mát.', 10, 5, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Miếng bầu non xanh ngọt luộc chín tới chấm cùng nồi kho quẹt đậm đà mặn ngọt.', "Instruction" = 'Bước 1 (Sơ chế): Bầu non để nguyên vỏ hoặc gọt vỏ tùy ý, rửa sạch, cắt khoanh dày rồi bổ đôi hoặc bổ làm tư.
Bước 2 (Luộc bầu): Đun sôi lượng nước vừa đủ cùng một chút muối. Thả bầu vào luộc lửa lớn khoảng 5 phút đến khi bầu chín trong.
Bước 3 (Thưởng thức): Vớt bầu ra đĩa để ráo. Làm nóng lại niêu kho quẹt để chấm kèm. Nước luộc bầu làm canh rất ngọt mát.', "CookTime" = 10, "PrepTime" = 5, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Luộc / Hấp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Bầu non') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Bầu non', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'trái', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Kho quẹt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Kho quẹt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #16: Canh rau dền nấu thịt băm
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Canh rau dền nấu thịt băm' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Canh rau dền nấu thịt băm', 'Bát canh màu đỏ hồng bắt mắt, rau dền nhừ tơi, nước ngọt vị thịt băm dễ ăn cho cả nhà.', 'Bước 1 (Sơ chế): Rau dền nhặt khúc non, ngâm rửa kỹ với nước muối, để ráo. Hành tím băm nhỏ.
Bước 2 (Xào thịt): Phi thơm hành tím với dầu ăn, cho thịt băm vào xào tơi, nêm chút hạt nêm cho thịt ngấm vị.
Bước 3 (Nấu canh): Đổ nước đun sôi vào nồi thịt, hớt bọt. Cho rau dền vào nấu lửa lớn, nêm gia vị vừa ăn. Rau chín mềm nhừ thì tắt bếp.', 10, 10, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Bát canh màu đỏ hồng bắt mắt, rau dền nhừ tơi, nước ngọt vị thịt băm dễ ăn cho cả nhà.', "Instruction" = 'Bước 1 (Sơ chế): Rau dền nhặt khúc non, ngâm rửa kỹ với nước muối, để ráo. Hành tím băm nhỏ.
Bước 2 (Xào thịt): Phi thơm hành tím với dầu ăn, cho thịt băm vào xào tơi, nêm chút hạt nêm cho thịt ngấm vị.
Bước 3 (Nấu canh): Đổ nước đun sôi vào nồi thịt, hớt bọt. Cho rau dền vào nấu lửa lớn, nêm gia vị vừa ăn. Rau chín mềm nhừ thì tắt bếp.', "CookTime" = 10, "PrepTime" = 10, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Canh & Súp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau dền đỏ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau dền đỏ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'mớ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Thịt heo băm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Thịt heo băm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 100, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành tím') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành tím', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Gia vị') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Gia vị', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #17: Dưa cải chua xào tóp mỡ
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Dưa cải chua xào tóp mỡ' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Dưa cải chua xào tóp mỡ', 'Dưa cải chua chua giòn giòn quyện với tóp mỡ béo ngậy nổ lách tách trong miệng.', 'Bước 1 (Sơ chế): Dưa chua rửa vắt bớt nước chua, thái khúc ngắn. Mỡ heo thái miếng rang thành tóp mỡ (nếu có tóp mỡ sẵn thì bỏ qua). Cà chua bổ múi.
Bước 2 (Xào cà chua): Dùng mỡ heo phi thơm hành khô, xào mềm cà chua để tạo màu đẹp.
Bước 3 (Xào dưa): Cho dưa chua vào xào kỹ cho thấm mỡ. Nêm xíu mắm, xíu đường cho cân bằng vị chua. Cuối cùng cho tóp mỡ vào đảo đều rồi tắt bếp.', 10, 10, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Dưa cải chua chua giòn giòn quyện với tóp mỡ béo ngậy nổ lách tách trong miệng.', "Instruction" = 'Bước 1 (Sơ chế): Dưa chua rửa vắt bớt nước chua, thái khúc ngắn. Mỡ heo thái miếng rang thành tóp mỡ (nếu có tóp mỡ sẵn thì bỏ qua). Cà chua bổ múi.
Bước 2 (Xào cà chua): Dùng mỡ heo phi thơm hành khô, xào mềm cà chua để tạo màu đẹp.
Bước 3 (Xào dưa): Cho dưa chua vào xào kỹ cho thấm mỡ. Nêm xíu mắm, xíu đường cho cân bằng vị chua. Cuối cùng cho tóp mỡ vào đảo đều rồi tắt bếp.', "CookTime" = 10, "PrepTime" = 10, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Xào' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dưa cải chua') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dưa cải chua', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 200, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Mỡ heo/Tóp mỡ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Mỡ heo/Tóp mỡ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 100, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Cà chua') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Cà chua', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'quả', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành khô') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành khô', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #18: Mướp đắng xào trứng
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Mướp đắng xào trứng' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Mướp đắng xào trứng', 'Vị đắng dịu của mướp hòa quyện với vị béo thơm của trứng, món xào quen thuộc siêu nhanh.', 'Bước 1 (Sơ chế): Mướp đắng bổ đôi moi sạch ruột (cạo màng trắng để bớt đắng), thái lát thật mỏng. Trứng đập ra bát đánh tan với xíu hạt nêm.
Bước 2 (Xào mướp): Phi hành thơm, xào mướp đắng trên lửa lớn cho chín tái, nêm hạt nêm.
Bước 3 (Đổ trứng): Rưới đều bát trứng lên mướp đắng, đợi vài giây cho trứng hơi se lại rồi đảo tơi đều tay đến khi trứng bám vào mướp, tắt bếp rắc tiêu.', 5, 10, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Vị đắng dịu của mướp hòa quyện với vị béo thơm của trứng, món xào quen thuộc siêu nhanh.', "Instruction" = 'Bước 1 (Sơ chế): Mướp đắng bổ đôi moi sạch ruột (cạo màng trắng để bớt đắng), thái lát thật mỏng. Trứng đập ra bát đánh tan với xíu hạt nêm.
Bước 2 (Xào mướp): Phi hành thơm, xào mướp đắng trên lửa lớn cho chín tái, nêm hạt nêm.
Bước 3 (Đổ trứng): Rưới đều bát trứng lên mướp đắng, đợi vài giây cho trứng hơi se lại rồi đảo tơi đều tay đến khi trứng bám vào mướp, tắt bếp rắc tiêu.', "CookTime" = 5, "PrepTime" = 10, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Xào' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Mướp đắng') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Mướp đắng', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'Khổ qua - 2 trái', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Trứng gà') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Trứng gà', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 2, 'quả', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành khô') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành khô', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tiêu') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tiêu', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #19: Bắp xào mỡ hành
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Bắp xào mỡ hành' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Bắp xào mỡ hành', 'Món ăn vặt tuổi thơ thơm lừng mùi bơ, béo ngậy mỡ hành tôm khô, hạt bắp dẻo ngọt.', 'Bước 1 (Sơ chế): Bắp luộc sơ cho mềm vớt ra để ráo. Tôm khô ngâm nở nhỏ. Hành lá thái nhỏ.
Bước 2 (Làm mỡ hành): Cho bơ và chút dầu ăn vào chảo, phi phần đầu hành trắng, xào tôm khô cho thơm.
Bước 3 (Xào bắp): Đổ bắp vào đảo đều, nêm chút nước mắm, xíu đường cho vừa miệng. Bắp chín áo đều bơ thì cho hành lá thái nhỏ vào, đảo nhanh tay rồi tắt bếp.', 10, 10, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món ăn vặt tuổi thơ thơm lừng mùi bơ, béo ngậy mỡ hành tôm khô, hạt bắp dẻo ngọt.', "Instruction" = 'Bước 1 (Sơ chế): Bắp luộc sơ cho mềm vớt ra để ráo. Tôm khô ngâm nở nhỏ. Hành lá thái nhỏ.
Bước 2 (Làm mỡ hành): Cho bơ và chút dầu ăn vào chảo, phi phần đầu hành trắng, xào tôm khô cho thơm.
Bước 3 (Xào bắp): Đổ bắp vào đảo đều, nêm chút nước mắm, xíu đường cho vừa miệng. Bắp chín áo đều bơ thì cho hành lá thái nhỏ vào, đảo nhanh tay rồi tắt bếp.', "CookTime" = 10, "PrepTime" = 10, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Ăn vặt' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Xào' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Bắp ngọt hoặc bắp nếp lẩy hạt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Bắp ngọt hoặc bắp nếp lẩy hạt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 2, 'trái', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tôm khô') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tôm khô', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Bơ thực vật') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Bơ thực vật', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành lá') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành lá', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #20: Khoai lang luộc
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Khoai lang luộc' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Khoai lang luộc', 'Món ăn sáng hoặc ăn nhẹ đơn giản, giữ trọn vị ngọt tự nhiên, bùi bở của khoai lang.', 'Bước 1 (Sơ chế): Khoai lang rửa thật sạch bùn đất, cắt bỏ hai đầu núm, không cần gọt vỏ.
Bước 2 (Luộc khoai): Xếp khoai vào nồi, đổ nước xâm xấp mặt khoai, thêm xíu muối để khoai ngọt đậm hơn. Đậy kín vung.
Bước 3 (Kiểm tra độ chín): Luộc sôi, sau đó hạ nhỏ lửa đun 15-20 phút. Xiên đũa qua củ khoai thấy mềm xuyên thấu là khoai chín. Chắt hết nước, đun thêm 1 phút cho khô vỏ.', 20, 5, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món ăn sáng hoặc ăn nhẹ đơn giản, giữ trọn vị ngọt tự nhiên, bùi bở của khoai lang.', "Instruction" = 'Bước 1 (Sơ chế): Khoai lang rửa thật sạch bùn đất, cắt bỏ hai đầu núm, không cần gọt vỏ.
Bước 2 (Luộc khoai): Xếp khoai vào nồi, đổ nước xâm xấp mặt khoai, thêm xíu muối để khoai ngọt đậm hơn. Đậy kín vung.
Bước 3 (Kiểm tra độ chín): Luộc sôi, sau đó hạ nhỏ lửa đun 15-20 phút. Xiên đũa qua củ khoai thấy mềm xuyên thấu là khoai chín. Chắt hết nước, đun thêm 1 phút cho khô vỏ.', "CookTime" = 20, "PrepTime" = 5, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Luộc / Hấp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa sáng' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Khoai lang củ vừa') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Khoai lang củ vừa', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 500, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Chút muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Chút muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #21: Khoai mì hấp cốt dừa
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Khoai mì hấp cốt dừa' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Khoai mì hấp cốt dừa', 'Khoai mì bở tơi, béo ngậy cốt dừa, thơm lừng lá dứa, rắc thêm muối mè nhai bùi bùi.', 'Bước 1 (Sơ chế): Khoai mì lột vỏ, ngâm nước muối pha loãng 2-3 tiếng để thải độc, rửa lại sạch, cắt khúc.
Bước 2 (Hấp khoai): Xếp khoai mì và lá dứa vào nồi hấp, hấp khoảng 20 phút cho khoai chín nứt, bở tơi.
Bước 3 (Chan cốt dừa): Rưới từ từ nước cốt dừa pha chút đường, xíu muối lên khoai mì đang nóng, đậy nắp hấp thêm 3-5 phút cho cốt dừa ngấm. Lấy ra rắc muối mè.', 25, 15, 4, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Khoai mì bở tơi, béo ngậy cốt dừa, thơm lừng lá dứa, rắc thêm muối mè nhai bùi bùi.', "Instruction" = 'Bước 1 (Sơ chế): Khoai mì lột vỏ, ngâm nước muối pha loãng 2-3 tiếng để thải độc, rửa lại sạch, cắt khúc.
Bước 2 (Hấp khoai): Xếp khoai mì và lá dứa vào nồi hấp, hấp khoảng 20 phút cho khoai chín nứt, bở tơi.
Bước 3 (Chan cốt dừa): Rưới từ từ nước cốt dừa pha chút đường, xíu muối lên khoai mì đang nóng, đậy nắp hấp thêm 3-5 phút cho cốt dừa ngấm. Lấy ra rắc muối mè.', "CookTime" = 25, "PrepTime" = 15, "Servings" = 4, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa phụ' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Tráng miệng' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Luộc / Hấp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Khoai mì') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Khoai mì', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'Sắn - 500g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước cốt dừa') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước cốt dừa', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'bát con', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Lá dứa') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Lá dứa', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối mè đậu phộng') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối mè đậu phộng', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #22: Cháo trắng hột vịt muối
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Cháo trắng hột vịt muối' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Cháo trắng hột vịt muối', 'Bát cháo nếp tẻ sánh mịn ăn cùng lòng đỏ hột vịt muối mặn béo mằn mặn, mộc mạc mà ấm bụng.', 'Bước 1 (Sơ chế): Gạo vo sạch, ngâm nước 30 phút cho nhanh nhừ. Hột vịt muối luộc chín, bóc vỏ bổ làm tư.
Bước 2 (Nấu cháo): Đổ nước và gạo vào nồi (tỉ lệ 1 gạo : 8 nước), thả cuộn lá dứa vào ninh lửa nhỏ đến khi hạt gạo nở bung, sánh mịn.
Bước 3 (Thưởng thức): Múc cháo nóng ra bát, rắc hành lá nếu thích. Ăn kèm từng chút hột vịt muối béo ngậy.', 30, 5, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Bát cháo nếp tẻ sánh mịn ăn cùng lòng đỏ hột vịt muối mặn béo mằn mặn, mộc mạc mà ấm bụng.', "Instruction" = 'Bước 1 (Sơ chế): Gạo vo sạch, ngâm nước 30 phút cho nhanh nhừ. Hột vịt muối luộc chín, bóc vỏ bổ làm tư.
Bước 2 (Nấu cháo): Đổ nước và gạo vào nồi (tỉ lệ 1 gạo : 8 nước), thả cuộn lá dứa vào ninh lửa nhỏ đến khi hạt gạo nở bung, sánh mịn.
Bước 3 (Thưởng thức): Múc cháo nóng ra bát, rắc hành lá nếu thích. Ăn kèm từng chút hột vịt muối béo ngậy.', "CookTime" = 30, "PrepTime" = 5, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Canh & Súp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa sáng' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Gạo tẻ trộn chút nếp') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Gạo tẻ trộn chút nếp', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, '1/2 bát', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hột vịt muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hột vịt muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 2, 'quả', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Lá dứa') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Lá dứa', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành lá') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành lá', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #23: Bún nước tương
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Bún nước tương' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Bún nước tương', 'Món bún trộn chay tiện lợi, thanh đạm, vị nước tương tỏi ớt mặn ngọt vừa miệng.', 'Bước 1 (Sơ chế): Đậu hũ chiên lại cho giòn, cắt sợi hoặc khối nhỏ. Dưa leo băm sợi. Rau sống rửa sạch cắt nhỏ.
Bước 2 (Pha nước tương): Băm nhuyễn tỏi ớt. Pha nước tương với đường, chút nước lọc, vắt thêm xíu chanh và cho tỏi ớt vào khuấy tan.
Bước 3 (Trộn bún): Cho bún ra tô, xếp rau, dưa leo, đậu hũ lên trên. Khi ăn rưới nước tương tỏi ớt vào trộn đều, rắc thêm đậu phộng rang (nếu có).', 5, 10, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Món bún trộn chay tiện lợi, thanh đạm, vị nước tương tỏi ớt mặn ngọt vừa miệng.', "Instruction" = 'Bước 1 (Sơ chế): Đậu hũ chiên lại cho giòn, cắt sợi hoặc khối nhỏ. Dưa leo băm sợi. Rau sống rửa sạch cắt nhỏ.
Bước 2 (Pha nước tương): Băm nhuyễn tỏi ớt. Pha nước tương với đường, chút nước lọc, vắt thêm xíu chanh và cho tỏi ớt vào khuấy tan.
Bước 3 (Trộn bún): Cho bún ra tô, xếp rau, dưa leo, đậu hũ lên trên. Khi ăn rưới nước tương tỏi ớt vào trộn đều, rắc thêm đậu phộng rang (nếu có).', "CookTime" = 5, "PrepTime" = 10, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa sáng' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Salad / Trộn' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Bún tươi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Bún tươi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đậu hũ chiên') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đậu hũ chiên', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 2, 'bìa', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dưa leo') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dưa leo', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau xà lách') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau xà lách', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau thơm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau thơm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước tương') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước tương', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'xì dầu', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Ớt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Ớt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #24: Cà tím xào lá lốt
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Cà tím xào lá lốt' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Cà tím xào lá lốt', 'Miếng cà tím mềm nhừ ngấm vị ngọt của thịt, thơm nức mũi mùi đặc trưng của lá lốt.', 'Bước 1 (Sơ chế): Cà tím thái vát hoặc bổ cau, ngâm nước muối loãng cho khỏi thâm, vớt để ráo. Lá lốt thái sợi nhuyễn. Tỏi băm.
Bước 2 (Xào thịt): Phi tỏi thơm, cho thịt băm vào xào săn chín, nêm chút hạt nêm.
Bước 3 (Xào cà): Trút cà tím vào chảo thịt, đảo đều. Có thể thêm chút nước để cà chín mềm không bị cháy. Khi cà mềm nhừ vừa ăn, nêm nếm lại, rắc lá lốt vào đảo nhanh và tắt bếp.', 15, 10, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Miếng cà tím mềm nhừ ngấm vị ngọt của thịt, thơm nức mũi mùi đặc trưng của lá lốt.', "Instruction" = 'Bước 1 (Sơ chế): Cà tím thái vát hoặc bổ cau, ngâm nước muối loãng cho khỏi thâm, vớt để ráo. Lá lốt thái sợi nhuyễn. Tỏi băm.
Bước 2 (Xào thịt): Phi tỏi thơm, cho thịt băm vào xào săn chín, nêm chút hạt nêm.
Bước 3 (Xào cà): Trút cà tím vào chảo thịt, đảo đều. Có thể thêm chút nước để cà chín mềm không bị cháy. Khi cà mềm nhừ vừa ăn, nêm nếm lại, rắc lá lốt vào đảo nhanh và tắt bếp.', "CookTime" = 15, "PrepTime" = 10, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Xào' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Cà tím') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Cà tím', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 2, 'quả dài', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Thịt ba chỉ băm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Thịt ba chỉ băm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 100, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Lá lốt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Lá lốt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'nắm', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Gia vị') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Gia vị', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #25: Canh cải xanh nấu gừng
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Canh cải xanh nấu gừng' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Canh cải xanh nấu gừng', 'Bát canh màu xanh trong vắt, hăng nhẹ vị cải và nồng ấm vị gừng tươi giúp giải cảm.', 'Bước 1 (Sơ chế): Cải bẹ xanh cắt gốc, rửa sạch bùn đất từng kẽ lá, thái khúc 3cm. Gừng cạo vỏ, thái chỉ hoặc đập dập.
Bước 2 (Nấu nước dùng): Đun sôi nồi nước, thả gừng đập dập vào đun 2 phút cho ra tinh dầu thơm.
Bước 3 (Nấu canh): Thả rau cải vào nồi đun sôi trên lửa lớn để rau giữ màu xanh. Nêm gia vị, rau chín vớt ra bát ngay để rau không bị nhũn nát.', 5, 5, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Bát canh màu xanh trong vắt, hăng nhẹ vị cải và nồng ấm vị gừng tươi giúp giải cảm.', "Instruction" = 'Bước 1 (Sơ chế): Cải bẹ xanh cắt gốc, rửa sạch bùn đất từng kẽ lá, thái khúc 3cm. Gừng cạo vỏ, thái chỉ hoặc đập dập.
Bước 2 (Nấu nước dùng): Đun sôi nồi nước, thả gừng đập dập vào đun 2 phút cho ra tinh dầu thơm.
Bước 3 (Nấu canh): Thả rau cải vào nồi đun sôi trên lửa lớn để rau giữ màu xanh. Nêm gia vị, rau chín vớt ra bát ngay để rau không bị nhũn nát.', "CookTime" = 5, "PrepTime" = 5, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Canh & Súp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Cải bẹ xanh') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Cải bẹ xanh', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'bó', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Gừng tươi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Gừng tươi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'nhánh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #26: Giá hẹ xào đậu hũ
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Giá hẹ xào đậu hũ' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Giá hẹ xào đậu hũ', 'Đĩa đồ xào thanh đạm, giòn ngọt từ giá, thơm nồng vị hẹ và mềm béo của đậu hũ.', 'Bước 1 (Sơ chế): Giá đỗ rửa sạch vớt ráo. Hẹ rửa sạch cắt khúc. Đậu hũ thái con chì (thái sợi dài).
Bước 2 (Phi tỏi): Bắc chảo dầu lên bếp, phi thơm tỏi băm. (Nếu ăn chay kiêng ngũ vị tân có thể thay bằng hành paro).
Bước 3 (Xào nguyên liệu): Cho đậu hũ vào đảo sơ. Cho giá và hẹ vào đảo nhanh tay trên lửa thật lớn, nêm xíu nước tương và hạt nêm. Tắt bếp ngay khi rau hơi xẹp để giữ độ giòn.', 5, 10, 2, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Đĩa đồ xào thanh đạm, giòn ngọt từ giá, thơm nồng vị hẹ và mềm béo của đậu hũ.', "Instruction" = 'Bước 1 (Sơ chế): Giá đỗ rửa sạch vớt ráo. Hẹ rửa sạch cắt khúc. Đậu hũ thái con chì (thái sợi dài).
Bước 2 (Phi tỏi): Bắc chảo dầu lên bếp, phi thơm tỏi băm. (Nếu ăn chay kiêng ngũ vị tân có thể thay bằng hành paro).
Bước 3 (Xào nguyên liệu): Cho đậu hũ vào đảo sơ. Cho giá và hẹ vào đảo nhanh tay trên lửa thật lớn, nêm xíu nước tương và hạt nêm. Tắt bếp ngay khi rau hơi xẹp để giữ độ giòn.', "CookTime" = 5, "PrepTime" = 10, "Servings" = 2, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Xào' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Giá đỗ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Giá đỗ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 200, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hẹ') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hẹ', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 100, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đậu hũ chiên') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đậu hũ chiên', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'bìa', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước tương') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước tương', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm chay') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm chay', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi đập dập') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi đập dập', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #27: Đậu cove xào thịt heo
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Đậu cove xào thịt heo' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Đậu cove xào thịt heo', 'Đậu cove giòn sần sật, xanh mướt kết hợp những lát thịt heo thăn xào mềm ngọt.', 'Bước 1 (Sơ chế): Đậu cove tước xơ 2 bên mép, rửa sạch, thái lát xéo mỏng. Thịt heo thái lát mỏng ướp tỏi, dầu hào, tiêu 10 phút.
Bước 2 (Xào thịt): Phi thơm hành, xào thịt heo trên lửa lớn cho săn lại và chín tới rồi trút ra bát.
Bước 3 (Xào đậu): Dùng lại chảo, thêm dầu ăn xào đậu cove. Khi đậu chuyển màu xanh trong (chín), trút thịt lại vào chảo đảo đều, nêm nếm lại rồi tắt bếp.', 10, 10, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Đậu cove giòn sần sật, xanh mướt kết hợp những lát thịt heo thăn xào mềm ngọt.', "Instruction" = 'Bước 1 (Sơ chế): Đậu cove tước xơ 2 bên mép, rửa sạch, thái lát xéo mỏng. Thịt heo thái lát mỏng ướp tỏi, dầu hào, tiêu 10 phút.
Bước 2 (Xào thịt): Phi thơm hành, xào thịt heo trên lửa lớn cho săn lại và chín tới rồi trút ra bát.
Bước 3 (Xào đậu): Dùng lại chảo, thêm dầu ăn xào đậu cove. Khi đậu chuyển màu xanh trong (chín), trút thịt lại vào chảo đảo đều, nêm nếm lại rồi tắt bếp.', "CookTime" = 10, "PrepTime" = 10, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Xào' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa trưa' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đậu cove') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đậu cove', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 250, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Thịt thăn/nạc dăm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Thịt thăn/nạc dăm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 150, 'g', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành khô') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành khô', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu hào') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu hào', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hạt nêm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hạt nêm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tiêu') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tiêu', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #28: Gỏi dưa leo
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Gỏi dưa leo' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Gỏi dưa leo', 'Đĩa gỏi chống ngán tuyệt vời, dưa leo giòn tan thấm đẫm sốt chua ngọt, rắc đậu phộng bùi bùi.', 'Bước 1 (Sơ chế): Dưa leo rửa sạch, gọt sơ vỏ, chẻ đôi bỏ ruột, thái lát xéo mỏng. Bóp dưa với xíu muối 5 phút rồi xả nước, vắt ráo (giúp dưa siêu giòn).
Bước 2 (Pha nước trộn): Pha nước mắm tỏi ớt chua ngọt (mắm, đường, chanh tỉ lệ 1:1:1), quậy tan.
Bước 3 (Trộn gỏi): Cho dưa leo, rau thơm thái nhỏ vào thố. Đổ nước mắm chua ngọt trộn đều tay. Trình bày ra đĩa và rắc đậu phộng rang giã dập.', 0, 15, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Đĩa gỏi chống ngán tuyệt vời, dưa leo giòn tan thấm đẫm sốt chua ngọt, rắc đậu phộng bùi bùi.', "Instruction" = 'Bước 1 (Sơ chế): Dưa leo rửa sạch, gọt sơ vỏ, chẻ đôi bỏ ruột, thái lát xéo mỏng. Bóp dưa với xíu muối 5 phút rồi xả nước, vắt ráo (giúp dưa siêu giòn).
Bước 2 (Pha nước trộn): Pha nước mắm tỏi ớt chua ngọt (mắm, đường, chanh tỉ lệ 1:1:1), quậy tan.
Bước 3 (Trộn gỏi): Cho dưa leo, rau thơm thái nhỏ vào thố. Đổ nước mắm chua ngọt trộn đều tay. Trình bày ra đĩa và rắc đậu phộng rang giã dập.', "CookTime" = 0, "PrepTime" = 15, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Salad / Trộn' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Nhanh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dưa leo') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dưa leo', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 3, 'quả', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau thơm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau thơm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'húng lủi/kinh giới', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đậu phộng rang') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đậu phộng rang', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Chanh') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Chanh', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Đường') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Đường', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Nước mắm') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Nước mắm', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tỏi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tỏi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Ớt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Ớt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #29: Củ cải trắng luộc chấm mắm quẹt
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Củ cải trắng luộc chấm mắm quẹt' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Củ cải trắng luộc chấm mắm quẹt', 'Củ cải luộc trong veo, ngọt nước, giải ngấy hoàn hảo khi kết hợp mắm quẹt cay nồng.', 'Bước 1 (Sơ chế): Củ cải trắng gọt vỏ, xát nhẹ muối rửa sạch để khử bớt mùi hăng. Thái khoanh tròn hoặc móng lợn dày vừa ăn.
Bước 2 (Luộc củ cải): Đun sôi nước, thả củ cải vào luộc lửa vừa khoảng 10-15 phút.
Bước 3 (Kiểm tra): Khi thấy củ cải chuyển sang màu hơi trong là đã chín mềm và rất ngọt. Vớt ra đĩa chấm cùng kho quẹt.', 15, 5, 3, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Củ cải luộc trong veo, ngọt nước, giải ngấy hoàn hảo khi kết hợp mắm quẹt cay nồng.', "Instruction" = 'Bước 1 (Sơ chế): Củ cải trắng gọt vỏ, xát nhẹ muối rửa sạch để khử bớt mùi hăng. Thái khoanh tròn hoặc móng lợn dày vừa ăn.
Bước 2 (Luộc củ cải): Đun sôi nước, thả củ cải vào luộc lửa vừa khoảng 10-15 phút.
Bước 3 (Kiểm tra): Khi thấy củ cải chuyển sang màu hơi trong là đã chín mềm và rất ngọt. Vớt ra đĩa chấm cùng kho quẹt.', "CookTime" = 15, "PrepTime" = 5, "Servings" = 3, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Luộc / Hấp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Bữa tối' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Củ cải trắng') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Củ cải trắng', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 2, 'củ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Kho quẹt hoặc Mắm ruốc xào thịt') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Kho quẹt hoặc Mắm ruốc xào thịt', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Xíu muối') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Xíu muối', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    -- Recipe #30: Canh mướp nấu mồng tơi
    SELECT "Recipe_id" INTO v_recipe_id FROM "Recipe" WHERE "Recipe_name" = 'Canh mướp nấu mồng tơi' AND NOT "IsDeleted" LIMIT 1;
    IF v_recipe_id IS NULL THEN
        v_recipe_id := gen_random_uuid();
        INSERT INTO "Recipe" ("Recipe_id", "Account_id", "Recipe_name", "Description", "Instruction", "CookTime", "PrepTime", "Servings", "Difficulty", "IsPublic", "ImageUrl", "CreatedAt", "IsDeleted")
        VALUES (v_recipe_id, v_admin_id, 'Canh mướp nấu mồng tơi', 'Canh rau thanh mát "chuẩn vị mẹ nấu", mướp hương thơm nức mũi hòa với độ sánh mềm của mồng tơi.', 'Bước 1 (Sơ chế): Mướp gọt vỏ, rửa sạch, thái lát vát xéo. Mồng tơi nhặt lá rửa sạch. Tôm khô ngâm mềm giã hơi dập.
Bước 2 (Nấu nước dùng): Phi hành tím xào thơm tôm khô. Đổ nước đun sôi, hớt bọt để nước dùng trong và ngọt.
Bước 3 (Nấu canh): Thả mướp vào trước đun 2 phút, tiếp đó thả mồng tơi vào đảo đều đun sôi lại. Nêm nếm gia vị và tắt bếp để rau không bị vàng úa.', 10, 10, 4, 'easy', true, NULL, NOW(), false);
    ELSE
        UPDATE "Recipe" SET "Description" = 'Canh rau thanh mát "chuẩn vị mẹ nấu", mướp hương thơm nức mũi hòa với độ sánh mềm của mồng tơi.', "Instruction" = 'Bước 1 (Sơ chế): Mướp gọt vỏ, rửa sạch, thái lát vát xéo. Mồng tơi nhặt lá rửa sạch. Tôm khô ngâm mềm giã hơi dập.
Bước 2 (Nấu nước dùng): Phi hành tím xào thơm tôm khô. Đổ nước đun sôi, hớt bọt để nước dùng trong và ngọt.
Bước 3 (Nấu canh): Thả mướp vào trước đun 2 phút, tiếp đó thả mồng tơi vào đảo đều đun sôi lại. Nêm nếm gia vị và tắt bếp để rau không bị vàng úa.', "CookTime" = 10, "PrepTime" = 10, "Servings" = 4, "Difficulty" = 'easy' WHERE "Recipe_id" = v_recipe_id;
    END IF;

    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Canh & Súp' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Chay' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Rt_Id" INTO v_tag_id FROM "Recipe_tag" WHERE "Name" = 'Lành mạnh' LIMIT 1;
    IF v_tag_id IS NOT NULL THEN
        INSERT INTO "RecipeLabel" ("Id", "Recipe_Id", "Rt_Id", "IsDeleted")
        SELECT gen_random_uuid(), v_recipe_id, v_tag_id, false
        WHERE NOT EXISTS (SELECT 1 FROM "RecipeLabel" WHERE "Recipe_Id" = v_recipe_id AND "Rt_Id" = v_tag_id);
    END IF;
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Mướp hương') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Mướp hương', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'quả', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Rau mồng tơi') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Rau mồng tơi', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'mớ', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Tôm khô') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Tôm khô', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Hành tím') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Hành tím', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'phần', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Dầu ăn') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Dầu ăn', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng canh', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);
    SELECT "Ingredient_id" INTO v_ing_id FROM "Ingredients" WHERE LOWER("Name") = LOWER('Gia vị') AND NOT "IsDeleted" LIMIT 1;
    IF v_ing_id IS NULL THEN
        v_ing_id := gen_random_uuid();
        INSERT INTO "Ingredients" ("Ingredient_id", "Name", "AveragePrice", "ImageUrl", "IsDeleted")
        VALUES (v_ing_id, 'Gia vị', 15000, 'https://images.unsplash.com/photo-1540420773420-3366772f4999', false);
    END IF;
    INSERT INTO "RecipeIngredients" ("RI_id", "Recipe_id", "Ingredient_id", "Quantity", "UOM", "IsPrimary", "IsDeleted")
    SELECT gen_random_uuid(), v_recipe_id, v_ing_id, 1, 'muỗng cà phê', false, false
    WHERE NOT EXISTS (SELECT 1 FROM "RecipeIngredients" WHERE "Recipe_id" = v_recipe_id AND "Ingredient_id" = v_ing_id);

    RAISE NOTICE 'Successfully seeded 30 recipes with ingredients and tags into Supabase!';
END $$;