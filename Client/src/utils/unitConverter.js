export function getStandardWeightFactor(unit) {
  if (!unit) return 1.0;
  const u = unit.trim().toLowerCase();
  switch (u) {
    case 'g':
    case 'gram':
    case 'grams':
      return 1.0;
    case 'kg':
    case 'kilogram':
    case 'kilograms':
      return 1000.0;
    case 'ml':
    case 'milliliter':
    case 'milliliters':
      return 1.0;
    case 'l':
    case 'liter':
    case 'lit':
    case 'lít':
      return 1000.0;
    case 'tsp':
    case 'teaspoon':
    case 'teaspoons':
    case 'thìa cà phê':
    case 'muỗng cà phê':
    case 'tcp':
    case 'mcp':
      return 5.0;
    case 'tbsp':
    case 'tablespoon':
    case 'tablespoons':
    case 'thìa canh':
    case 'muỗng canh':
    case 'thìa súp':
    case 'muỗng súp':
      return 15.0;
    case 'cup':
    case 'chén':
    case 'bát':
    case 'cốc':
      return 240.0;
    default:
      return 1.0;
  }
}

export function getEstimateWeightForPiece(ingredientName, unit, everydayWeight = null) {
  if (everydayWeight && everydayWeight > 0) {
    return everydayWeight;
  }

  if (!ingredientName) return 1.0;
  const name = ingredientName.trim().toLowerCase();
  const u = (unit || '').trim().toLowerCase();

  if (u === 'tép' || u === 'nhánh' || u === 'clove' || u === 'cloves') {
    return 3.0; // 1 tép tỏi ~ 3g
  }

  if (name.includes('trứng')) return 50.0;
  if (name.includes('bánh mì')) return 80.0;
  if (name.includes('cà chua')) return 120.0;

  return 100.0; // default estimate
}

export function getMultiplier(quantity, uom, servingSize, servingUnit, ingredientName, everydayWeight = null) {
  const size = servingSize || 100.0;
  if (size <= 0) return 1.0;

  const rUnit = (uom || '').trim().toLowerCase();
  const sUnit = (servingUnit || '').trim().toLowerCase();

  // 1. If units are identical, do a direct ratio
  if (rUnit === sUnit) {
    return quantity / size;
  }

  // 2. Normalize both to absolute weight (grams/ml)
  const rWeightFactor = getStandardWeightFactor(rUnit);
  const sWeightFactor = getStandardWeightFactor(sUnit);

  const isRecipeUnitPiece = ['piece', 'quả', 'trái', 'củ', 'cái', 'tép', 'nhánh'].includes(rUnit);
  const isServingUnitPiece = ['piece', 'quả', 'trái', 'củ', 'cái', 'tép', 'nhánh'].includes(sUnit);

  let recipeWeight = quantity;
  if (isRecipeUnitPiece) {
    recipeWeight = quantity * getEstimateWeightForPiece(ingredientName, rUnit, everydayWeight);
  } else {
    recipeWeight = quantity * rWeightFactor;
  }

  let servingWeight = size;
  if (isServingUnitPiece) {
    servingWeight = size * getEstimateWeightForPiece(ingredientName, sUnit, everydayWeight);
  } else {
    servingWeight = size * sWeightFactor;
  }

  return recipeWeight / servingWeight;
}
