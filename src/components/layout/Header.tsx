import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import collegeLogo from '@/assets/images/college-logo.png';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/books', label: 'Books' },
    { path: '/notes', label: 'Notes' },
    { path: '/rare-books', label: 'Rare Books' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  const adminLinks = isAdmin
    ? [
        { path: '/admin/messages', label: 'Messages' },
        { path: '/admin/books/borrow', label: 'Borrowed Books' },
      ]
    : [];

  return (
    <motion.header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-background/98 backdrop-blur-md shadow-md' 
          : 'bg-background shadow-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <nav className="flex items-center justify-between py-4 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:scale-[1.02] transition-transform">
            <img
              src={collegeLogo}
              alt="GCMN College Logo"
              className="w-12 h-12 object-contain rounded-lg bg-white p-1 shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary leading-tight">GCMN Library</span>
              <span className="text-xs text-muted-foreground leading-tight hidden sm:block">
                Gov. College For Men Nazimabad
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`relative font-medium transition-colors py-2 ${
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              </li>
            ))}
            {adminLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`relative font-medium transition-colors py-2 flex items-center gap-1 ${
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}
                >
                  <Shield size={14} />
                  {link.label}
                  {location.pathname === link.path && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Theme Toggle & Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
                  <User size={18} className="text-primary" />
                  <span className="text-sm font-medium">
                    {profile?.full_name || user.email?.split('@')[0] || 'User'}
                  </span>
                  {isAdmin && (
                    <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">
                      Admin
                    </span>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-primary hover:bg-primary/90">Register</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Theme Toggle & Menu Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="lg:hidden border-t border-border"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ul className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === link.path
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                {adminLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                        location.pathname === link.path
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Shield size={16} />
                      {link.label}
                    </Link>
                  </li>
                ))}
                
                <li className="pt-4 border-t border-border">
                  {user ? (
                    <div className="space-y-2 px-4">
                      <div className="flex items-center gap-2 py-2">
                        <User size={18} className="text-primary" />
                        <span className="font-medium">
                          {profile?.full_name || user.email?.split('@')[0] || 'User'}
                        </span>
                        {isAdmin && (
                          <span className="text-xs px-1.5 py-0.5 bg-primary text-primary-foreground rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <Button variant="outline" className="w-full" onClick={handleLogout}>
                        <LogOut size={16} className="mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 px-4">
                      <Link to="/login" className="flex-1">
                        <Button variant="outline" className="w-full">Login</Button>
                      </Link>
                      <Link to="/register" className="flex-1">
                        <Button className="w-full">Register</Button>
                      </Link>
                    </div>
                  )}
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
