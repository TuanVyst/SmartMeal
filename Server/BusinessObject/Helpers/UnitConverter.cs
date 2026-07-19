using System;

namespace BusinessObject.Helpers
{
    public static class UnitConverter
    {
        // Standard conversions to grams/ml for fixed units
        public static double GetStandardWeightFactor(string unit)
        {
            if (string.IsNullOrEmpty(unit)) return 1.0;
            
            var u = unit.Trim().ToLower();
            switch (u)
            {
                case "g":
                case "gram":
                case "grams":
                    return 1.0;
                case "kg":
                case "kilogram":
                case "kilograms":
                    return 1000.0;
                case "ml":
                case "milliliter":
                case "milliliters":
                    return 1.0;
                case "l":
                case "liter":
                case "lit":
                case "lít":
                    return 1000.0;
                case "tsp":
                case "teaspoon":
                case "teaspoons":
                case "thìa cà phê":
                case "muỗng cà phê":
                case "tcp":
                case "mcp":
                    return 5.0;
                case "tbsp":
                case "tablespoon":
                case "tablespoons":
                case "thìa canh":
                case "muỗng canh":
                case "thìa súp":
                case "muỗng súp":
                    return 15.0;
                case "cup":
                case "chén":
                case "bát":
                case "cốc":
                    return 240.0;
                default:
                    return 1.0;
            }
        }

        // Get estimated weight in grams for count-based units (piece, quả, tép...) based on ingredient name
        public static double GetEstimateWeightForPiece(string ingredientName, string unit, double? everydayWeight = null)
        {
            if (everydayWeight.HasValue && everydayWeight.Value > 0)
            {
                return everydayWeight.Value;
            }

            if (string.IsNullOrEmpty(ingredientName)) return 1.0;
            
            var name = ingredientName.Trim().ToLower();
            var u = (unit ?? "").Trim().ToLower();

            // Check if unit is a garlic clove (tép, nhánh)
            if (u == "tép" || u == "nhánh" || u == "clove" || u == "cloves")
            {
                return 3.0; // 1 tép tỏi ~ 3g
            }

            if (name.Contains("trứng")) return 50.0; // 1 quả trứng ~ 50g
            if (name.Contains("bánh mì")) return 80.0; // 1 cái bánh mì ~ 80g
            if (name.Contains("cà chua")) return 120.0; // 1 quả ~ 120g

            return 100.0; // default estimate
        }

        // Calculate the multiplier to scale ingredient nutrition
        public static double GetMultiplier(double quantity, string uom, double servingSize, string servingUnit, string ingredientName, double? everydayWeight = null)
        {
            if (servingSize <= 0) servingSize = 100.0;

            var rUnit = (uom ?? "").Trim().ToLower();
            var sUnit = (servingUnit ?? "").Trim().ToLower();

            // 1. If units are identical, do a direct ratio
            if (rUnit == sUnit)
            {
                return quantity / servingSize;
            }

            // 2. Normalize both to absolute weight (grams/ml)
            double rWeightFactor = GetStandardWeightFactor(rUnit);
            double sWeightFactor = GetStandardWeightFactor(sUnit);

            // Is the recipe unit a piece/count unit?
            bool isRecipeUnitPiece = rUnit == "piece" || rUnit == "quả" || rUnit == "trái" || rUnit == "củ" || rUnit == "cái" || rUnit == "tép" || rUnit == "nhánh";
            // Is the serving unit a piece/count unit?
            bool isServingUnitPiece = sUnit == "piece" || sUnit == "quả" || sUnit == "trái" || sUnit == "củ" || sUnit == "cái" || sUnit == "tép" || sUnit == "nhánh";

            double recipeWeight = quantity;
            if (isRecipeUnitPiece)
            {
                recipeWeight = quantity * GetEstimateWeightForPiece(ingredientName, rUnit, everydayWeight);
            }
            else
            {
                recipeWeight = quantity * rWeightFactor;
            }

            double servingWeight = servingSize;
            if (isServingUnitPiece)
            {
                servingWeight = servingSize * GetEstimateWeightForPiece(ingredientName, sUnit, everydayWeight);
            }
            else
            {
                servingWeight = servingSize * sWeightFactor;
            }

            return recipeWeight / servingWeight;
        }
    }
}
