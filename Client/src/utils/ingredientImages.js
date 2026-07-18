export const FALLBACK_INGREDIENT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150&h=150&auto=format&fit=crop';

const INGREDIENT_STATIC_IMAGES = {
  'cà chua': 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=150&h=150&q=80',
  'thịt gà': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=150&h=150&q=80',
  'tỏi': 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=150&h=150&q=80',
  'chanh': 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=150&h=150&q=80',
  'hành tây': 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=150&h=150&q=80',
  'mật ong': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=150&h=150&q=80',
  'tiêu đen': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=150&h=150&q=80',
  'đậu bắp': 'https://images.unsplash.com/photo-1627910543666-896238b7e089?auto=format&fit=crop&w=150&h=150&q=80',
  'rau ngót': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=150&h=150&q=80',
  'rau mùi': 'https://images.unsplash.com/photo-1591871937475-ed95f87f7ae8?auto=format&fit=crop&w=150&h=150&q=80',
  'bông cải xanh': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=150&h=150&q=80',
  'bơ': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=150&h=150&q=80',
  'nấm': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=150&h=150&q=80',
  'trứng': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=150&h=150&q=80',
  'thịt bò': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&h=150&q=80',
  'thịt heo': 'https://images.unsplash.com/photo-1602484789369-026048d88e40?auto=format&fit=crop&w=150&h=150&q=80',
  'tôm': 'https://images.unsplash.com/photo-1559742811-82410b5104ca?auto=format&fit=crop&w=150&h=150&q=80',
  'cá': 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=150&h=150&q=80',
  'gạo': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=150&h=150&q=80',
  'sữa': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=150&h=150&q=80',
  'muối': 'https://images.unsplash.com/photo-1595181774323-8cfb46571587?auto=format&fit=crop&w=150&h=150&q=80',
  'đường': 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=150&h=150&q=80',
  'dầu ăn': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=150&h=150&q=80',
  'nước mắm': 'https://images.unsplash.com/photo-1589135304675-e22b0704407b?auto=format&fit=crop&w=150&h=150&q=80'
};

export function resolveIngredientImageUrl(imageUrl, name) {
  if (!imageUrl) return FALLBACK_INGREDIENT_IMAGE;

  // If the imageUrl is a valid external URL, return it directly
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Look for name match in our predefined list of clean high-res Unsplash links
  if (name) {
    const normalizedName = name.trim().toLowerCase();
    
    // Exact match
    if (INGREDIENT_STATIC_IMAGES[normalizedName]) {
      return INGREDIENT_STATIC_IMAGES[normalizedName];
    }
    
    // Partial match search
    for (const [key, value] of Object.entries(INGREDIENT_STATIC_IMAGES)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return value;
      }
    }
  }

  return FALLBACK_INGREDIENT_IMAGE;
}
