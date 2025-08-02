import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export const useAutoHide = (hideDelay: number = 3000) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isVisible, setIsVisible] = useState(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Only auto-hide on home page
    if (currentPath !== "/") return;

    const hideAfterInactivity = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      inactivityTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);
    };

    const showOnActivity = () => {
      setIsVisible(true);
      hideAfterInactivity();
    };

    // Events that should show the element
    const events = ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'scroll'];
    
    events.forEach(event => {
      document.addEventListener(event, showOnActivity, { passive: true });
    });

    // Initial timer
    hideAfterInactivity();

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, showOnActivity);
      });
    };
  }, [currentPath, hideDelay]);

  return isVisible;
};