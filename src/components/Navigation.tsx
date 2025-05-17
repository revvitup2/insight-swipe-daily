
import { Home, Bookmark, Search, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { APP_NAME, APP_LOGO } from "@/constants/constants";

export const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isVisible, setIsVisible] = useState(true);
  
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="w-6 h-6 nav-icon" />,
    },
    {
      name: "Saved",
      path: "/saved",
      icon: <Bookmark className="w-6 h-6 nav-icon" />,
    },
    {
      name: "Explore",
      path: "/explore",
      icon: <Search className="w-6 h-6 nav-icon" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="w-6 h-6 nav-icon" />,
    },
  ];

  // Reset visibility when route changes
  useEffect(() => {
    setIsVisible(true);
  }, [currentPath]);
  
  return (
    <div 
      className={cn(
        "bottom-nav transition-transform duration-300", 
        !isVisible && "translate-y-full"
      )}
    >
      {navItems.map((item) => (
        <Link 
          key={item.path} 
          to={item.path}
          className={cn(
            "nav-item",
            currentPath === item.path && "active"
          )}
        >
          {item.icon}
          <span className="text-xs">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default Navigation;
