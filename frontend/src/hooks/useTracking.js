import { useCallback, useState } from 'react';

// --- CORRECTION ICI ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export const useTracking = () => {
  const [userId] = useState(() => {
    try {
      const stored = localStorage.getItem('ecommerce_user_id');
      if (stored) return stored;
      const newId = "user_" + Math.floor(Math.random() * 1000000);
      localStorage.setItem('ecommerce_user_id', newId);
      return newId;
    } catch (e) {
      return "user_fallback";
    }
  });

  const trackEvent = useCallback(async (eventType, metadata = {}) => {
    try {
      const payload = {
        event_type: eventType,
        user_id: userId,
        timestamp: new Date().toISOString(),
        page_url: window.location.pathname,
        metadata: metadata
      };
      
      console.log("📡 Tracking:", eventType, payload);

      fetch(`${API_URL}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {}); 
      
    } catch (e) {}
  }, [userId]);

  return { trackEvent, userId };
};