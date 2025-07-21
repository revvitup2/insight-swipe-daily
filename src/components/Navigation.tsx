
"use client";
import { Home, Bookmark, Search, User, TrendingUp } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

export const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isVisible, setIsVisible] = useState(true);
  const { isDarkMode } = useTheme();
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="w-6 h-6" />,
    },
    {
      name: "Progress",
      path: "/progress",
      icon: <TrendingUp className="w-6 h-6" />,
      dataNav: "progress"
    },
    {
      name: "Explore",
      path: "/explore",
      icon: <Search className="w-6 h-6" />,
      dataNav: "explore"
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="w-6 h-6" />,
      dataNav: "profile"
    },
  ];

  // Auto-hide functionality for home page
  useEffect(() => {
    setIsVisible(true);
    
    // Only auto-hide on home page
    if (currentPath !== "/") return;

    const hideNavAfterInactivity = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      inactivityTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3000); // Hide after 3 seconds of inactivity
    };

    const showNavOnActivity = () => {
      setIsVisible(true);
      hideNavAfterInactivity();
    };

    // Events that should show the navigation
    const events = ['touchstart', 'touchmove', 'touchend', 'mousedown', 'mousemove', 'scroll'];
    
    events.forEach(event => {
      document.addEventListener(event, showNavOnActivity, { passive: true });
    });

    // Initial timer
    hideNavAfterInactivity();

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach(event => {
        document.removeEventListener(event, showNavOnActivity);
      });
    };
  }, [currentPath]);
  
  return (
    <div 
      className={cn(
        "md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around py-3 border-t bg-background transition-transform duration-300",
        !isVisible && "translate-y-full",
        isDarkMode ? "border-gray-800" : "border-gray-200"
      )}
    >
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          data-nav={item.dataNav}
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
            currentPath === item.path 
              ? "text-primary" 
              : "text-muted-foreground hover:text-foreground",
            isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
          )}
        >
          {item.icon}
          <span className="text-xs mt-1">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navigation;