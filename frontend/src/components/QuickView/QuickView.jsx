import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, Star } from 'lucide-react';
import { Button } from '../Button/Button';
import './QuickView.css';

export const QuickView = ({ product, isOpen, onClose }) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            className="quickview-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="quickview-container">
            <motion.div 
              className="quickview-modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <button className="quickview-close" onClick={onClose}>
                <X size={24} />
              </button>

              <div className="quickview-grid">
                {/* Image Gallery */}
                <div className="quickview-gallery">
                  <div className="quickview-main-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                </div>

                {/* Info */}
                <div className="quickview-info">
                  <div className="product-category">{product.category}</div>
                  <h2 className="quickview-title">{product.name}</h2>
                  
                  <div className="quickview-rating">
                    <div className="stars-wrapper">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          size={16} 
                          className={star <= product.rating ? 'star-filled' : 'star-empty'} 
                        />
                      ))}
                    </div>
                    <span>({product.reviews} reviews)</span>
                  </div>

                  <div className="quickview-price-wrapper">
                    <span className="quickview-price">${product.price.toFixed(2)}</span>
                    {product.oldPrice && (
                      <span className="quickview-old-price">${product.oldPrice.toFixed(2)}</span>
                    )}
                    {product.discount && (
                      <span className="quickview-discount-badge">Save {product.discount}%</span>
                    )}
                  </div>

                  <p className="quickview-description">
                    {product.description || "Experience premium quality with our latest collection. Designed with precision and crafted for ultimate comfort and durability."}
                  </p>

                  <div className="quickview-actions">
                    <Button fullWidth size="lg" leftIcon={<ShoppingCart size={20} />}>
                      Add to Cart
                    </Button>
                  </div>
                  
                  <div className="quickview-meta">
                    <p><strong>Availability:</strong> <span className="text-success">In Stock</span></p>
                    <p><strong>SKU:</strong> PRD-{product.id}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
