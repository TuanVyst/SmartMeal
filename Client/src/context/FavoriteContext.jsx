import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { savedRecipeService } from '../services/savedRecipeService';
import api from '../services/api';

const FavoriteContext = createContext();

function mapRecipe(raw) {
  const pid = raw.recipe_id || raw.Recipe_id || raw.id;
  const cook = raw.cookTime || raw.CookTime || 0;
  const prep = raw.prepTime || raw.PrepTime || 0;
  return {
    id: pid,
    title: raw.recipe_name || raw.Recipe_name || '',
    description: raw.description || raw.Description || '',
    time: `${prep + cook} phút`,
    difficulty: raw.difficulty || raw.Difficulty || '',
    imageUrl: raw.imageUrl || raw.ImageUrl || '',
    ...raw,
  };
}

export function FavoriteProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const collectionIdRef = useRef(null);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      collectionIdRef.current = null;
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const savedRes = await savedRecipeService.getAll();
      const savedItems = savedRes.data?.data ?? [];

      const recipeIds = savedItems.map(item => item.recipe_id || item.recipeId || item.id).filter(Boolean);
      const recipeData = await Promise.all(
        recipeIds.map(id =>
          api.get(`/recipe/${id}`)
            .then(r => r.data?.data)
            .catch(() => null)
        )
      );
      setFavorites(recipeData.filter(Boolean).map(mapRecipe));

      // fetch default collection once
      if (user.accountId && !collectionIdRef.current) {
        try {
          const colRes = await savedRecipeService.getDefaultCollection(user.accountId);
          const col = colRes.data?.data;
          if (col) {
            collectionIdRef.current = col.collection_id || col.Collection_id || col.collectionId;
          }
        } catch {
          // no default collection yet
        }
      }
    } catch (err) {
      console.error('Failed to load favorites:', err?.config?.url, err?.response?.status, err?.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (recipe) => {
    if (!user || !recipe?.id) return;
    try {
      let cid = collectionIdRef.current;
      if (!cid && user.accountId) {
        const colRes = await savedRecipeService.createCollection({
          account_id: user.accountId,
          name: 'Yêu thích',
          isPublic: false,
        });
        const col = colRes.data?.data;
        cid = col?.collection_id || col?.Collection_id || col?.collectionId;
        collectionIdRef.current = cid;
      }
      if (!cid) return;

      await savedRecipeService.toggle({
        collection_Id: cid,
        recipe_Id: recipe.id,
      });
      await loadFavorites();
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }, [user, loadFavorites]);

  const isFavorite = useCallback((id) => {
    return favorites.some(r => r.id === id);
  }, [favorites]);

  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite, isFavorite, loading }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export const useFavorite = () => useContext(FavoriteContext);
