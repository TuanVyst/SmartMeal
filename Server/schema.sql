CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

START TRANSACTION;

CREATE TABLE "Account" (
    "Account_id" uuid NOT NULL,
    "Role" integer NOT NULL,
    "Username" character varying(100) NOT NULL,
    "Password" character varying(255) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "IsActive" boolean NOT NULL,
    "LastLogin" timestamp with time zone,
    "Name" character varying(100),
    "Phone" character varying(20),
    "Email" character varying(150),
    "Address" character varying(255),
    "AvatarUrl" character varying(500),
    CONSTRAINT "PK_Account" PRIMARY KEY ("Account_id")
);

CREATE TABLE "DietPlan" (
    "Diet_id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Description" character varying(1000),
    "TargetCalories" double precision,
    "MaxCarbs" double precision,
    "MaxFat" double precision,
    "MinProtein" double precision,
    CONSTRAINT "PK_DietPlan" PRIMARY KEY ("Diet_id")
);

CREATE TABLE "Ingredients" (
    "Ingredient_id" uuid NOT NULL,
    "Name" text NOT NULL,
    "AveragePrice" double precision NOT NULL,
    "ImageUrl" text NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_Ingredients" PRIMARY KEY ("Ingredient_id")
);

CREATE TABLE "IngredientTags" (
    "It_id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Category" text NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_IngredientTags" PRIMARY KEY ("It_id")
);

CREATE TABLE "MedicalCondition" (
    "Condition_id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "Description" character varying(1000),
    "Category" character varying(100),
    CONSTRAINT "PK_MedicalCondition" PRIMARY KEY ("Condition_id")
);

CREATE TABLE "Partners" (
    "Partner_id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Address" text NOT NULL,
    "Image" text NOT NULL,
    "Website" text NOT NULL,
    "IsActive" boolean NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_Partners" PRIMARY KEY ("Partner_id")
);

CREATE TABLE "Plan" (
    "Plan_id" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Price" numeric(18,2) NOT NULL,
    "Duration" integer NOT NULL,
    "Description" character varying(500) NOT NULL,
    "Features" text NOT NULL,
    CONSTRAINT "PK_Plan" PRIMARY KEY ("Plan_id")
);

CREATE TABLE "Recipe_tag" (
    "Rt_Id" uuid NOT NULL,
    "Name" character varying(100) NOT NULL,
    "Type" character varying(50) NOT NULL,
    CONSTRAINT "PK_Recipe_tag" PRIMARY KEY ("Rt_Id")
);

CREATE TABLE "BmiLog" (
    "Log_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Height" double precision,
    "Weight" double precision,
    "Bmi" double precision,
    "BmiLevel" character varying(20),
    "RecordedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_BmiLog" PRIMARY KEY ("Log_id"),
    CONSTRAINT "FK_BmiLog_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE
);

CREATE TABLE "Collection" (
    "Collection_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Name" character varying(200) NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "IsPublic" boolean NOT NULL,
    CONSTRAINT "PK_Collection" PRIMARY KEY ("Collection_id"),
    CONSTRAINT "FK_Collection_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE
);

CREATE TABLE "Feedback" (
    "Feedback_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Title" character varying(200),
    "Content" text,
    "Rating" integer,
    "CreatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_Feedback" PRIMARY KEY ("Feedback_id"),
    CONSTRAINT "FK_Feedback_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE
);

CREATE TABLE "GroceryLists" (
    "List_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "Status" text NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_GroceryLists" PRIMARY KEY ("List_id"),
    CONSTRAINT "FK_GroceryLists_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE
);

CREATE TABLE "HealthProfile" (
    "Profile_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "DateOfBirth" timestamp with time zone,
    "Gender" character varying(20),
    "Height" double precision,
    "Weight" double precision,
    "ActivityLevel" character varying(50),
    "Goal" character varying(50),
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_HealthProfile" PRIMARY KEY ("Profile_id"),
    CONSTRAINT "FK_HealthProfile_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE
);

CREATE TABLE "NutritionGoal" (
    "Goal_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "TargetCalories" double precision,
    "TargetProtein" double precision,
    "TargetCarbs" double precision,
    "TargetFat" double precision,
    "TargetFiber" double precision,
    "CreatedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_NutritionGoal" PRIMARY KEY ("Goal_id"),
    CONSTRAINT "FK_NutritionGoal_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE
);

CREATE TABLE "Recipe" (
    "Recipe_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Recipe_name" character varying(200) NOT NULL,
    "Description" character varying(1000) NOT NULL,
    "Instruction" text NOT NULL,
    "CookTime" integer NOT NULL,
    "PrepTime" integer NOT NULL,
    "Servings" integer NOT NULL,
    "Difficulty" character varying(20) NOT NULL,
    "IsPublic" boolean NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Recipe" PRIMARY KEY ("Recipe_id"),
    CONSTRAINT "FK_Recipe_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE
);

CREATE TABLE "UserDietPlan" (
    "UDP_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Diet_id" uuid NOT NULL,
    "StartDate" timestamp with time zone,
    "EndDate" timestamp with time zone,
    "IsActive" boolean NOT NULL,
    CONSTRAINT "PK_UserDietPlan" PRIMARY KEY ("UDP_id"),
    CONSTRAINT "FK_UserDietPlan_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserDietPlan_DietPlan_Diet_id" FOREIGN KEY ("Diet_id") REFERENCES "DietPlan" ("Diet_id") ON DELETE CASCADE
);

CREATE TABLE "Allergies" (
    "Allergy_id" uuid NOT NULL,
    "Ingredient_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_Allergies" PRIMARY KEY ("Allergy_id"),
    CONSTRAINT "FK_Allergies_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE,
    CONSTRAINT "FK_Allergies_Ingredients_Ingredient_id" FOREIGN KEY ("Ingredient_id") REFERENCES "Ingredients" ("Ingredient_id") ON DELETE CASCADE
);

CREATE TABLE "NutritionalValues" (
    "Nv_id" uuid NOT NULL,
    "Ingredient_id" uuid NOT NULL,
    "Calories" double precision NOT NULL,
    "Protein" double precision,
    "Carbs" double precision,
    "Fat" double precision,
    "Fiber" double precision,
    "Sugar" double precision,
    "Salt" double precision,
    "Cholesterol" double precision,
    "ServingSize" double precision,
    "ServingUnit" text,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_NutritionalValues" PRIMARY KEY ("Nv_id"),
    CONSTRAINT "FK_NutritionalValues_Ingredients_Ingredient_id" FOREIGN KEY ("Ingredient_id") REFERENCES "Ingredients" ("Ingredient_id") ON DELETE CASCADE
);

CREATE TABLE "Pantries" (
    "Pantry_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Ingredient_id" uuid NOT NULL,
    "Quantity" double precision NOT NULL,
    "Unit" text NOT NULL,
    "ExpiryDate" timestamp with time zone NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "PK_Pantries" PRIMARY KEY ("Pantry_id"),
    CONSTRAINT "FK_Pantries_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE,
    CONSTRAINT "FK_Pantries_Ingredients_Ingredient_id" FOREIGN KEY ("Ingredient_id") REFERENCES "Ingredients" ("Ingredient_id") ON DELETE CASCADE
);

CREATE TABLE "IngredientLabels" (
    "Id" uuid NOT NULL,
    "It_id" uuid NOT NULL,
    "Ingredient_id" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_IngredientLabels" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_IngredientLabels_IngredientTags_It_id" FOREIGN KEY ("It_id") REFERENCES "IngredientTags" ("It_id") ON DELETE CASCADE,
    CONSTRAINT "FK_IngredientLabels_Ingredients_Ingredient_id" FOREIGN KEY ("Ingredient_id") REFERENCES "Ingredients" ("Ingredient_id") ON DELETE CASCADE
);

CREATE TABLE "ConditionDietRecommendation" (
    "Rec_id" uuid NOT NULL,
    "Condition_id" uuid NOT NULL,
    "Diet_id" uuid NOT NULL,
    "Priority" integer NOT NULL,
    "Notes" character varying(1000),
    CONSTRAINT "PK_ConditionDietRecommendation" PRIMARY KEY ("Rec_id"),
    CONSTRAINT "FK_ConditionDietRecommendation_DietPlan_Diet_id" FOREIGN KEY ("Diet_id") REFERENCES "DietPlan" ("Diet_id") ON DELETE CASCADE,
    CONSTRAINT "FK_ConditionDietRecommendation_MedicalCondition_Condition_id" FOREIGN KEY ("Condition_id") REFERENCES "MedicalCondition" ("Condition_id") ON DELETE CASCADE
);

CREATE TABLE "UserCondition" (
    "UC_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Condition_id" uuid NOT NULL,
    "DiagnosedAt" timestamp with time zone,
    "Notes" character varying(1000),
    CONSTRAINT "PK_UserCondition" PRIMARY KEY ("UC_id"),
    CONSTRAINT "FK_UserCondition_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE,
    CONSTRAINT "FK_UserCondition_MedicalCondition_Condition_id" FOREIGN KEY ("Condition_id") REFERENCES "MedicalCondition" ("Condition_id") ON DELETE CASCADE
);

CREATE TABLE "AffiliateProducts" (
    "Product_id" uuid NOT NULL,
    "Partner_id" uuid NOT NULL,
    "Ingredient_id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Link" text NOT NULL,
    "Price" double precision NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_AffiliateProducts" PRIMARY KEY ("Product_id"),
    CONSTRAINT "FK_AffiliateProducts_Ingredients_Ingredient_id" FOREIGN KEY ("Ingredient_id") REFERENCES "Ingredients" ("Ingredient_id") ON DELETE CASCADE,
    CONSTRAINT "FK_AffiliateProducts_Partners_Partner_id" FOREIGN KEY ("Partner_id") REFERENCES "Partners" ("Partner_id") ON DELETE CASCADE
);

CREATE TABLE "Subscription" (
    "Sub_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Plan_id" uuid NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone,
    "Status" character varying(20) NOT NULL,
    "PaymentRef" character varying(255) NOT NULL,
    CONSTRAINT "PK_Subscription" PRIMARY KEY ("Sub_id"),
    CONSTRAINT "FK_Subscription_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE,
    CONSTRAINT "FK_Subscription_Plan_Plan_id" FOREIGN KEY ("Plan_id") REFERENCES "Plan" ("Plan_id") ON DELETE CASCADE
);

CREATE TABLE "NutritionLog" (
    "Log_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "LogDate" timestamp with time zone NOT NULL,
    "MealType" character varying(50),
    "Recipe_id" uuid,
    "Ingredient_id" uuid,
    "Quantity" double precision,
    "Unit" character varying(50),
    "TotalCalories" double precision,
    "TotalProtein" double precision,
    "TotalCarbs" double precision,
    "TotalFat" double precision,
    "TotalFiber" double precision,
    "TotalSugar" double precision,
    "TotalSalt" double precision,
    "TotalCholesterol" double precision,
    CONSTRAINT "PK_NutritionLog" PRIMARY KEY ("Log_id"),
    CONSTRAINT "FK_NutritionLog_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE,
    CONSTRAINT "FK_NutritionLog_Ingredients_Ingredient_id" FOREIGN KEY ("Ingredient_id") REFERENCES "Ingredients" ("Ingredient_id"),
    CONSTRAINT "FK_NutritionLog_Recipe_Recipe_id" FOREIGN KEY ("Recipe_id") REFERENCES "Recipe" ("Recipe_id")
);

CREATE TABLE "RecipeIngredients" (
    "RI_id" uuid NOT NULL,
    "Recipe_id" uuid NOT NULL,
    "Ingredient_id" uuid NOT NULL,
    "Quantity" integer NOT NULL,
    "UOM" text NOT NULL,
    CONSTRAINT "PK_RecipeIngredients" PRIMARY KEY ("RI_id"),
    CONSTRAINT "FK_RecipeIngredients_Ingredients_Ingredient_id" FOREIGN KEY ("Ingredient_id") REFERENCES "Ingredients" ("Ingredient_id") ON DELETE CASCADE,
    CONSTRAINT "FK_RecipeIngredients_Recipe_Recipe_id" FOREIGN KEY ("Recipe_id") REFERENCES "Recipe" ("Recipe_id") ON DELETE CASCADE
);

CREATE TABLE "RecipeLabel" (
    "Id" uuid NOT NULL,
    "Rt_Id" uuid NOT NULL,
    "Recipe_Id" uuid NOT NULL,
    CONSTRAINT "PK_RecipeLabel" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_RecipeLabel_Recipe_Recipe_Id" FOREIGN KEY ("Recipe_Id") REFERENCES "Recipe" ("Recipe_id") ON DELETE CASCADE,
    CONSTRAINT "FK_RecipeLabel_Recipe_tag_Rt_Id" FOREIGN KEY ("Rt_Id") REFERENCES "Recipe_tag" ("Rt_Id") ON DELETE CASCADE
);

CREATE TABLE "SavedRecipe" (
    "Id" uuid NOT NULL,
    "Collection_Id" uuid NOT NULL,
    "Recipe_Id" uuid NOT NULL,
    "Account_id" uuid,
    CONSTRAINT "PK_SavedRecipe" PRIMARY KEY ("Id"),
    CONSTRAINT "FK_SavedRecipe_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id"),
    CONSTRAINT "FK_SavedRecipe_Collection_Collection_Id" FOREIGN KEY ("Collection_Id") REFERENCES "Collection" ("Collection_id") ON DELETE CASCADE,
    CONSTRAINT "FK_SavedRecipe_Recipe_Recipe_Id" FOREIGN KEY ("Recipe_Id") REFERENCES "Recipe" ("Recipe_id") ON DELETE CASCADE
);

CREATE TABLE "GroceryItems" (
    "Item_id" uuid NOT NULL,
    "List_id" uuid NOT NULL,
    "Ingredient_id" uuid NOT NULL,
    "Product_id" uuid,
    "Quantity" double precision NOT NULL,
    "Unit" text NOT NULL,
    "IsPurchased" boolean NOT NULL,
    "Field" text NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_GroceryItems" PRIMARY KEY ("Item_id"),
    CONSTRAINT "FK_GroceryItems_AffiliateProducts_Product_id" FOREIGN KEY ("Product_id") REFERENCES "AffiliateProducts" ("Product_id"),
    CONSTRAINT "FK_GroceryItems_GroceryLists_List_id" FOREIGN KEY ("List_id") REFERENCES "GroceryLists" ("List_id") ON DELETE CASCADE,
    CONSTRAINT "FK_GroceryItems_Ingredients_Ingredient_id" FOREIGN KEY ("Ingredient_id") REFERENCES "Ingredients" ("Ingredient_id") ON DELETE CASCADE
);

CREATE INDEX "IX_AffiliateProducts_Ingredient_id" ON "AffiliateProducts" ("Ingredient_id");

CREATE INDEX "IX_AffiliateProducts_Partner_id" ON "AffiliateProducts" ("Partner_id");

CREATE INDEX "IX_Allergies_Account_id" ON "Allergies" ("Account_id");

CREATE INDEX "IX_Allergies_Ingredient_id" ON "Allergies" ("Ingredient_id");

CREATE INDEX "IX_BmiLog_Account_id" ON "BmiLog" ("Account_id");

CREATE INDEX "IX_Collection_Account_id" ON "Collection" ("Account_id");

CREATE INDEX "IX_ConditionDietRecommendation_Condition_id" ON "ConditionDietRecommendation" ("Condition_id");

CREATE INDEX "IX_ConditionDietRecommendation_Diet_id" ON "ConditionDietRecommendation" ("Diet_id");

CREATE INDEX "IX_Feedback_Account_id" ON "Feedback" ("Account_id");

CREATE INDEX "IX_GroceryItems_Ingredient_id" ON "GroceryItems" ("Ingredient_id");

CREATE INDEX "IX_GroceryItems_List_id" ON "GroceryItems" ("List_id");

CREATE INDEX "IX_GroceryItems_Product_id" ON "GroceryItems" ("Product_id");

CREATE INDEX "IX_GroceryLists_Account_id" ON "GroceryLists" ("Account_id");

CREATE INDEX "IX_HealthProfile_Account_id" ON "HealthProfile" ("Account_id");

CREATE INDEX "IX_IngredientLabels_Ingredient_id" ON "IngredientLabels" ("Ingredient_id");

CREATE INDEX "IX_IngredientLabels_It_id" ON "IngredientLabels" ("It_id");

CREATE UNIQUE INDEX "IX_IngredientTags_Name" ON "IngredientTags" ("Name");

CREATE UNIQUE INDEX "IX_NutritionalValues_Ingredient_id" ON "NutritionalValues" ("Ingredient_id");

CREATE INDEX "IX_NutritionGoal_Account_id" ON "NutritionGoal" ("Account_id");

CREATE INDEX "IX_NutritionLog_Account_id" ON "NutritionLog" ("Account_id");

CREATE INDEX "IX_NutritionLog_Ingredient_id" ON "NutritionLog" ("Ingredient_id");

CREATE INDEX "IX_NutritionLog_Recipe_id" ON "NutritionLog" ("Recipe_id");

CREATE INDEX "IX_Pantries_Account_id" ON "Pantries" ("Account_id");

CREATE INDEX "IX_Pantries_Ingredient_id" ON "Pantries" ("Ingredient_id");

CREATE INDEX "IX_Recipe_Account_id" ON "Recipe" ("Account_id");

CREATE UNIQUE INDEX "IX_Recipe_tag_Name" ON "Recipe_tag" ("Name");

CREATE INDEX "IX_RecipeIngredients_Ingredient_id" ON "RecipeIngredients" ("Ingredient_id");

CREATE INDEX "IX_RecipeIngredients_Recipe_id" ON "RecipeIngredients" ("Recipe_id");

CREATE INDEX "IX_RecipeLabel_Recipe_Id" ON "RecipeLabel" ("Recipe_Id");

CREATE INDEX "IX_RecipeLabel_Rt_Id" ON "RecipeLabel" ("Rt_Id");

CREATE INDEX "IX_SavedRecipe_Account_id" ON "SavedRecipe" ("Account_id");

CREATE INDEX "IX_SavedRecipe_Collection_Id" ON "SavedRecipe" ("Collection_Id");

CREATE INDEX "IX_SavedRecipe_Recipe_Id" ON "SavedRecipe" ("Recipe_Id");

CREATE INDEX "IX_Subscription_Account_id" ON "Subscription" ("Account_id");

CREATE INDEX "IX_Subscription_Plan_id" ON "Subscription" ("Plan_id");

CREATE INDEX "IX_UserCondition_Account_id" ON "UserCondition" ("Account_id");

CREATE INDEX "IX_UserCondition_Condition_id" ON "UserCondition" ("Condition_id");

CREATE INDEX "IX_UserDietPlan_Account_id" ON "UserDietPlan" ("Account_id");

CREATE INDEX "IX_UserDietPlan_Diet_id" ON "UserDietPlan" ("Diet_id");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260623123713_InitialCreate', '8.0.11');

COMMIT;

START TRANSACTION;

ALTER TABLE "UserDietPlan" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "UserCondition" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Subscription" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "SavedRecipe" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "RecipeLabel" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "RecipeIngredients" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Recipe_tag" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Recipe" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Plan" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "NutritionLog" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "MedicalCondition" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "HealthProfile" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "DietPlan" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "ConditionDietRecommendation" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

ALTER TABLE "Collection" ADD "IsDeleted" boolean NOT NULL DEFAULT FALSE;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260623153431_AddIsDeletedColumns', '8.0.11');

COMMIT;

START TRANSACTION;

ALTER TABLE "NutritionGoal" ADD "TargetCholesterol" double precision;

ALTER TABLE "NutritionGoal" ADD "TargetSalt" double precision;

ALTER TABLE "NutritionGoal" ADD "TargetSugar" double precision;

ALTER TABLE "HealthProfile" ADD "TargetWeight" double precision;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260717124428_AddTargetWeight', '8.0.11');

COMMIT;

START TRANSACTION;

ALTER TABLE "HealthProfile" ADD "TargetWeeks" integer;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260717134050_AddTargetWeeksToHealthProfile', '8.0.11');

COMMIT;

START TRANSACTION;

ALTER TABLE "RecipeIngredients" ADD "IsPrimary" boolean NOT NULL DEFAULT FALSE;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260718065745_AddIsPrimaryToRecipeIngredient', '8.0.11');

COMMIT;

START TRANSACTION;

DROP TABLE "Feedback";

ALTER TABLE "NutritionalValues" ADD "EverydayUnit" text;

ALTER TABLE "NutritionalValues" ADD "EverydayWeight" double precision;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260719161342_AddEverydayUnitToNutritionalValue', '8.0.11');

COMMIT;

START TRANSACTION;

ALTER TABLE "Subscription" ADD "PricePaid" numeric(18,2) NOT NULL DEFAULT 0.0;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260719163144_AddPricePaidToSubscription', '8.0.11');

COMMIT;

START TRANSACTION;

ALTER TABLE "HealthProfile" ADD "BudgetLevel" character varying(20);

ALTER TABLE "HealthProfile" ADD "CookingTimeMinutes" integer;

ALTER TABLE "HealthProfile" ADD "DietType" character varying(30);

ALTER TABLE "HealthProfile" ADD "MealsPerDay" integer;

ALTER TABLE "HealthProfile" ADD "PlanCycleDays" integer;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260720090611_AddSurveyPreferencesPhase1', '8.0.11');

COMMIT;

START TRANSACTION;

CREATE TABLE "MealPlan" (
    "MealPlan_id" uuid NOT NULL,
    "Account_id" uuid NOT NULL,
    "Status" character varying(20) NOT NULL,
    "StartDate" timestamp with time zone,
    "EndDate" timestamp with time zone,
    "TotalDays" integer NOT NULL,
    "GeneratedAt" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_MealPlan" PRIMARY KEY ("MealPlan_id"),
    CONSTRAINT "FK_MealPlan_Account_Account_id" FOREIGN KEY ("Account_id") REFERENCES "Account" ("Account_id") ON DELETE CASCADE
);

CREATE TABLE "MealPlanDay" (
    "Day_id" uuid NOT NULL,
    "MealPlan_id" uuid NOT NULL,
    "DayIndex" integer NOT NULL,
    "DayDate" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_MealPlanDay" PRIMARY KEY ("Day_id"),
    CONSTRAINT "FK_MealPlanDay_MealPlan_MealPlan_id" FOREIGN KEY ("MealPlan_id") REFERENCES "MealPlan" ("MealPlan_id") ON DELETE CASCADE
);

CREATE TABLE "MealPlanEntry" (
    "Entry_id" uuid NOT NULL,
    "Day_id" uuid NOT NULL,
    "Recipe_id" uuid NOT NULL,
    "MealSlot" character varying(20) NOT NULL,
    "SlotCalories" double precision NOT NULL,
    "SlotProtein" double precision NOT NULL,
    "SlotCarbs" double precision NOT NULL,
    "SlotFat" double precision NOT NULL,
    "SlotFiber" double precision NOT NULL,
    "SortOrder" integer NOT NULL,
    "IsDeleted" boolean NOT NULL,
    CONSTRAINT "PK_MealPlanEntry" PRIMARY KEY ("Entry_id"),
    CONSTRAINT "FK_MealPlanEntry_MealPlanDay_Day_id" FOREIGN KEY ("Day_id") REFERENCES "MealPlanDay" ("Day_id") ON DELETE CASCADE,
    CONSTRAINT "FK_MealPlanEntry_Recipe_Recipe_id" FOREIGN KEY ("Recipe_id") REFERENCES "Recipe" ("Recipe_id") ON DELETE CASCADE
);

CREATE INDEX "IX_MealPlan_Account_id" ON "MealPlan" ("Account_id");

CREATE INDEX "IX_MealPlanDay_MealPlan_id" ON "MealPlanDay" ("MealPlan_id");

CREATE INDEX "IX_MealPlanEntry_Day_id" ON "MealPlanEntry" ("Day_id");

CREATE INDEX "IX_MealPlanEntry_Recipe_id" ON "MealPlanEntry" ("Recipe_id");

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260720105441_AddMealPlanningEngine', '8.0.11');

COMMIT;

START TRANSACTION;

ALTER TABLE "HealthProfile" RENAME COLUMN "TargetWeeks" TO "TargetDays";

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260722024901_RenameTargetWeeksToTargetDays', '8.0.11');

COMMIT;

