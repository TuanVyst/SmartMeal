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
