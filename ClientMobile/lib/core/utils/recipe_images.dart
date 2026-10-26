import 'package:flutter/foundation.dart';
import 'package:smart_meal/core/constants/api_constants.dart';

class RecipeImages {
  RecipeImages._();

  static const String fallback =
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop';

  static const Set<String> _lauRecipes = {
    'lẩu thái chua cay',
    'lẩu nấm chay',
  };

  static const Map<String, String> _aliases = {
    'bánh mì trứng ốp la': 'Bánh mì.jpg',
    'mì quảng gà': 'Mì quảng.jpg',
    'stir-fry thịt bò và bông cải': 'Bò xào bông cải xanh.jpg',
    'cá chiên sả ớt': 'cá diêu hồng chiên xả ớt.jpg',
    'canh chua chay': 'Canh chua cá lóc.jpg',
    'cơm chiên dương châu chay': 'Cơm chiên Dương Châu chay.jpg',
    '💚 trứng chiên lá mơ lông': 'trung-chien-la-mo-long.jpg',
    'trứng chiên lá mơ lông': 'trung-chien-la-mo-long.jpg',
    'bánh tổ chiên trứng gà': 'banh-to-chien-trung-ga.jpg',
    'trứng chiên cá hộp': 'trung-chien-ca-hop.jpg',
    'burrito trứng': 'burrito-trung.jpg',
    'trứng chần không dùng giấm': 'trung-chan-khong-dung-giam.jpg',
    'trứng gà ngâm tương': 'trung-ga-ngam-tuong.jpg',
    'trứng cuộn hàn quốc': 'trung-cuon-han-quoc.jpg',
    'trứng cuộn phô mai': 'trung-cuon-pho-mai.jpg',
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

  static const List<String> _recipeFiles = [
    'Bánh cuốn.jpg',
    'Bánh mì.jpg',
    'banh-to-chien-trung-ga.jpg',
    'Bò lúc lắc.jpg',
    'Bò xào bông cải xanh.jpg',
    'Bún bò huế.jpg',
    'Bún chả Hà Nội.jpg',
    'Bún riêu cua.jpg',
    'burrito-trung.jpg',
    'cá diêu hồng chiên xả ớt.jpg',
    'Cá hồi áp chảo sốt bơ tỏi.jpg',
    'cá hú chiên xả ớt.jpg',
    'Cá kho tộ.jpg',
    'ca-hop-chung-trung-thit-bam.jpg',
    'Canh bí đỏ thịt băm.jpg',
    'Canh chua cá lóc.jpg',
    'Canh rau ngót thịt băm.jpg',
    'canh-trung-ca-chua.jpg',
    'Cháo gà.jpg',
    'Chè bắp.jpg',
    'Cơm chiên Dương Châu chay.jpg',
    'Cơm gà hội an.jpg',
    'Cơm rang dưa bò.jpg',
    'Cơm sườn nướng.jpg',
    'Cơm tấm sườn bì chả.jpg',
    'Đậu hủ kho nấm.jpg',
    'Đậu hủ sốt cà chua.jpg',
    'Gà chiên mắm.jpg',
    'Gà rang muối.jpg',
    'Hủ tiếu Nam Vang.jpg',
    'Mì quảng.jpg',
    'Mì xào hải sản.jpg',
    'Nem rán.jpg',
    'Phở gà.jpg',
    'sandwich-trung-pho-mai.jpg',
    'Sinh tố bơ chuối.jpg',
    'Spaghetti bò bằm.jpg',
    'Sườn nướng BBQ.jpg',
    'suon-canh-buom-kho-trung.jpg',
    'Súp bí ngô kem.jpg',
    'Thịt kho trứng.jpg',
    'thit-xay-rim-trung.jpg',
    'Tôm chiên xù.jpg',
    'Tôm rang thịt.jpg',
    'trung-boc-thit-chien-xu.jpg',
    'trung-chan-khong-dung-giam.jpg',
    'trung-chien-ca-hop.jpg',
    'trung-chien-hau.jpg',
    'trung-chien-la-lot.jpg',
    'trung-chien-la-mo-long.jpg',
    'trung-chung-ca-chua-hanh-tay.jpg',
    'trung-cuon-han-quoc.jpg',
    'trung-cuon-pho-mai.jpg',
    'trung-cuon-rong-bien.jpg',
    'trung-duc-thit-hap-noi-com.jpg',
    'trung-ga-ngam-tuong.jpg',
    'trung-rim-ca-chua-nam.jpg',
    'trung-sot-cay.jpg',
    'trung-sot-nuoc-mam-toi-ot.jpg',
    'Xôi xéo.jpg',
  ];

  static final Map<String, String> _filenameByLowerTitle = {
    for (final f in _recipeFiles)
      f.replaceAll(RegExp(r'\.jpg$', caseSensitive: false), '').toLowerCase(): f,
  };

  static final Map<String, String> _keywordsToImages = {
    'trứng': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800&auto=format&fit=crop',
    'bò': 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800&auto=format&fit=crop',
    'gà': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop',
    'thịt': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?q=80&w=800&auto=format&fit=crop',
    'cá': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800&auto=format&fit=crop',
    'canh': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
    'súp': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=800&auto=format&fit=crop',
    'bún': 'https://images.unsplash.com/photo-1559847844-5315695dadae?q=80&w=800&auto=format&fit=crop',
    'phở': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800&auto=format&fit=crop',
    'cơm': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=800&auto=format&fit=crop',
    'salad': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
    'bánh': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?q=80&w=800&auto=format&fit=crop',
    'rau': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800&auto=format&fit=crop',
    'tôm': 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?q=80&w=800&auto=format&fit=crop',
  };

  static const String _productionWebCdn = 'https://smart-meal-three.vercel.app/images/recipes';

  static String _buildRecipeImageUrl(String filename) {
    final encoded = Uri.encodeComponent(filename);
    final base = ApiConstants.baseUrl.replaceAll('/api', '');

    // Nếu base URL là domain ngoài (không phải localhost / IP LAN nội bộ), dùng backend host
    if (!base.contains('localhost') && !base.contains('127.0.0.1') && !base.contains('192.168.')) {
      return '$base/images/recipes/$encoded';
    }

    // Trên môi trường Web local dev: gọi backend local đã host wwwroot
    if (kIsWeb) {
      return '$base/images/recipes/$encoded';
    }

    // Khi build APK / chạy trên thiết bị thật: dùng trực tiếp CDN Production Web (Vercel)
    // để thiết bị ở bất kỳ mạng nào cũng hiển thị 100% giống product web
    return '$_productionWebCdn/$encoded';
  }

  /// Resolve a recipe image URL from explicit URL or recipe name
  static String resolve(String? recipeName, [String? explicitUrl]) {
    if (explicitUrl != null && explicitUrl.trim().isNotEmpty) {
      final url = explicitUrl.trim();
      // If it's a valid remote URL and not the generic placeholder
      if ((url.startsWith('http://') || url.startsWith('https://')) &&
          !url.contains('photo-1498837167922-ddd27525d352')) {
        return url;
      }
    }

    if (recipeName == null || recipeName.trim().isEmpty) {
      return fallback;
    }

    final normalized = recipeName.trim().toLowerCase();
    if (_lauRecipes.contains(normalized)) {
      return fallback;
    }

    // 1. Direct alias match
    if (_aliases.containsKey(normalized)) {
      final target = _aliases[normalized]!;
      if (target.startsWith('http://') || target.startsWith('https://')) {
        return target;
      }
      return _buildRecipeImageUrl(target);
    }

    // 2. Direct filename title match
    if (_filenameByLowerTitle.containsKey(normalized)) {
      return _buildRecipeImageUrl(_filenameByLowerTitle[normalized]!);
    }

    // 3. Substring matching against known filenames (longest titles first)
    final sortedTitles = _filenameByLowerTitle.keys.toList()
      ..sort((a, b) => b.length.compareTo(a.length));
    for (final title in sortedTitles) {
      if (normalized.contains(title) || title.contains(normalized)) {
        return _buildRecipeImageUrl(_filenameByLowerTitle[title]!);
      }
    }

    // 4. Substring matching against aliases
    final sortedAliasKeys = _aliases.keys.toList()
      ..sort((a, b) => b.length.compareTo(a.length));
    for (final aliasKey in sortedAliasKeys) {
      if (normalized.contains(aliasKey) || aliasKey.contains(normalized)) {
        final target = _aliases[aliasKey]!;
        if (target.startsWith('http://') || target.startsWith('https://')) {
          return target;
        }
        return _buildRecipeImageUrl(target);
      }
    }

    // 5. Keyword fallback to Unsplash
    for (final entry in _keywordsToImages.entries) {
      if (normalized.contains(entry.key)) {
        return entry.value;
      }
    }

    return fallback;
  }
}

class IngredientImages {
  IngredientImages._();

  static const String fallback =
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300&h=300&auto=format&fit=crop';

  static const Map<String, String> _staticImages = {
    'cà chua': 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=300&h=300&q=80',
    'thịt gà': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&h=300&q=80',
    'gà': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&h=300&q=80',
    'tỏi': 'https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=300&h=300&q=80',
    'chanh': 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=300&h=300&q=80',
    'hành tây': 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=300&h=300&q=80',
    'hành': 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=300&h=300&q=80',
    'mật ong': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=300&h=300&q=80',
    'tiêu đen': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&h=300&q=80',
    'tiêu': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&h=300&q=80',
    'đậu bắp': 'https://images.unsplash.com/photo-1627910543666-896238b7e089?auto=format&fit=crop&w=300&h=300&q=80',
    'rau ngót': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=300&h=300&q=80',
    'rau mùi': 'https://images.unsplash.com/photo-1591871937475-ed95f87f7ae8?auto=format&fit=crop&w=300&h=300&q=80',
    'bông cải xanh': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=300&h=300&q=80',
    'súp lơ': 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=300&h=300&q=80',
    'bơ': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=300&h=300&q=80',
    'nấm': 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=300&h=300&q=80',
    'trứng': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=300&h=300&q=80',
    'trứng gà': 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=300&h=300&q=80',
    'thịt bò': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&h=300&q=80',
    'bò': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&h=300&q=80',
    'thịt heo': 'https://images.unsplash.com/photo-1602484789369-026048d88e40?auto=format&fit=crop&w=300&h=300&q=80',
    'thịt lợn': 'https://images.unsplash.com/photo-1602484789369-026048d88e40?auto=format&fit=crop&w=300&h=300&q=80',
    'heo': 'https://images.unsplash.com/photo-1602484789369-026048d88e40?auto=format&fit=crop&w=300&h=300&q=80',
    'tôm': 'https://images.unsplash.com/photo-1559742811-82410b5104ca?auto=format&fit=crop&w=300&h=300&q=80',
    'cá': 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&w=300&h=300&q=80',
    'cá hồi': 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=300&h=300&q=80',
    'gạo': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&h=300&q=80',
    'cơm': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&h=300&q=80',
    'sữa': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&h=300&q=80',
    'muối': 'https://images.unsplash.com/photo-1595181774323-8cfb46571587?auto=format&fit=crop&w=300&h=300&q=80',
    'đường': 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=300&h=300&q=80',
    'dầu ăn': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=300&h=300&q=80',
    'nước mắm': 'https://images.unsplash.com/photo-1589135304675-e22b0704407b?auto=format&fit=crop&w=300&h=300&q=80',
    'ớt': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=300&h=300&q=80',
    'gừng': 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&h=300&q=80',
    'khoai tây': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=300&h=300&q=80',
    'khoai lang': 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=300&h=300&q=80',
    'cà rốt': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&h=300&q=80',
    'dưa chuột': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=300&h=300&q=80',
    'dưa leo': 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=300&h=300&q=80',
    'bánh mì sandwich': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&h=300&q=80',
    'bánh mì': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&h=300&q=80',
    'sandwich': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=300&h=300&q=80',
    'vụn bánh mì': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&h=300&q=80',
    'bánh phở': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&h=300&q=80',
    'phở': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=300&h=300&q=80',
    'bún': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&h=300&q=80',
    'mì quảng': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&h=300&q=80',
    'mì ý': 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&h=300&q=80',
    'mì': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=300&h=300&q=80',
    'hủ tiếu': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=300&h=300&q=80',
    'phô mai': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=300&h=300&q=80',
    'bánh tráng': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&h=300&q=80',
    'hàu': 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=300&h=300&q=80',
    'ruột hàu sữa': 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=300&h=300&q=80',
    'rong biển': 'https://images.unsplash.com/photo-1607301406259-dfb186e15de8?auto=format&fit=crop&w=300&h=300&q=80',
    'rong biển lá': 'https://images.unsplash.com/photo-1607301406259-dfb186e15de8?auto=format&fit=crop&w=300&h=300&q=80',
    'bột mì': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&h=300&q=80',
    'bột gạo': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&h=300&q=80',
    'sườn': 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&h=300&q=80',
    'bắp cải tím': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=300&h=300&q=80',
    'bắp cải': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=300&h=300&q=80',
    'bắp chuối': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=300&h=300&q=80',
    'bắp': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&h=300&q=80',
    'ngô': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=300&h=300&q=80',
    'chuối': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=300&h=300&q=80',
    'dứa': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=300&h=300&q=80',
    'thơm': 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=300&h=300&q=80',
    'đậu': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=300&h=300&q=80',
    'đậu hủ': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&h=300&q=80',
    'đậu phụ': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&h=300&q=80',
    'rau': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&h=300&q=80',
    'thịt': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=300&h=300&q=80',
  };

  static List<String>? _sortedKeysCache;
  static List<String> get _sortedKeys {
    _sortedKeysCache ??= _staticImages.keys.toList()
      ..sort((a, b) => b.length.compareTo(a.length));
    return _sortedKeysCache!;
  }

  static String resolve(String? rawUrl, [String? name]) {
    final cleanUrl = rawUrl?.trim() ?? '';
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      return cleanUrl;
    }
    if (name != null && name.trim().isNotEmpty) {
      final normalized = name.trim().toLowerCase();
      if (_staticImages.containsKey(normalized)) {
        return _staticImages[normalized]!;
      }
      for (final key in _sortedKeys) {
        if (normalized.contains(key)) {
          return _staticImages[key]!;
        }
      }
    }
    if (cleanUrl.isNotEmpty) {
      final pathName = cleanUrl
          .replaceAll('/images/', '')
          .replaceAll('.jpg', '')
          .replaceAll('.png', '')
          .replaceAll('.webp', '')
          .replaceAll('-', ' ')
          .toLowerCase()
          .trim();
      if (_staticImages.containsKey(pathName)) {
        return _staticImages[pathName]!;
      }
      for (final key in _sortedKeys) {
        if (pathName.contains(key)) {
          return _staticImages[key]!;
        }
      }
    }
    return fallback;
  }
}
