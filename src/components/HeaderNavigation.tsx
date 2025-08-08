
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  Bookmark, 
  Search, 
  User, 
  Menu, 
  X,
  Users,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

const HeaderNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: "Saved",
      path: "/saved",
      icon: <Bookmark className="w-5 h-5" />,
    },
    {
      name: "Explore",
      path: "/explore",
      icon: <Search className="w-5 h-5" />,
    },
    {
      name: "AI Tools",
      path: "/tools",
      icon: <Sparkles className="w-5 h-5" />,
    },
    // {
    //   name: "Influencers",
    //   path: "/influencers",
    //   icon: <Users className="w-5 h-5" />,
    // },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="w-5 h-5" />,
    },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-xl text-primary">ByteMe</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="hidden lg:flex"
          >
            {isDarkMode ? "🌙" : "☀️"}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t">
            <nav className="flex flex-col space-y-2 py-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className="flex items-center justify-start space-x-3 px-3 py-2"
              >
                <span>{isDarkMode ? "🌙" : "☀️"}</span>
                <span>Toggle Theme</span>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderNavigation;