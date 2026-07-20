import { useEffect, useState } from 'react';
import { FiClock, FiZap, FiHeart } from 'react-icons/fi';
import { savedRecipeService } from '../../../services/savedRecipeService';
import { recipeService } from '../../../services/recipeService';
import { resolveRecipeImageUrl } from '../../../utils/recipeImages';

function calcRecipeCalories(recipe) {
  const servings = recipe.servings || recipe.Servings || 1;
  const ingredients = recipe.recipeIngredients || recipe.RecipeIngredients || [];
  let total = 0;
  ingredients.forEach(ri => {
    const nv = ri.nutritionalValue || ri.NutritionalValue;
    if (!nv) return;
    const qty = ri.quantity || ri.Quantity || 0;
    const serving = nv.servingSize || nv.ServingSize || 1;
    total += (nv.calories || nv.Calories || 0) * (qty / serving);
  });
  if (total > 0) return Math.round(total / servings);
  return Math.round(recipe.calories || recipe.nutrition?.calories || 0);
}

function mapRecipeToCard(recipe, saveCount = 0) {
  const name = recipe.recipe_name || recipe.Recipe_name || recipe.title || 'Món ăn';
  const cook = recipe.cookTime || recipe.CookTime || 0;
  const prep = recipe.prepTime || recipe.PrepTime || 0;
  const difficulty = recipe.difficulty || recipe.Difficulty || '';
  return {
    id: recipe.recipe_id || recipe.Recipe_id || recipe.id,
    name,
    image: resolveRecipeImageUrl(name),
    cookTime: cook + prep > 0 ? `${cook + prep} phút` : null,
    calories: calcRecipeCalories(recipe),
    difficulty,
    saveCount,
    tags: (recipe.recipeTags || recipe.RecipeTags || [])
      .map(t => t.tagName || t.TagName || t.name || t.Name || t)
      .filter(t => typeof t === 'string')
      .slice(0, 2),
  };
}

export default function PopularMeals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1. Lấy tất cả saved recipes để đếm số lượt lưu mỗi công thức
        const savedRes = await savedRecipeService.getAll();
        const savedItems = savedRes.data?.data ?? [];

        // 2. Group-by recipe_id → đếm số lượt
        const countMap = {};
        savedItems.forEach(item => {
          const rid = item.recipe_id || item.recipeId || item.Recipe_id;
          if (rid) countMap[rid] = (countMap[rid] || 0) + 1;
        });

        // 3. Sắp xếp theo số lượt lưu giảm dần
        const sortedIds = Object.entries(countMap)
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id);

        // 4. Lấy chi tiết Top 4 đã có lượt lưu
        const topIds = sortedIds.slice(0, 4);
        let cards = [];

        if (topIds.length > 0) {
          const details = await Promise.all(
            topIds.map(id =>
              recipeService.getById(id)
                .then(r => r.data?.data)
                .catch(() => null)
            )
          );
          cards = details
            .filter(Boolean)
            .map(r => mapRecipeToCard(r, countMap[r.recipe_id || r.Recipe_id || r.id] || 0));
        }

        // 5. Fallback: bù đủ 4 card bằng công thức mới nhất nếu chưa đủ
        if (cards.length < 4) {
          const allRes = await recipeService.getAll();
          const allRecipes = allRes.data?.data ?? [];
          const existingIds = new Set(cards.map(c => c.id));
          const fallbacks = allRecipes
            .filter(r => {
              const id = r.recipe_id || r.Recipe_id || r.id;
              return !existingIds.has(id);
            })
            .slice(0, 4 - cards.length)
            .map(r => mapRecipeToCard(r, countMap[r.recipe_id || r.Recipe_id || r.id] || 0));
          cards = [...cards, ...fallbacks];
        }

        if (!cancelled) setMeals(cards.slice(0, 4));
      } catch (err) {
        console.error('[PopularMeals] Lỗi tải dữ liệu:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const diffClass = d => {
    if (!d) return '';
    const lower = d.toLowerCase();
    if (lower.includes('dễ') || lower.includes('easy')) return 'easy';
    if (lower.includes('trung') || lower.includes('medium')) return 'medium';
    return 'hard';
  };

  return (
    <section id="explore" className="meals-section">
      <div className="meals-container">
        <h2 className="section-label">Món ăn phổ biến</h2>
        <h3 className="section-title">Công thức được yêu thích nhất</h3>

        {loading ? (
          <div className="meals-grid meals-grid--loading">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="meal-card meal-card--skeleton">
                <div className="meal-image-wrap meal-skeleton-img" />
                <div className="meal-info">
                  <div className="meal-skeleton-line" style={{ width: '70%', height: 18, marginBottom: 12 }} />
                  <div className="meal-skeleton-line" style={{ width: '50%', height: 14 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="meals-grid">
            {meals.map((meal, i) => (
              <div key={meal.id || i} className="meal-card">
                <div className="meal-image-wrap">
                  <img src={meal.image} alt={meal.name} loading="lazy" />
                  {meal.saveCount > 0 && (
                    <span className="meal-save-badge">
                      <FiHeart size={11} />
                      {meal.saveCount}
                    </span>
                  )}
                </div>
                <div className="meal-info">
                  <h4 className="meal-name">{meal.name}</h4>
                  <div className="meal-meta">
                    {meal.cookTime && (
                      <span><FiClock size={14} /> {meal.cookTime}</span>
                    )}
                    {meal.calories > 0 && (
                      <span><FiZap size={14} /> {meal.calories} kcal</span>
                    )}
                    {meal.difficulty && (
                      <span className={`meal-diff diff-${diffClass(meal.difficulty)}`}>
                        {meal.difficulty}
                      </span>
                    )}
                  </div>
                  {meal.tags.length > 0 && (
                    <div className="meal-tags">
                      {meal.tags.map((t, j) => (
                        <span key={j} className="meal-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
