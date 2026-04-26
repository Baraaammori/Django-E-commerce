import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { cartService } from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import './Cart.css';

export const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await cartService.getCart();
      setCart(res.data);
    } catch (error) {
      console.error("Failed to load cart", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, currentQty, change, stock) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > stock) {
      toast.error(`Only ${stock} items available`);
      return;
    }
    
    try {
      const res = await cartService.updateItem(id, { quantity: newQty });
      setCart(res.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update quantity");
    }
  };

  const removeItem = async (id) => {
    try {
      const res = await cartService.removeItem(id);
      setCart(res.data);
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const cartItems = cart?.items || [];
  const subtotal = parseFloat(cart?.subtotal || 0);
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  return (
    <div className="cart-page container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <div className="breadcrumb">
          <span>Home</span> / <span>Cart</span>
        </div>
      </div>

      {loading ? (
        <div className="empty-cart"><p>Loading cart...</p></div>
      ) : !user ? (
        <div className="empty-cart">
          <h2>Please Log In</h2>
          <p>You need to be logged in to view your cart.</p>
          <Link to="/auth" className="continue-shopping-btn">Log In</Link>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="continue-shopping-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-items-section">
            <div className="cart-header hidden-mobile">
              <div className="col-product">Product</div>
              <div className="col-price">Price</div>
              <div className="col-qty">Quantity</div>
              <div className="col-total">Subtotal</div>
              <div className="col-action"></div>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <motion.div 
                  key={item.id} 
                  className="cart-item"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="item-details col-product">
                    {item.product.image ? (
                      <img src={item.product.image} alt={item.product.name} className="item-img" />
                    ) : (
                      <div className="item-img" style={{ backgroundColor: '#f5f5f5' }}></div>
                    )}
                    <div>
                      <div className="item-category">{item.product.category_name}</div>
                      <Link to={`/products/${item.product.id}`} className="item-name">{item.product.name}</Link>
                    </div>
                  </div>
                  
                  <div className="item-price col-price">
                    <span className="mobile-label">Price:</span>
                    ${item.product.price}
                  </div>
                  
                  <div className="item-qty-wrapper col-qty">
                    <span className="mobile-label">Quantity:</span>
                    <div className="cart-qty-selector">
                      <button onClick={() => updateQuantity(item.id, item.quantity, -1, item.product.stock)} disabled={item.quantity <= 1}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity, 1, item.product.stock)} disabled={item.quantity >= item.product.stock}><Plus size={14} /></button>
                    </div>
                  </div>
                  
                  <div className="item-subtotal col-total">
                    <span className="mobile-label">Subtotal:</span>
                    <strong>${item.line_total}</strong>
                  </div>
                  
                  <div className="item-action col-action">
                    <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Remove item">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="cart-footer">
              <Link to="/products" className="continue-link">← Continue Shopping</Link>
            </div>
          </div>

          <div className="cart-summary-section">
            <div className="summary-card">
              <h3>Order Summary</h3>
              
              <div className="summary-row">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (18%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="text-success">Free</span>
              </div>
              
              <div className="summary-divider"></div>
              
              <div className="summary-row total-row">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button 
                className="checkout-btn"
                onClick={() => navigate('/checkout')}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
