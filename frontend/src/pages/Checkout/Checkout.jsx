import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, Wallet, ArrowRight, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { cartService, userService, ordersService } from '../../services/api';
import toast from 'react-hot-toast';
import './Checkout.css';

export const Checkout = () => {
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressData, setAddressData] = useState({
    full_name: '',
    street_address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    label: 'Home'
  });
  const [createdAddressId, setCreatedAddressId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await cartService.getCart();
      if (!res.data || res.data.items.length === 0) {
        toast.error("Your cart is empty!");
        navigate('/products');
        return;
      }
      setCart(res.data);
    } catch (error) {
      console.error("Failed to load cart", error);
      toast.error("Failed to load cart for checkout");
    }
  };

  const handleAddressChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await userService.createAddress(addressData);
      setCreatedAddressId(res.data.id);
      setStep(2);
    } catch (error) {
      toast.error("Failed to save shipping address");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await ordersService.checkout({ address_id: createdAddressId });
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="checkout-page container">
        <motion.div 
          className="checkout-success"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="success-content">
            <CheckCircle size={64} className="success-icon" />
            <h1>Order Confirmed!</h1>
            <p>Thank you for shopping at MegaMart. Your order has been placed successfully and is being processed.</p>
            <Button size="lg" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!cart) return <div className="container mt-8"><p>Loading checkout...</p></div>;

  const subtotal = parseFloat(cart?.subtotal || 0);
  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  return (
    <div className="checkout-page container">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Shipping</div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
          <div className="step-divider"></div>
          <div className="step">3. Confirmation</div>
        </div>
      </div>

      <div className="checkout-layout">
        <div className="checkout-form-container">
          <motion.div 
            className="checkout-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={step}
          >
            {step === 1 && (
              <form onSubmit={handleShippingSubmit}>
                <h2>Shipping Information</h2>
                <div className="form-grid">
                  <Input label="Full Name" name="full_name" value={addressData.full_name} onChange={handleAddressChange} required />
                  <Input label="Street Address" name="street_address" value={addressData.street_address} onChange={handleAddressChange} className="full-width" required />
                  <Input label="City" name="city" value={addressData.city} onChange={handleAddressChange} required />
                  <Input label="State/Province" name="state" value={addressData.state} onChange={handleAddressChange} required />
                  <Input label="ZIP / Postal Code" name="postal_code" value={addressData.postal_code} onChange={handleAddressChange} required />
                  <Input label="Country" name="country" value={addressData.country} onChange={handleAddressChange} required />
                </div>
                
                <div className="checkout-actions mt-6">
                  <Button type="submit" size="lg" className="next-btn" disabled={loading} rightIcon={<ArrowRight size={18} />}>
                    {loading ? 'Saving...' : 'Continue to Payment'}
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handlePaymentSubmit}>
                <h2>Payment Method</h2>
                <div className="payment-options">
                  <label className="payment-option">
                    <input type="radio" name="payment" value="card" defaultChecked />
                    <div className="option-content">
                      <CreditCard size={24} />
                      <span className="font-bold">Credit Card (Mock)</span>
                    </div>
                  </label>
                </div>

                <div className="form-grid mt-6">
                  <Input label="Card Number" className="full-width" defaultValue="4242 4242 4242 4242" required />
                  <Input label="Name on Card" className="full-width" defaultValue={addressData.full_name || "Test User"} required />
                  <Input label="Expiration Date (MM/YY)" defaultValue="12/26" required />
                  <Input label="CVV" defaultValue="123" required />
                </div>

                <div className="checkout-actions mt-6">
                  <Button variant="outline" size="lg" onClick={() => setStep(1)} type="button">
                    Back to Shipping
                  </Button>
                  <Button type="submit" size="lg" className="next-btn" disabled={loading} rightIcon={<CheckCircle size={18} />}>
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>

        <div className="checkout-summary">
          <div className="summary-card">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart?.items.map(item => (
                <div className="summary-item" key={item.id}>
                  <div className="item-info">
                    <Package size={16} />
                    <span>{item.product.name}</span>
                  </div>
                  <span className="item-qty">x{item.quantity}</span>
                  <span>${item.line_total}</span>
                </div>
              ))}
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-row">
              <span>Subtotal</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};
