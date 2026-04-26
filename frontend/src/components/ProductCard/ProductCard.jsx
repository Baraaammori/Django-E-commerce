import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { cartService, wishlistService } from '../../services/api';
import toast from 'react-hot-toast';
import './ProductCard.css';

export const ProductCard = ({ product }) => {
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await cartService.addItem({ product_id: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart!`);
      // Force a custom event to update Navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please log in to add items to your cart.");
      } else {
        toast.error(error.response?.data?.detail || "Failed to add to cart");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await wishlistService.addToWishlist(product.id);
      toast.success(`${product.name} added to wishlist!`);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please log in to add items to your wishlist.");
      } else {
        toast.error(error.response?.data?.detail || "Failed to add to wishlist");
      }
    }
  };

  return (
    <motion.div 
      className="product-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <div className="product-badge">{product.discount_percentage > 0 ? `${product.discount_percentage}% OFF` : 'NEW'}</div>
      
      <div className="product-image-wrapper">
        <Link to={`/products/${product.id}`}>
          {product.image ? (
            <img src={product.image} alt={product.name} />
          ) : (
            <div className="product-image-placeholder">
              <span style={{ color: '#ccc', fontSize: '14px' }}>No Image</span>
            </div>
          )}
        </Link>
        
        <div className="product-actions-overlay">
          <button className="icon-btn-overlay" onClick={handleAddToWishlist} title="Add to Wishlist">
            <Heart size={20} />
          </button>
          <button className="icon-btn-overlay" onClick={handleAddToCart} disabled={loading} title="Add to Cart">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>

      <div className="product-info">
        <Link to={`/products/${product.id}`} className="product-name">{product.name}</Link>
        
        <div className="product-prices">
          <span className="price">${product.price}</span>
          {product.old_price && <span className="old-price">${product.old_price}</span>}
        </div>
        
        {product.savings > 0 && (
          <div className="product-save">
            Save - ${product.savings}
          </div>
        )}
      </div>
    </motion.div>
  );
};
