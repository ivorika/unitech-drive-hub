import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setIsMenuOpen(false);
  };

  const getDashboardPath = () => {
    if (!user) {
      // Redirect to login page if not authenticated
      return "/login";
    }
    
    // This is a simplified version - in a real app, you'd check the user's role
    // from their profile data and return the appropriate dashboard path
    return "/student-dashboard";
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-primary">DrDriver</span>
            <span className="text-xs text-muted-foreground">Unitech Driving School</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors ${isActiveLink('/') ? 'text-primary' : 'hover:text-primary'}`}
          >
            Home
          </Link>
          <Link 
            to="/instructions" 
            className={`text-sm font-medium transition-colors ${isActiveLink('/instructions') ? 'text-primary' : 'hover:text-primary'}`}
          >
            Instructions
          </Link>
          <Link 
            to="/about" 
            className={`text-sm font-medium transition-colors ${isActiveLink('/about') ? 'text-primary' : 'hover:text-primary'}`}
          >
            About Us
          </Link>
          <Link 
            to="/contact" 
            className={`text-sm font-medium transition-colors ${isActiveLink('/contact') ? 'text-primary' : 'hover:text-primary'}`}
          >
            Contact
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={getDashboardPath()} className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="hero" size="sm" asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 space-y-4">
            <Link 
              to="/" 
              className={`block text-sm font-medium transition-colors ${isActiveLink('/') ? 'text-primary' : 'hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/instructions" 
              className={`block text-sm font-medium transition-colors ${isActiveLink('/instructions') ? 'text-primary' : 'hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Instructions
            </Link>
            <Link 
              to="/about" 
              className={`block text-sm font-medium transition-colors ${isActiveLink('/about') ? 'text-primary' : 'hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={`block text-sm font-medium transition-colors ${isActiveLink('/contact') ? 'text-primary' : 'hover:text-primary'}`}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <div className="flex space-x-3 pt-4">
              {user ? (
                <>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={getDashboardPath()} className="flex items-center gap-2 justify-center">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleLogout} className="flex-1 flex items-center gap-2 justify-center">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button variant="hero" size="sm" asChild className="flex-1">
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
