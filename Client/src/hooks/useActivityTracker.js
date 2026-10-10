import { useEffect, useRef } from 'react';
import { adminService } from '../services/adminService';

const SESSION_STORAGE_KEY = 'smartmeal_session_token';

export function getOrCreateSessionToken() {
  try {
    let token = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!token) {
      token = 'sess_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now().toString(36);
      sessionStorage.setItem(SESSION_STORAGE_KEY, token);
    }
    return token;
  } catch {
    return 'fallback_sess_' + Date.now();
  }
}

/**
 * Lightweight hook to send background heartbeat pings for session duration and visit tracking.
 * Automatically throttles when tab is hidden.
 */
export function useActivityTracker() {
  const tokenRef = useRef(getOrCreateSessionToken());

  useEffect(() => {
    const sessionToken = tokenRef.current;

    const ping = () => {
      if (document.visibilityState === 'visible') {
        adminService.sendActivityHeartbeat(sessionToken).catch(() => {
          // Non-blocking silent error handling
        });
      }
    };

    // Ping immediately on mount
    ping();

    // Ping every 30 seconds while the page remains active
    const interval = setInterval(ping, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        ping();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

/**
 * Records a user selecting/viewing a recipe in their current session.
 * @param {string|Guid} recipeId 
 */
export function trackRecipeSelection(recipeId) {
  try {
    const sessionToken = getOrCreateSessionToken();
    if (sessionToken && recipeId) {
      adminService.recordRecipeSelect(sessionToken, recipeId).catch(() => {
        // Non-blocking
      });
    }
  } catch {
    // Non-blocking
  }
}
