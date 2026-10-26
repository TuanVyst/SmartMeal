// Mapping between AI model class names (from AI/src/smartmeal_predict/config.py)
// and Vietnamese display names + system ingredient aliases in the SmartMeal database.

export const INGREDIENT_NAMES_VN = {
  'Mushroom': 'Nấm',
  'Egg': 'Trứng gà',
  'Sweet Potato -Suthuni-': 'Khoai lang',
  'Taro Leaves -Karkalo-': 'Lá khoai môn',
  'Beetroot': 'Củ dền',
  'Potato': 'Khoai tây',
  'Capsicum': 'Ớt chuông',
  'Taro Root-Pidalu-': 'Củ khoai môn',
  'Turnip': 'Củ cải trắng',
  'Green Mint -Pudina-': 'Bạc hà',
  'Pointed Gourd -Chuche Karela-': 'Mướp đắng',
  'Stinging Nettle -Sisnu-': 'Cây tầm ma',
  'Bitter Gourd': 'Mướp đắng',
  'Snake Gourd -Chichindo-': 'Bầu non',
  'Fiddlehead Ferns -Niguro-': 'Rau dớn',
  'Palungo -Nepali Spinach-': 'Cải bó xôi',
  'Cabbage': 'Bắp cải',
  'Brinjal': 'Cà tím',
  'Bottle Gourd -Lauka-': 'Bầu non',
  'Tomato': 'Cà chua',
  'Onion': 'Hành tây',
  'Radish': 'Củ cải trắng',
  'Sponge Gourd -Ghiraula-': 'Mướp hương',
  'Red Lentils': 'Đậu đỏ',
  'Masyaura': 'Masyaura',
  'Okra -Bhindi-': 'Đậu bắp',
  'Chayote-iskus-': 'Su su',
  'Garden Peas': 'Đậu xanh',
  'Cheese': 'Phô mai',
  'Rayo ko Saag': 'Cải bẹ xanh',
  'Lapsi -Nepali Hog Plum-': 'Sấu xanh',
  'Artichoke': 'Bông atisô',
  'Banana': 'Chuối',
  'Cinnamon': 'Quế',
  'Bread': 'Bánh mì',
  'Jack Fruit': 'Mít',
  'Beans': 'Đậu que',
  'Asparagus -Kurilo-': 'Măng tây',
  'Gundruk': 'Dưa chua',
  'Avocado': 'Bơ',
  'Nutrela -Soya Chunks-': 'Đậu hủ',
  'Rice -Chamal-': 'Gạo',
  'Corn': 'Bắp',
  'Onion Leaves': 'Hành lá',
  'Tree Tomato -Rukh Tamatar-': 'Cà chua',
  'Carrot': 'Cà rốt',
  'Farsi ko Munta': 'Bí đỏ',
  'Coriander -Dhaniya-': 'Rau mùi',
  'Lemon -Nimbu-': 'Chanh',
  'Cassava -Ghar Tarul-': 'Khoai mì',
  'Pork': 'Thịt heo',
  'Cucumber': 'Dưa leo',
  'Black Lentils': 'Đậu lăng đen',
  'Ash Gourd -Kubhindo-': 'Bí đao',
};

// Candidate Vietnamese system ingredient names for each AI class so that
// detected classes accurately resolve to system ingredient_id items in the database.
export const INGREDIENT_ALIASES_VN = {
  'Mushroom': ['Nấm', 'Nấm đông cô', 'Mộc nhĩ'],
  'Egg': ['Trứng gà', 'Trứng', 'Hột vịt muối'],
  'Sweet Potato -Suthuni-': ['Khoai lang'],
  'Taro Leaves -Karkalo-': ['Lá khoai môn', 'Rau lang'],
  'Beetroot': ['Củ dền', 'Rau dền đỏ'],
  'Potato': ['Khoai tây'],
  'Capsicum': ['Ớt chuông', 'Ớt sừng', 'Ớt tươi'],
  'Taro Root-Pidalu-': ['Củ khoai môn', 'Khoai môn'],
  'Turnip': ['Củ cải trắng', 'Củ cải'],
  'Green Mint -Pudina-': ['Bạc hà', 'Rau thơm'],
  'Pointed Gourd -Chuche Karela-': ['Mướp đắng', 'Khổ qua'],
  'Stinging Nettle -Sisnu-': ['Cây tầm ma'],
  'Bitter Gourd': ['Mướp đắng', 'Khổ qua'],
  'Snake Gourd -Chichindo-': ['Bầu non', 'Bầu'],
  'Fiddlehead Ferns -Niguro-': ['Rau dớn'],
  'Palungo -Nepali Spinach-': ['Cải bó xôi', 'Rau bina', 'Rau mồng tơi'],
  'Cabbage': ['Bắp cải', 'Bắp cải tím'],
  'Brinjal': ['Cà tím', 'Cà pháo trắng'],
  'Bottle Gourd -Lauka-': ['Bầu non', 'Bầu'],
  'Tomato': ['Cà chua', 'Tương cà'],
  'Onion': ['Hành tây', 'Hành tím'],
  'Radish': ['Củ cải trắng', 'Củ cải'],
  'Sponge Gourd -Ghiraula-': ['Mướp hương', 'Mướp'],
  'Red Lentils': ['Đậu đỏ', 'Đậu lăng đỏ'],
  'Masyaura': ['Masyaura'],
  'Okra -Bhindi-': ['Đậu bắp'],
  'Chayote-iskus-': ['Su su'],
  'Garden Peas': ['Đậu xanh', 'Đậu Hà Lan', 'Đậu que'],
  'Cheese': ['Phô mai'],
  'Rayo ko Saag': ['Cải bẹ xanh', 'Cải Rayo'],
  'Lapsi -Nepali Hog Plum-': ['Sấu xanh', 'Quả Lapsi'],
  'Artichoke': ['Bông atisô', 'Atisô'],
  'Banana': ['Chuối', 'Bắp chuối'],
  'Cinnamon': ['Quế', 'Ngũ vị hương'],
  'Bread': ['Bánh mì', 'Bánh mì sandwich'],
  'Jack Fruit': ['Mít'],
  'Beans': ['Đậu que', 'Đậu xanh', 'Đậu đỏ'],
  'Asparagus -Kurilo-': ['Măng tây'],
  'Gundruk': ['Dưa chua', 'Gundruk'],
  'Avocado': ['Bơ'],
  'Nutrela -Soya Chunks-': ['Đậu hủ', 'Đậu nành khô'],
  'Rice -Chamal-': ['Gạo', 'Gạo nếp'],
  'Corn': ['Bắp'],
  'Onion Leaves': ['Hành lá', 'Hẹ'],
  'Tree Tomato -Rukh Tamatar-': ['Cà chua'],
  'Carrot': ['Cà rốt'],
  'Farsi ko Munta': ['Bí đỏ', 'Ngọn bí'],
  'Coriander -Dhaniya-': ['Rau mùi', 'Ngò rí'],
  'Lemon -Nimbu-': ['Chanh'],
  'Cassava -Ghar Tarul-': ['Khoai mì'],
  'Pork': ['Thịt heo', 'Sườn sụn', 'Da heo'],
  'Cucumber': ['Dưa leo'],
  'Black Lentils': ['Đậu lăng đen', 'Đậu đen'],
  'Ash Gourd -Kubhindo-': ['Bí đao'],
};

export function normalizeVietnamese(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

export function getVietnameseLabel(rawName) {
  if (!rawName) return '';
  return INGREDIENT_NAMES_VN[rawName] || rawName;
}

/**
 * Given a list of AI detections (or raw/VN ingredient names) and the list of system ingredients
 * from the backend, returns the matched system ingredient objects.
 */
export function matchDetectedToSystemIngredients(detectedItems = [], systemIngredients = []) {
  if (!Array.isArray(detectedItems) || !Array.isArray(systemIngredients) || systemIngredients.length === 0) {
    return [];
  }

  const matchedIds = new Set();
  const matchedIngredients = [];

  // Normalize all system ingredients once
  const normalizedSystem = systemIngredients.map((ing) => ({
    ing,
    normName: normalizeVietnamese(ing.name || ing.Name || ''),
  }));

  for (const item of detectedItems) {
    const rawName = typeof item === 'string' ? item : (item?.rawName || item?.name || item?.class_name || '');
    const vnName = typeof item === 'object' && item?.vnName ? item.vnName : getVietnameseLabel(rawName);

    const candidates = [
      ...(INGREDIENT_ALIASES_VN[rawName] || []),
      vnName,
      rawName,
    ].filter(Boolean);

    const normCandidates = candidates.map(normalizeVietnamese).filter(Boolean);

    // 1. Try exact match on any candidate in priority order
    let foundAny = false;
    for (const cand of normCandidates) {
      for (const { ing, normName } of normalizedSystem) {
        if (normName && normName === cand) {
          const id = ing.ingredient_id || ing.Ingredient_id;
          if (id && !matchedIds.has(id)) {
            matchedIds.add(id);
            matchedIngredients.push(ing);
          }
          foundAny = true;
        }
      }
      if (foundAny) break;
    }

    // 2. Fallback: whole-word / substring match if no exact candidate matched
    if (!foundAny) {
      for (const cand of normCandidates) {
        for (const { ing, normName } of normalizedSystem) {
          if (!normName || !cand) continue;
          if (normName.includes(cand) || cand.includes(normName)) {
            const id = ing.ingredient_id || ing.Ingredient_id;
            if (id && !matchedIds.has(id)) {
              matchedIds.add(id);
              matchedIngredients.push(ing);
            }
            foundAny = true;
          }
        }
        if (foundAny) break;
      }
    }
  }

  return matchedIngredients;
}
