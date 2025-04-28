
import { Home, Bookmark, Search, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
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
  
  return (
    <div className="bottom-nav">
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
