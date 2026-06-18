export const mockRecipesData = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Classic Chicken Stir Fry",
    description: "A quick and delicious Asian-inspired dish with tender chicken and crisp vegetables.",
    time: "25 mins",
    difficulty: "Easy",
    calories: "423 kcal",
    imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=1000&auto=format&fit=crop",
    requiredIngredients: ["Chicken Breast", "Garlic", "Onion", "Broccoli", "Carrot", "Rice"],
    ingredients: [
      { name: "Chicken Breast", amount: "200g", nutrition: { calories: 330, protein: 62, carbs: 0, fat: 7.2 } },
      { name: "Garlic", amount: "3 cloves", nutrition: { calories: 4, protein: 0.2, carbs: 1, fat: 0.02 } },
      { name: "Onion", amount: "100g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Broccoli", amount: "150g", nutrition: { calories: 51, protein: 4.2, carbs: 9.9, fat: 0.6 } },
      { name: "Carrot", amount: "100g", nutrition: { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2 } },
      { name: "Rice", amount: "200g", nutrition: { calories: 260, protein: 5.4, carbs: 56, fat: 0.6 } },
      { name: "Olive Oil", amount: "1 tbsp", nutrition: { calories: 119, protein: 0, carbs: 0, fat: 13.5 } },
      { name: "Salt", amount: "1 tsp", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Black Pepper", amount: "1 tsp", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Slice the chicken into thin strips and chop the vegetables.",
      "Heat oil in a wok or large frying pan over medium-high heat.",
      "Cook the chicken until browned, then remove from the pan.",
      "Stir-fry the garlic, onion, broccoli, and carrots until tender-crisp.",
      "Return the chicken to the pan, add soy sauce, and toss everything together.",
      "Serve hot over a bed of steamed rice."
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
    title: "Egg Fried Rice",
    description: "Simple yet satisfying fried rice with scrambled eggs and vegetables.",
    time: "15 mins",
    difficulty: "Easy",
    calories: "354 kcal",
    imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=1000&auto=format&fit=crop",
    requiredIngredients: ["Egg", "Rice", "Onion", "Garlic"],
    ingredients: [
      { name: "Egg", amount: "2 pieces", nutrition: { calories: 156, protein: 12.6, carbs: 1.2, fat: 10.6 } },
      { name: "Rice", amount: "300g", nutrition: { calories: 390, protein: 8.1, carbs: 84, fat: 0.9 } },
      { name: "Onion", amount: "100g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Garlic", amount: "2 cloves", nutrition: { calories: 2.7, protein: 0.13, carbs: 0.67, fat: 0.01 } },
      { name: "Olive Oil", amount: "1 tbsp", nutrition: { calories: 119, protein: 0, carbs: 0, fat: 13.5 } },
      { name: "Salt", amount: "1 tsp", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Heat a splash of oil in a large pan or wok.",
      "Scramble the eggs and push them to one side of the pan.",
      "Add onions and garlic to the empty side and cook until softened.",
      "Add the cooked rice and soy sauce, stirring constantly to combine.",
      "Toss with the scrambled eggs until everything is heated through.",
      "Garnish with green onions if desired and serve immediately."
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
    title: "Garlic Butter Salmon",
    description: "Pan-seared salmon with garlic butter sauce and lemon.",
    time: "15 mins",
    difficulty: "Medium",
    calories: "462 kcal",
    imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1000&auto=format&fit=crop",
    requiredIngredients: ["Salmon", "Garlic", "Lemon", "Olive Oil", "Onion"],
    ingredients: [
      { name: "Salmon", amount: "300g", nutrition: { calories: 624, protein: 60, carbs: 0, fat: 39 } },
      { name: "Garlic", amount: "3 cloves", nutrition: { calories: 4, protein: 0.2, carbs: 1, fat: 0.02 } },
      { name: "Lemon", amount: "1 piece", nutrition: { calories: 17, protein: 0.6, carbs: 5.4, fat: 0.2 } },
      { name: "Olive Oil", amount: "2 tbsp", nutrition: { calories: 238, protein: 0, carbs: 0, fat: 27 } },
      { name: "Onion", amount: "100g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Salt", amount: "1 tsp", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Black Pepper", amount: "1 tsp", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Season salmon with salt and pepper.",
      "Heat olive oil in a pan over medium-high heat.",
      "Cook salmon skin-side down for 4 minutes.",
      "Flip and add butter, garlic, and lemon juice.",
      "Cook for another 3 minutes, basting with the butter sauce.",
      "Serve with steamed vegetables."
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
    title: "Simple Tomato Pasta",
    description: "Easy pasta with fresh tomato garlic sauce.",
    time: "20 mins",
    difficulty: "Easy",
    calories: "243 kcal",
    imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=1000&auto=format&fit=crop",
    requiredIngredients: ["Pasta", "Tomato", "Garlic", "Olive Oil", "Onion"],
    ingredients: [
      { name: "Pasta", amount: "300g", nutrition: { calories: 393, protein: 15, carbs: 75, fat: 3.3 } },
      { name: "Tomato", amount: "300g", nutrition: { calories: 54, protein: 2.7, carbs: 11.7, fat: 0.6 } },
      { name: "Garlic", amount: "2 cloves", nutrition: { calories: 2.7, protein: 0.13, carbs: 0.67, fat: 0.01 } },
      { name: "Olive Oil", amount: "2 tbsp", nutrition: { calories: 238, protein: 0, carbs: 0, fat: 27 } },
      { name: "Onion", amount: "100g", nutrition: { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1 } },
      { name: "Salt", amount: "1 tsp", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
      { name: "Black Pepper", amount: "1 tsp", nutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } }
    ],
    steps: [
      "Cook pasta in salted boiling water until al dente.",
      "In a pan, sauté garlic and onion in olive oil.",
      "Add diced tomatoes and cook until softened.",
      "Season with salt and pepper.",
      "Toss cooked pasta with the sauce.",
      "Serve hot with grated cheese if desired."
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
