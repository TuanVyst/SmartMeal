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
  '💚 trứng chiên lá mơ lông': 'trung-chien-la-mo-long.jpg',
  'bánh tổ chiên trứng gà': 'banh-to-chien-trung-ga.jpg',
  'trứng chiên cá hộp': 'trung-chien-ca-hop.jpg',
  'burrito trứng': 'burrito-trung.jpg',
  'trứng chần không dùng giấm': 'trung-chan-khong-dung-giam.jpg',
  'trứng gà ngâm tương': 'trung-ga-ngam-tuong.jpg',
  'trứng cuộn hàn quốc': 'trung-cuon-han-quoc.jpg',
  'cá hộp chưng trứng thịt băm': 'ca-hop-chung-trung-thit-bam.jpg',
  'trứng chiên lá lốt': 'trung-chien-la-lot.jpg',
  'trứng đúc thịt hấp nồi cơm': 'trung-duc-thit-hap-noi-com.jpg',
  'thịt xay rim trứng': 'thit-xay-rim-trung.jpg',
  'trứng sốt cay': 'trung-sot-cay.jpg',
  'trứng rim cà chua nấm': 'trung-rim-ca-chua-nam.jpg',
  'sườn cánh buồm kho trứng': 'suon-canh-buom-kho-trung.jpg',
  'trứng sốt nước mắm tỏi ớt': 'trung-sot-nuoc-mam-toi-ot.jpg',
  'trứng chiên hàu': 'trung-chien-hau.jpg',
  'sandwich trứng phô mai': 'sandwich-trung-pho-mai.jpg',
  'trứng bọc thịt chiên xù': 'trung-boc-thit-chien-xu.jpg',
  'trứng cuộn rong biển': 'trung-cuon-rong-bien.jpg',
  'trứng chưng cà chua hành tây': 'trung-chung-ca-chua-hanh-tay.jpg',
  'canh trứng cà chua': 'canh-trung-ca-chua.jpg',
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
  // encodeURIComponent breaks Vietnamese filenames on some servers.
  // Use a manual encode that only encodes '#', '?', '%' but keeps Unicode + spaces.
  const safe = filename.replace(/%/g, '%25').replace(/#/g, '%23').replace(/\?/g, '%3F');
  return `${RECIPE_IMAGE_BASE}/${safe}`;
}

export function resolveRecipeImageUrl(recipeName) {
  if (!recipeName) return FALLBACK_MEAL_IMAGE;

  const normalizedName = recipeName.trim().toLowerCase();
  if (LAU_RECIPES.has(normalizedName)) return FALLBACK_MEAL_IMAGE;

  const aliasFilename = RECIPE_IMAGE_ALIASES[normalizedName];
  if (aliasFilename) {
    if (aliasFilename.startsWith('http://') || aliasFilename.startsWith('https://')) {
      return aliasFilename;
    }
    return buildRecipeImageUrl(aliasFilename);
  }

  const directFilename = filenameByLowerTitle.get(normalizedName);
  if (directFilename) return buildRecipeImageUrl(directFilename);

  return FALLBACK_MEAL_IMAGE;
}
