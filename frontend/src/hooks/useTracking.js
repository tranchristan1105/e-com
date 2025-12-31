import { useCallback, useState } from 'react';

const API_URL = "http://localhost:8000/api/v1";

export const useTracking = () => {
  // Gestion de l'ID utilisateur (persistant)
  const [userId] = useState(() => {
    const stored = localStorage.getItem('ecommerce_user_id');
    if (stored) return stored;
    const newId = "user_" + Math.floor(Math.random() * 1000000);
    localStorage.setItem('ecommerce_user_id', newId);
    return newId;
  });

  const trackEvent = useCallback(async (eventType, metadata = {}) => {
    const payload = {
      event_type: eventType,
      user_id: userId,
      timestamp: new Date().toISOString(),
      page_url: window.location.pathname,
      metadata: metadata
    };

    console.log("📡 Tracking:", eventType, payload);

    try {
      await fetch(`${API_URL}/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.warn("Tracking unreachable");
    }
  }, [userId]);

  return { trackEvent, userId };
};