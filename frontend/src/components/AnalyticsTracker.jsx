import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTracking } from '../hooks/useTracking';

const AnalyticsTracker = () => {
  const location = useLocation();
  const { track } = useTracking();

  useEffect(() => {
    // Déclenche un événement 'page_view' à chaque changement d'URL
    track('page_view', { path: location.pathname });
  }, [location, track]);

  return null; // Ce composant est invisible
};

export default AnalyticsTracker;