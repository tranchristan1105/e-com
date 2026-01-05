import { useCallback } from 'react';

// --- CONFIGURATION API ---
let apiUrl = "http://localhost:8000/api/v1";
try {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
    apiUrl = import.meta.env.VITE_API_URL;
  }
} catch (e) {}
const API_URL = apiUrl;

export const useTracking = () => {
  const track = useCallback(async (eventType, metadata = {}) => {
    try {
      let uid = localStorage.getItem('empire_uid');
      if (!uid) {
        uid = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('empire_uid', uid);
      }

      // CHANGEMENT ICI : /analytics -> /activity
      await fetch(`${API_URL}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          user_id: uid,
          page_url: window.location.pathname,
          metadata: metadata
        })
      });
      
      if (window.location.hostname === 'localhost') {
        console.log(`📡 Event envoyé : ${eventType}`);
      }

    } catch (e) {
      console.warn("Erreur tracking", e);
    }
  }, []);

  return { track };
};