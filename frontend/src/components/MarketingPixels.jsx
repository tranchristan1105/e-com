import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Remplace par tes vrais IDs quand tu auras tes comptes Business Manager
const FACEBOOK_PIXEL_ID = "YOUR_FB_PIXEL_ID"; 
const TIKTOK_PIXEL_ID = "YOUR_TIKTOK_PIXEL_ID";

export const MarketingPixels = () => {
  const location = useLocation();

  // 1. Initialisation des Scripts (au chargement)
  useEffect(() => {
    // --- FACEBOOK PIXEL INIT ---
    if (!window.fbq) {
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      window.fbq('init', FACEBOOK_PIXEL_ID);
    }

    // --- TIKTOK PIXEL INIT ---
    if (!window.ttq) {
        // (Code simplifié TikTok - à récupérer sur ton compte TikTok Ads)
        console.log("TikTok Pixel Init Placeholder"); 
    }
  }, []);

  // 2. Tracking des Vues de Page (à chaque changement d'URL)
  useEffect(() => {
    // Facebook PageView
    if (window.fbq) window.fbq('track', 'PageView');
    
    console.log(`📡 Marketing: PageView envoyé pour ${location.pathname}`);
  }, [location]);

  return null; // Ce composant n'affiche rien visuellement
};

// Fonction helper pour tracker les événements spécifiques manuellement
export const trackMarketingEvent = (eventName, data = {}) => {
    if (window.fbq) {
        window.fbq('track', eventName, data);
        console.log(`📡 Facebook Event: ${eventName}`, data);
    }
    // Ajoute TikTok ici plus tard
};