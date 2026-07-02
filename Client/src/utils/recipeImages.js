export const FALLBACK_MEAL_IMAGE =
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop';

const RECIPE_IMAGE_BASE = '/images/recipes';

const LAU_RECIPES = new Set(['lẩu thái chua cay', 'lẩu nấm chay']);

const RECIPE_IMAGE_ALIASES = {
  'bánh mì trứng ốp la': 'Bánh mì.jpg',
  'mì quảng gà': 'Mì quảng.jpg',
  'stir-fry thịt bò và bông cải': 'Bò xào bông cải xanh.jpg',
  'cá chiên sả ớt': 'cá diêu hồng chiên xả ớt.jpg',
  'canh chua chay': 'Canh chua cá lóc.jpg',
  'cơm chiên dương châu chay': 'Cơm chiên Dương Châu chay.jpg',
};

const RECIPE_IMAGE_FILES = [
  'Bánh cuốn.jpg',
  'Bánh mì.jpg',
  'Bò lúc lắc.jpg',
  'Bò xào bông cải xanh.jpg',
  'Bún bò huế.jpg',
  'Bún chả Hà Nội.jpg',
  'Bún riêu cua.jpg',
  'Canh bí đỏ thịt băm.jpg',
  'Canh chua cá lóc.jpg',
  'Canh rau ngót thịt băm.jpg',
  'Cháo gà.jpg',
  'Chè bắp.jpg',
  'Cá hồi áp chảo sốt bơ tỏi.jpg',
  'Cá kho tộ.jpg',
  'Cơm chiên Dương Châu chay.jpg',
  'Cơm gà hội an.jpg',
  'Cơm rang dưa bò.jpg',
  'Cơm sườn nướng.jpg',
  'Cơm tấm sườn bì chả.jpg',
  'Gà chiên mắm.jpg',
  'Gà rang muối.jpg',
  'Hủ tiếu Nam Vang.jpg',
  'Mì quảng.jpg',
  'Mì xào hải sản.jpg',
  'Nem rán.jpg',
  'Phở gà.jpg',
  'Sinh tố bơ chuối.jpg',
  'Spaghetti bò bằm.jpg',
  'Súp bí ngô kem.jpg',
  'Sườn nướng BBQ.jpg',
  'Thịt kho trứng.jpg',
  'Tôm chiên xù.jpg',
  'Tôm rang thịt.jpg',
  'Xôi xéo.jpg',
  'cá diêu hồng chiên xả ớt.jpg',
  'cá hú chiên xả ớt.jpg',
  'Đậu hủ kho nấm.jpg',
  'Đậu hủ sốt cà chua.jpg',
];

const filenameByLowerTitle = RECIPE_IMAGE_FILES.reduce((map, filename) => {
  const title = filename.replace(/\.jpg$/i, '');
  map.set(title.toLowerCase(), filename);
  return map;
}, new Map());

function buildRecipeImageUrl(filename) {
  return `${RECIPE_IMAGE_BASE}/${encodeURIComponent(filename)}`;
}

export function resolveRecipeImageUrl(recipeName) {
  if (!recipeName) return FALLBACK_MEAL_IMAGE;

  const normalizedName = recipeName.trim().toLowerCase();
  if (LAU_RECIPES.has(normalizedName)) return FALLBACK_MEAL_IMAGE;

  const aliasFilename = RECIPE_IMAGE_ALIASES[normalizedName];
  if (aliasFilename) return buildRecipeImageUrl(aliasFilename);

  const directFilename = filenameByLowerTitle.get(normalizedName);
  if (directFilename) return buildRecipeImageUrl(directFilename);

  return FALLBACK_MEAL_IMAGE;
}
