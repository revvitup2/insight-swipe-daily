
"use client";
import { Home, Bookmark, Search, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAutoHide } from "@/hooks/use-auto-hide";

export const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { isDarkMode } = useTheme();
   const isVisible = useAutoHide(3000);
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="w-6 h-6" />,
    },
    {
      name: "Saved",
      path: "/saved",
      icon: <Bookmark className="w-6 h-6" />,
    },
    {
      name: "Explore",
      path: "/explore",
      icon: <Search className="w-6 h-6" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="w-6 h-6" />,
    },
  ];

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