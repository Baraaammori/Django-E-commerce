import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Minus, Plus, Truck, RotateCcw, User, Clock, Send } from 'lucide-react';
import { productsService, cartService, wishlistService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './ProductDetails.css';

export const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  // Review Form State
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productsService.getById(id);
        setProduct(res.data);
      } catch (error) {
        console.error("Failed to load product", error);
        toast.error("Could not load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await cartService.addItem({ product_id: product.id, quantity });
      toast.success(`${quantity} x ${product.name} added to cart!`);
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please log in to add items to your cart.");
      } else {
        toast.error(error.response?.data?.detail || "Failed to add to cart");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
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

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      toast.error("Please enter a comment.");
      return;
    }
    setSubmittingReview(true);
    try {
      await productsService.addReview({
        product_id: product.id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast.success("Review submitted successfully!");
      setNewReview({ rating: 5, comment: '' });
      // Refresh product data
      const res = await productsService.getById(id);
      setProduct(res.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to submit review. You might have already reviewed this product.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="container mt-8"><p>Loading product...</p></div>;
  if (!product) return <div className="container mt-8"><p>Product not found.</p></div>;

  return (
    <div className="product-details-page container">
      {/* Breadcrumb */}
      <div className="breadcrumb mt-4 mb-8">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span>
      </div>

      <div className="product-details-layout">
        {/* Gallery */}
        <div className="product-gallery">
          <motion.div 
            className="main-image"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={activeImage}
          >
            {product.image ? (
              <img src={product.image} alt={product.name} />
            ) : (
              <div style={{ width: '100%', height: '100%', backgroundColor: '#f5f5f5' }}></div>
            )}
          </motion.div>
        </div>

        {/* Info */}
        <div className="product-info-section">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="product-category">{product.category?.name || 'Uncategorized'}</div>
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-rating">
              <div className="stars-wrapper">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={18} className={star <= (product.average_rating || 5) ? 'star-filled' : 'star-empty'} />
                ))}
              </div>
              <span className="reviews-text">({product.reviews?.length || 0} customer reviews)</span>
            </div>

            <div className="product-price-section">
              <div className="product-price-large">${product.price}</div>
              {product.old_price && <div className="product-price-old">${product.old_price}</div>}
              {product.savings > 0 && <div className="product-price-save">Save - ${product.savings}</div>}
            </div>

            <p className="product-description">{product.description || 'No description available for this product.'}</p>

            <div className="stock-status">
              {product.in_stock ? (
                <><span className="status-dot in-stock"></span> In Stock ({product.stock} available)</>
              ) : (
                <><span className="status-dot out-stock" style={{ backgroundColor: 'red' }}></span> Out of Stock</>
              )}
            </div>

            <div className="purchase-actions">
              <div className="quantity-selector">
                <button className="qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={!product.in_stock}>
                  <Minus size={18} />
                </button>
                <span className="qty-value">{quantity}</span>
                <button className="qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={!product.in_stock || quantity >= product.stock}>
                  <Plus size={18} />
                </button>
              </div>
              
              <button 
                className="add-to-cart-large" 
                onClick={handleAddToCart}
                disabled={!product.in_stock || addingToCart}
              >
                <ShoppingCart size={20} /> {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
              <button className="wishlist-btn-large" onClick={handleAddToWishlist}>
                <Heart size={20} />
              </button>
            </div>

            <div className="service-features">
              <div className="feature-item">
                <Truck size={24} className="feature-icon" />
                <div>
                  <h4>Free Shipping</h4>
                  <p>On orders over $500</p>
                </div>
              </div>
              <div className="feature-item">
                <RotateCcw size={24} className="feature-icon" />
                <div>
                  <h4>30-Day Returns</h4>
                  <p>No questions asked</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="product-extra-tabs mt-16">
        <div className="tabs-header">
          <h2 className="active">Customer Reviews ({product.reviews?.length || 0})</h2>
        </div>
        
        <div className="reviews-layout">
          {/* Review Form */}
          <div className="review-form-container">
            <h3>Add a Review</h3>
            {user ? (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <div className="rating-input">
                  <span>Your Rating:</span>
                  <div className="stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        type="button" 
                        key={star} 
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="star-btn"
                      >
                        <Star size={24} className={star <= newReview.rating ? 'star-filled' : 'star-empty'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="comment-input-wrapper">
                  <textarea 
                    placeholder="Write your thoughts about this product..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="submit-review-btn" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : <><Send size={18} /> Post Review</>}
                </button>
              </form>
            ) : (
              <div className="review-login-prompt">
                <p>Please <Link to="/auth">log in</Link> to share your review.</p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="reviews-container">
            {product.reviews && product.reviews.length > 0 ? (
              <div className="reviews-list">
                {product.reviews.map((review) => (
                  <div key={review.id} className="review-card">
                    <div className="review-header">
                      <div className="user-info">
                        <div className="user-avatar">
                          <User size={20} />
                        </div>
                        <div>
                          <div className="user-name">{review.user_name || 'Anonymous'}</div>
                          <div className="review-date">
                            <Clock size={12} /> {new Date(review.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="review-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={14} className={star <= review.rating ? 'star-filled' : 'star-empty'} />
                        ))}
                      </div>
                    </div>
                    <p className="review-comment">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
