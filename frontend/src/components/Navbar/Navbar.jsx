import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, MapPin, Truck, Tag, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cartService } from '../../services/api';
import './Navbar.css';

export const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const fetchCartCount = React.useCallback(() => {
    if (user) {
      cartService.getCart()
        .then(res => {
          const itemsCount = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
          setCartCount(itemsCount);
        })
        .catch(() => setCartCount(0));
    } else {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchCartCount();
    
    window.addEventListener('cartUpdated', fetchCartCount);
    return () => window.removeEventListener('cartUpdated', fetchCartCount);
  }, [fetchCartCount]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Top Banner */}
      <div className="top-banner">
        <div className="container top-banner-container">
          <div className="top-banner-text">Welcome to worldwide Megamart!</div>
          <div className="top-banner-actions">
            <div className="top-banner-item">
              <MapPin size={16} />
              <span>Deliver to <strong>423651</strong></span>
            </div>
            <div className="top-banner-item">
              <Truck size={16} />
              <span>Track your order</span>
            </div>
            <div className="top-banner-item">
              <Tag size={16} />
              <span>All Offers</span>
            </div>
          </div>
        </div>
      </div>

      <header className="navbar">
        <div className="container navbar-container">
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn icon-btn"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo */}
          <div className="navbar-logo">
            <Link to="/">
              <div className="logo-icon">M</div>
              <span className="logo-text">MegaMart</span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="navbar-search hidden-mobile">
            <form className="search-input-wrapper" onSubmit={handleSearch}>
              <Search size={20} className="search-icon" onClick={handleSearch} style={{ cursor: 'pointer' }} />
              <input 
                type="text" 
                placeholder="Search essentials, groceries and more..." 
                className="search-input" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="list-icon-btn" type="button">
                <Menu size={20} />
              </button>
            </form>
          </div>

          {/* Actions */}
          <div className="navbar-actions">
            {user ? (
              <div className="action-item user-profile-nav hidden-mobile">
                <div className="user-info-brief">
                  <span className="welcome-msg">Hello, {user.first_name || user.username}</span>
                  <div className="user-links">
                    {user.is_staff ? (
                      <a href="http://localhost:8000/admin/" target="_blank" rel="noopener noreferrer" className="nav-sub-link">Dashboard</a>
                    ) : (
                      <Link to="/dashboard" className="nav-sub-link">Dashboard</Link>
                    )}
                    <button onClick={handleLogout} className="logout-btn-nav"><LogOut size={14}/> Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="action-item hidden-mobile">
                <UserIcon size={24} />
                <span>Sign Up/Sign In</span>
              </Link>
            )}

            <Link to="/cart" className="action-item" style={{ position: 'relative' }}>
              <ShoppingCart size={24} />
              <span>Cart</span>
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-5px', right: '25px', background: '#008ecc', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Categories Nav */}
        <div className="categories-nav hidden-mobile">
          <div className="container categories-container">
            <Link to="/products?category=groceries" className="cat-link">Groceries</Link>
            <Link to="/products?category=smartphones" className="cat-link">Smartphones</Link>
            <Link to="/products?category=home-kitchen" className="cat-link">Home & Kitchen</Link>
            <Link to="/products?category=fashion" className="cat-link">Fashion</Link>
            <Link to="/products?category=electronics" className="cat-link">Electronics</Link>
            <Link to="/products?category=beauty" className="cat-link">Beauty</Link>
            <Link to="/products?category=home-decoration" className="cat-link">Home Decoration</Link>
            <Link to="/products?category=sports-accessories" className="cat-link">Sports & Luggage</Link>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                className="mobile-menu-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.div 
                className="mobile-menu"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="mobile-menu-header">
                  <div className="navbar-logo">
                    <div className="logo-icon">M</div>
                    <span className="logo-text">MegaMart</span>
                  </div>
                  <button 
                    className="icon-btn" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="mobile-search">
                  <form className="search-input-wrapper" onSubmit={handleSearch}>
                    <Search size={18} className="search-icon" onClick={handleSearch} />
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      className="search-input" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </div>

                <nav className="mobile-nav-links">
                  <Link to="/products?category=groceries" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Groceries</Link>
                  <Link to="/products?category=fashion" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Fashion</Link>
                  <Link to="/products?category=electronics" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Electronics</Link>
                  <Link to="/products?category=smartphones" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Smartphones</Link>
                  {user ? (
                    <>
                      {user.is_staff ? (
                        <a 
                          href="http://localhost:8000/admin/" 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="mobile-nav-link" 
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </a>
                      ) : (
                        <Link to="/dashboard" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                      )}
                      <div className="mobile-nav-link" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout ({user.username})</div>
                    </>
                  ) : (
                    <Link to="/auth" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Sign In/Sign Up</Link>
                  )}
                </nav>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
