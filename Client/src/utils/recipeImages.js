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
  'trứng chiên lá mơ lông': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022688/smartmeal_dish_1.jpg',
  'bánh trứng sữa nướng': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022689/smartmeal_dish_2.jpg',
  'trứng chiên chay làm từ óc đậu': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022690/smartmeal_dish_3.jpg',
  'mì udon bò trứng bukkake': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022691/smartmeal_dish_5.jpg',
  'burrito trứng': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022691/smartmeal_dish_9.jpg',
  'tamago onsen (trứng chần kiểu nhật)': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022692/smartmeal_dish_11.jpg',
  'bánh tổ chiên trứng gà': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022693/smartmeal_dish_13.jpg',
  'trứng gà ngâm tương': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022694/smartmeal_dish_15.jpg',
  'trứng chiên lá lốt': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784022694/smartmeal_dish_17.jpg',
  '💚 trứng chiên lá mơ lông': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784023981/smartmeal_scraped_1.jpg',
  'trứng chiên cá hộp': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784023985/smartmeal_scraped_2.jpg',
  'mì udon bò trứng bukkake (beef ontama bukkake udon)': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784023990/smartmeal_scraped_3.jpg',
  'sá bấu chiên trứng': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784023998/smartmeal_scraped_4.jpg',
  'tamago onsen(trứng chần kiểu nhật)': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024001/smartmeal_scraped_5.jpg',
  'bánh roti đơn giản từ bột mì – ăn kèm trứng': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024004/smartmeal_scraped_6.jpg',
  'trứng chần không dùng giấm': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024009/smartmeal_scraped_7.jpg',
  'mâm cơm eatwell: bò xào, trứng ốp, cải chíp xào': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024012/smartmeal_scraped_8.jpg',
  'rau luộc và trứng luộc': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024016/smartmeal_scraped_9.jpg',
  'cá hộp chưng trứng thịt băm': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024019/smartmeal_scraped_10.jpg',
  'cơm chiên trứng': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024023/smartmeal_scraped_11.jpg',
  'trứng đúc thịt hấp nồi cơm': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024026/smartmeal_scraped_12.jpg',
  'thịt xay rim trứng': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024030/smartmeal_scraped_13.jpg',
  'trứng sốt cay': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024033/smartmeal_scraped_14.jpg',
  'trứng rim cà chua nấm': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024036/smartmeal_scraped_15.jpg',
  'sườn cánh buồm kho trứng': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024039/smartmeal_scraped_16.jpg',
  'trứng nướng tôm thịt bằng nồi chiên không dầu': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024042/smartmeal_scraped_17.jpg',
  'trứng sốt nước mắm tỏi ớt': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024046/smartmeal_scraped_18.jpg',
  'trứng chiên hàu': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024049/smartmeal_scraped_19.jpg',
  'sandwich trứng phô mai': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024052/smartmeal_scraped_20.jpg',
  'bánh mì nướng sốt dầu trứng siêu ngonnnn': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024056/smartmeal_scraped_21.jpg',
  'cơm phủ trứng chiên tôm 🍚🥚🦐': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024059/smartmeal_scraped_22.jpg',
  'trứng phục sinh': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024062/smartmeal_scraped_23.jpg',
  'cơm chiên trứng lạp xưởng rau củ': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024065/smartmeal_scraped_24.jpg',
  'trứng cuộn rong biển': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024068/smartmeal_scraped_25.jpg',
  'trứng chưng cà chua hành tây': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024071/smartmeal_scraped_26.jpg',
  'trứng chiên chả': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024074/smartmeal_scraped_27.jpg',
  'trứng chiên tôm và hải sản': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024077/smartmeal_scraped_28.jpg',
  'trứng chiên thịt xay thì là': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024080/smartmeal_scraped_29.jpg',
  'bánh ướt chiên trứng': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024083/smartmeal_scraped_30.jpg',
  'gato kem trứng cốt dừa': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024086/smartmeal_scraped_31.jpg',
  'thịt kho trứng sốt tiêu': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024089/smartmeal_scraped_32.jpg',
  'cơm phủ trứng hải sản': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024092/smartmeal_scraped_33.jpg',
  'trứng ngâm tương': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024095/smartmeal_scraped_34.jpg',
  'trứng gà tiềm ngải cứu, hạt sen, táo đỏ': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024098/smartmeal_scraped_35.jpg',
  'mì soba lạnh với trứng gà đen nhật': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024101/smartmeal_scraped_36.jpg',
  'bánh tráng trộn trứng gà': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024104/smartmeal_scraped_37.jpg',
  'các cách chiên trứng ốp la đơn giản nhất': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024107/smartmeal_scraped_38.jpg',
  'soufflé (bánh trứng phồng)': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024110/smartmeal_scraped_39.jpg',
  'bò trứng sốt cà': 'https://res.cloudinary.com/desguhlr2/image/upload/v1784024114/smartmeal_scraped_40.jpg',
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
