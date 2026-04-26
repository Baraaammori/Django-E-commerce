import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronDown, Phone, Mail, MapPin } from 'lucide-react';
import { productsService } from '../../services/api';
import './Home.css';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [essentials, setEssentials] = useState([]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [featuredRes, categoriesRes, essentialsRes] = await Promise.all([
          productsService.getAll({ is_featured: true }),
          productsService.getCategories(),
          productsService.getAll({ category: 'groceries' })
        ]);
        
        setFeaturedProducts(featuredRes.data.results?.slice(0, 5) || featuredRes.data?.slice(0, 5) || []);
        setCategories(categoriesRes.data.results || categoriesRes.data || []);
        setEssentials(essentialsRes.data.results?.slice(0, 6) || essentialsRes.data?.slice(0, 6) || []);
      } catch (error) {
        console.error("Failed to fetch home page data", error);
      }
    };
    fetchHomeData();
  }, []);
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="megamart-hero">
        <div className="container megamart-hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2>Best Deal Online on smart watches</h2>
            <h1>SMART WEARABLE.</h1>
            <h3>UP to 80% OFF</h3>
          </motion.div>
          
          <motion.div 
            className="hero-image"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img src="http://localhost:8000/media/ui/hero_watch.png" alt="Smart Watch" className="hero-img" />
          </motion.div>
        </div>
      </section>

      {/* Smartphones Section */}
      <section className="section container">
        <div className="section-header">
          <h2>Grab the best deal on <span>Smartphones</span></h2>
          <div className="header-line"></div>
          <Link to="/products" className="view-all">View All <ChevronRight size={16}/></Link>
        </div>
        
        <div className="deals-grid">
          {featuredProducts.map((item, index) => (
            <motion.div 
              key={item.id} 
              className="deal-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="deal-badge">{item.discount_percentage > 0 ? `${item.discount_percentage}% OFF` : 'NEW'}</div>
              <div className="deal-image-wrapper">
                <Link to={`/products/${item.id}`}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="product-card-image" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  ) : (
                    <div className="deal-image-placeholder"></div>
                  )}
                </Link>
              </div>
              <div className="deal-info">
                <h3><Link to={`/products/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{item.name}</Link></h3>
                <div className="deal-prices">
                  <span className="price">${item.price}</span>
                  {item.old_price && <span className="old-price">${item.old_price}</span>}
                </div>
                {item.savings > 0 && <div className="deal-save">Save - ${item.savings}</div>}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Categories */}
      <section className="section container">
        <div className="section-header">
          <h2>Shop From <span>Top Categories</span></h2>
          <div className="header-line"></div>
          <Link to="/products" className="view-all">View All <ChevronRight size={16}/></Link>
        </div>

        <div className="categories-grid">
          {categories.slice(0, 7).map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div 
                className="category-card"
                whileHover={{ scale: 1.05 }}
              >
                <div className="category-image" style={{ backgroundImage: `url(${cat.image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=400'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <p>{cat.name}</p>
              </motion.div>
            </Link>
          ))}
          {categories.length === 0 && <p>No categories found.</p>}
        </div>
      </section>

      {/* Electronics Brands */}
      <section className="section container">
        <div className="section-header">
          <h2>Top <span>Electronics Brands</span></h2>
          <div className="header-line"></div>
          <Link to="/products" className="view-all">View All <ChevronRight size={16}/></Link>
        </div>

        <div className="brands-grid">
          <Link to="/products?category=smartphones" className="brand-banner bg-dark" style={{ textDecoration: 'none' }}>
            <span className="brand-tag">IPHONE</span>
            <h3>UP to 80% OFF</h3>
            <img src="http://localhost:8000/media/ui/iphone.png" alt="iPhone" className="brand-img" />
          </Link>
          <Link to="/products?category=smartphones" className="brand-banner bg-yellow" style={{ textDecoration: 'none' }}>
            <span className="brand-tag text-dark">REALME</span>
            <h3 className="text-dark">UP to 80% OFF</h3>
            <img src="http://localhost:8000/media/ui/realme.png" alt="Realme" className="brand-img" />
          </Link>
          <Link to="/products?category=smartphones" className="brand-banner bg-peach" style={{ textDecoration: 'none' }}>
            <span className="brand-tag text-dark">XIAOMI</span>
            <h3 className="text-dark">UP to 80% OFF</h3>
            <img src="http://localhost:8000/media/ui/xiaomi.png" alt="Xiaomi" className="brand-img" />
          </Link>
        </div>
      </section>

      {/* Daily Essentials */}
      <section className="section container">
        <div className="section-header">
          <h2>Daily <span>Essentials</span></h2>
          <div className="header-line"></div>
          <Link to="/products?category=groceries" className="view-all">View All <ChevronRight size={16}/></Link>
        </div>

        <div className="essentials-grid">
          {essentials.slice(0, 6).map((item) => (
            <Link key={item.id} to={`/products/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div 
                className="essential-card"
                whileHover={{ y: -5 }}
              >
                <div className="essential-image" style={{ backgroundImage: `url(${item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                <p>{item.name}</p>
                <h4>${item.price}</h4>
              </motion.div>
            </Link>
          ))}
          {essentials.length === 0 && <p>No essentials found in stock.</p>}
        </div>
      </section>

      {/* Footer */}
      <footer className="megamart-footer">
        <div className="container footer-content">
          <div className="footer-col brand-col">
            <div className="footer-logo">
              <div className="logo-icon-white">M</div>
              <span>MegaMart</span>
            </div>
            <div className="contact-info">
              <h4>Contact Us</h4>
              <div className="contact-item">
                <Phone size={18} />
                <span>Whats App</span>
                <p>+1 202-918-2132</p>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <span>Call Us</span>
                <p>+1 202-918-2132</p>
              </div>
            </div>
            <div className="download-app">
              <h4>Download App</h4>
              <div className="app-stores">
                <div className="store-btn">App Store</div>
                <div className="store-btn">Google Play</div>
              </div>
            </div>
          </div>
          
          <div className="footer-col links-col">
            <h4>Most Popular Categories</h4>
            <ul>
              <li>Staples</li>
              <li>Beverages</li>
              <li>Personal Care</li>
              <li>Home Care</li>
              <li>Baby Care</li>
              <li>Vegetables & Fruits</li>
              <li>Snacks & Foods</li>
              <li>Dairy & Bakery</li>
            </ul>
          </div>

          <div className="footer-col links-col">
            <h4>Customer Services</h4>
            <ul>
              <li>About Us</li>
              <li>Terms & Conditions</li>
              <li>FAQ</li>
              <li>Privacy Policy</li>
              <li>E-waste Policy</li>
              <li>Cancellation & Return Policy</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="container">
            <p>© 2022 All rights reserved. Reliance Retail Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
