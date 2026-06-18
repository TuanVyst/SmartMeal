export const mockRecipesData = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Gà Xào Sốt Tiêu Đen",
    description: "Món xào nhanh gọn với thịt gà mềm và rau củ giòn, đậm đà hương vị Á Đông.",
    time: "25 phút",
    difficulty: "Dễ",
    calories: "423 kcal",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1000&auto=format&fit=crop",
    requiredIngredients: ["Thịt gà", "Tỏi", "Hành tây", "Bông cải xanh", "Cà rốt", "Gạo"],
    ingredients: [
      { name: "Thịt gà", amount: "200g", nutrition: { calories: 330, protein: 62, carbs: 0, fat: 7.2 } },
      { name: "Tỏi", amount: "3 nhánh", nutrition: { calories: 4, protein: 0.2, carbs: 1, fat: 0.02 } },
      { name: "Hành tây", amount: "100g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Bông cải xanh", amount: "150g", nutrition: { calories: 51, protein: 4.2, carbs: 9.9, fat: 0.6 } },
      { name: "Cà rốt", amount: "100g", nutrition: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 } },
      { name: "Gạo", amount: "200g", nutrition: { calories: 260, protein: 5.4, carbs: 56, fat: 0.6 } },
      { name: "Dầu ô liu", amount: "1 thìa canh", nutrition: { calories: 119, protein: 0, carbs: 0, fat: 13.5 } },
      { name: "Muối", amount: "1 thìa cà phê", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Tiêu đen", amount: "1 thìa cà phê", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Cắt thịt gà thành từng miếng mỏng và thái rau củ.",
      "Đun nóng dầu trong chảo hoặc wok ở lửa trung bình cao.",
      "Xào gà đến khi vàng đều, sau đó gắp ra đĩa.",
      "Xào tỏi, hành tây, bông cải xanh và cà rốt đến khi chín tới.",
      "Cho gà trở lại chảo, thêm nước tương và đảo đều.",
      "Phục vụ nóng cùng cơm trắng."
    ],
    nutrition: {
      calories: 423,
      protein: 37,
      carbs: 43,
      fat: 11,
      fiber: 4.7,
      sugar: 5.8,
      sodium: 137,
      cholesterol: 85
    }
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "Cơm Chiên Trứng",
    description: "Cơm chiên đơn giản nhưng đậm đà với trứng chiên và rau củ tươi ngon.",
    time: "15 phút",
    difficulty: "Dễ",
    calories: "354 kcal",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000&auto=format&fit=crop",
    requiredIngredients: ["Trứng", "Gạo", "Hành tây", "Tỏi"],
    ingredients: [
      { name: "Trứng", amount: "2 quả", nutrition: { calories: 156, protein: 12.6, carbs: 1.2, fat: 10.6 } },
      { name: "Gạo", amount: "300g", nutrition: { calories: 390, protein: 8.1, carbs: 84, fat: 0.9 } },
      { name: "Hành tây", amount: "100g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Tỏi", amount: "2 nhánh", nutrition: { calories: 2.7, protein: 0.13, carbs: 0.67, fat: 0.01 } },
      { name: "Dầu ô liu", amount: "1 thìa canh", nutrition: { calories: 119, protein: 0, carbs: 0, fat: 13.5 } },
      { name: "Muối", amount: "1 thìa cà phê", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Đun nóng một chút dầu trong chảo lớn hoặc wok.",
      "Làm nóng trứng và đẩy sang một bên chảo.",
      "Cho hành tây và tỏi vào phần trống, xào đến khi mềm.",
      "Thêm cơm đã nấu chín và nước tương, đảo liên tục.",
      "Trộn đều với trứng cho đến khi tất cả nóng đều.",
      "Có thể thêm hành lá nếu thích và dùng ngay."
    ],
    nutrition: {
      calories: 354,
      protein: 11,
      carbs: 48,
      fat: 13,
      fiber: 1.5,
      sugar: 2.9,
      sodium: 66,
      cholesterol: 186
    }
  },
  {
    id: "33333333-3333-3333-3333-333333333333",
    title: "Cá Hồi Xào Bơ Tỏi",
    description: "Cá hồi áp chảo giòn tan với sốt bơ tỏi thơm lừng và chanh tươi.",
    time: "15 phút",
    difficulty: "Trung bình",
    calories: "462 kcal",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop",
    requiredIngredients: ["Cá hồi", "Tỏi", "Chanh", "Dầu ô liu", "Hành tây"],
    ingredients: [
      { name: "Cá hồi", amount: "300g", nutrition: { calories: 624, protein: 60, carbs: 0, fat: 39 } },
      { name: "Tỏi", amount: "3 nhánh", nutrition: { calories: 4, protein: 0.2, carbs: 1, fat: 0.02 } },
      { name: "Chanh", amount: "1 quả", nutrition: { calories: 17, protein: 0.6, carbs: 5.4, fat: 0.2 } },
      { name: "Dầu ô liu", amount: "2 thìa canh", nutrition: { calories: 238, protein: 0, carbs: 0, fat: 27 } },
      { name: "Hành tây", amount: "100g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Muối", amount: "1 thìa cà phê", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Tiêu đen", amount: "1 thìa cà phê", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Ướp cá hồi với muối và tiêu.",
      "Đun nóng dầu ô liu trong chảo ở lửa trung bình cao.",
      "Áp chảo cá hồi mặt da xuống dưới trong 4 phút.",
      "Lật cá và thêm bơ, tỏi, nước cốt chanh.",
      "Nấu thêm 3 phút, liên tục tưới sốt bơ lên cá.",
      "Phục vụ cùng rau củ hấp."
    ],
    nutrition: {
      calories: 462,
      protein: 31,
      carbs: 8,
      fat: 33,
      fiber: 1.7,
      sugar: 2.9,
      sodium: 92,
      cholesterol: 83
    }
  },
  {
    id: "44444444-4444-4444-4444-444444444444",
    title: "Mì Ý Sốt Cà Chua",
    description: "Mì Ý dễ làm với sốt cà chua tươi thơm ngon, hợp cho mọi bữa ăn.",
    time: "20 phút",
    difficulty: "Dễ",
    calories: "243 kcal",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop",
    requiredIngredients: ["Mì ống", "Cà chua", "Tỏi", "Dầu ô liu", "Hành tây"],
    ingredients: [
      { name: "Mì ống", amount: "300g", nutrition: { calories: 393, protein: 15, carbs: 75, fat: 3.3 } },
      { name: "Cà chua", amount: "300g", nutrition: { calories: 54, protein: 2.7, carbs: 11.7, fat: 0.6 } },
      { name: "Tỏi", amount: "2 nhánh", nutrition: { calories: 2.7, protein: 0.13, carbs: 0.67, fat: 0.01 } },
      { name: "Dầu ô liu", amount: "2 thìa canh", nutrition: { calories: 238, protein: 0, carbs: 0, fat: 27 } },
      { name: "Hành tây", amount: "100g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Muối", amount: "1 thìa cà phê", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Tiêu đen", amount: "1 thìa cà phê", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Luộc mì trong nước muối sôi đến khi chín tới.",
      "Trong chảo, phi tỏi và hành tây trong dầu ô liu.",
      "Thêm cà chua cắt nhỏ và nấu đến khi mềm.",
      "Nêm nếm với muối và tiêu.",
      "Trộn mì đã chín với sốt.",
      "Phục vụ nóng, có thể thêm phô mai bào nếu thích."
    ],
    nutrition: {
      calories: 243,
      protein: 6,
      carbs: 32,
      fat: 10,
      fiber: 3.6,
      sugar: 4.8,
      sodium: 13,
      cholesterol: 0
    }
  }
];
