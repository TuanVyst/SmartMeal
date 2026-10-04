import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { recipeService } from '../../services/recipeService';
import { adminService } from '../../services/adminService';
import RecipeEditorModal from '../../components/admin/RecipeEditorModal';

export default function RecipeForm() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [initialRecipe, setInitialRecipe] = useState(null);
  const [currentIngredients, setCurrentIngredients] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [availableIngredients, setAvailableIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [tagsRes, ingsRes] = await Promise.all([
          recipeService.getTags().catch(() => ({ data: { data: [] } })),
          adminService.getAllIngredients().catch(() => [])
        ]);

        setAvailableTags(tagsRes.data?.data || []);
        setAvailableIngredients(ingsRes || []);

        if (isEdit) {
          const recRes = await recipeService.getById(id);
          const r = recRes.data?.data;
          setInitialRecipe(r);
          setCurrentIngredients(r?.recipeIngredients || []);
        }
      } catch (err) {
        console.error('Error loading recipe form data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, [id, isEdit]);

  const handleSave = async ({ baseRecipeData, ingredients }) => {
    setSaving(true);
    try {
      const payload = {
        ...baseRecipeData,
        account_id: user?.accountId || user?.account_id
      };

      if (isEdit) {
        await recipeService.update(id, payload);
      } else {
        const res = await recipeService.create(payload);
        const created = res.data?.data || res.data;
        if (created?.recipe_id) {
          for (const ing of ingredients) {
            if (ing.ingredient_id && ing.quantity > 0) {
              await adminService.createRecipeIngredient({
                recipe_id: created.recipe_id,
                ingredient_id: ing.ingredient_id,
                quantity: Math.round(Number(ing.quantity)) || 1,
                UOM: ing.uom || 'g',
                IsPrimary: !!ing.isPrimary
              });
            }
          }
        }
      }
      navigate('/home?tab=discover');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Lỗi khi lưu công thức');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading" style={{ padding: '60px', textAlign: 'center' }}>Đang tải công thức...</div>;
  }

  return (
    <RecipeEditorModal
      isOpen={true}
      onClose={() => navigate(-1)}
      onSave={handleSave}
      initialRecipe={initialRecipe}
      availableRecipeTags={availableTags}
      availableIngredients={availableIngredients}
      currentIngredients={currentIngredients}
      saving={saving}
    />
  );
}
