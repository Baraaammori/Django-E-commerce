import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Package, MapPin, Settings, LogOut, LayoutDashboard, TrendingUp, ShoppingBag, DollarSign, CreditCard } from 'lucide-react';
import { Input } from '../../components/Input/Input';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import { ordersService, userService } from '../../services/api';
import toast from 'react-hot-toast';
import './Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || ''
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, addressesRes] = await Promise.all([
          ordersService.getOrders(),
          userService.getAddresses()
        ]);
        setOrders(ordersRes.data.results || ordersRes.data || []);
        setAddresses(addressesRes.data || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(profileData);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error("Failed to update profile.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    try {
      await userService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      toast.success("Password updated successfully!");
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to update password.");
    }
  };

  // Derived Metrics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const savedMethods = addresses.length; // Approximating methods with addresses for now

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return <div className="container" style={{ padding: '40px 0' }}>Loading dashboard...</div>;

  return (
    <div className="dashboard-page container">
      <div className="dashboard-layout">
        
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="user-profile-summary">
            <div className="avatar">
              {user?.first_name?.charAt(0) || user?.username?.charAt(0) || <User size={28} />}
            </div>
            <div className="user-info">
              <h3>{user?.first_name || user?.username || 'Guest User'}</h3>
              <p>{user?.email || 'No email provided'}</p>
              <span className="role-badge">{user?.is_staff ? 'Administrator' : 'Customer'}</span>
            </div>
          </div>

          <nav className="dashboard-nav">
            <button 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={18} /> Overview
            </button>
            <button 
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <Package size={18} /> Order History
            </button>
            <button 
              className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => setActiveTab('addresses')}
            >
              <MapPin size={18} /> Saved Addresses
            </button>
            <button 
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <Settings size={18} /> Account Settings
            </button>
            {user?.is_staff && (
              <a 
                href="http://localhost:8000/admin/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="nav-item admin-nav-item"
                style={{ marginTop: 'auto', marginBottom: '10px' }}
              >
                <LayoutDashboard size={18} /> Django Dashboard
              </a>
            )}
            <button className="nav-item text-error" onClick={logout} style={user?.is_staff ? {} : { marginTop: 'auto' }}>
              <LogOut size={18} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <div className="dashboard-content-wrapper">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div 
                key="overview"
                className="dashboard-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="content-header">
                  <h2>Dashboard Overview</h2>
                  <p className="text-secondary">Track your activity, orders, and account status.</p>
                </div>

                {/* Metrics Grid */}
                <div className="metrics-grid">
                  <motion.div className="metric-card" variants={itemVariants}>
                    <div className="metric-icon-wrapper bg-blue-light">
                      <ShoppingBag size={24} className="text-blue" />
                    </div>
                    <div className="metric-info">
                      <p className="metric-label">Total Orders</p>
                      <h3 className="metric-value">{totalOrders}</h3>
                    </div>
                  </motion.div>

                  <motion.div className="metric-card" variants={itemVariants}>
                    <div className="metric-icon-wrapper bg-green-light">
                      <DollarSign size={24} className="text-green" />
                    </div>
                    <div className="metric-info">
                      <p className="metric-label">Total Spent</p>
                      <h3 className="metric-value">${totalSpent.toFixed(2)}</h3>
                    </div>
                  </motion.div>

                  <motion.div className="metric-card" variants={itemVariants}>
                    <div className="metric-icon-wrapper bg-purple-light">
                      <Package size={24} className="text-purple" />
                    </div>
                    <div className="metric-info">
                      <p className="metric-label">Active Orders</p>
                      <h3 className="metric-value">{activeOrders}</h3>
                    </div>
                  </motion.div>

                  <motion.div className="metric-card" variants={itemVariants}>
                    <div className="metric-icon-wrapper bg-orange-light">
                      <CreditCard size={24} className="text-orange" />
                    </div>
                    <div className="metric-info">
                      <p className="metric-label">Saved Addresses</p>
                      <h3 className="metric-value">{savedMethods}</h3>
                    </div>
                  </motion.div>
                </div>

                {/* Recent Activity Composition */}
                <div className="layout-composition-row">
                  <motion.div className="dashboard-panel flex-2" variants={itemVariants}>
                    <div className="panel-header flex-between">
                      <h3>Recent Orders</h3>
                      <button className="link-btn" onClick={() => setActiveTab('orders')}>View All</button>
                    </div>
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map(order => (
                            <tr key={order.id}>
                              <td className="font-medium">#ORD-{order.id}</td>
                              <td className="text-secondary">{new Date(order.created_at).toLocaleDateString()}</td>
                              <td>
                                <span className={`status-badge ${order.status?.toLowerCase() === 'delivered' ? 'delivered' : 'processing'}`}>
                                  {order.status || 'Processing'}
                                </span>
                              </td>
                              <td className="font-bold">${parseFloat(order.total_amount).toFixed(2)}</td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No orders found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  <motion.div className="dashboard-panel flex-1" variants={itemVariants}>
                    <div className="panel-header">
                      <h3>Quick Actions</h3>
                    </div>
                    <div className="quick-actions-list">
                      <button className="quick-action-btn" onClick={() => setActiveTab('addresses')}>
                        <div className="action-icon"><MapPin size={18}/></div>
                        <span>Manage Addresses</span>
                      </button>
                      <button className="quick-action-btn" onClick={() => setActiveTab('profile')}>
                        <div className="action-icon"><Settings size={18}/></div>
                        <span>Update Password</span>
                      </button>
                      <Button variant="primary" className="full-width mt-4" onClick={() => window.location.href='/products'}>Continue Shopping</Button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div 
                key="orders"
                className="dashboard-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="content-header">
                  <h2>Order History</h2>
                  <p className="text-secondary">View and manage all your past and current orders.</p>
                </div>
                
                <div className="orders-list">
                  {orders.length === 0 ? (
                    <div className="dashboard-panel text-center" style={{ padding: '40px' }}>
                      <p>You haven't placed any orders yet.</p>
                      <Button onClick={() => window.location.href='/products'} style={{ marginTop: '20px' }}>Start Shopping</Button>
                    </div>
                  ) : (
                    orders.map(order => (
                      <motion.div key={order.id} className="order-card" variants={itemVariants}>
                        <div className="order-header">
                          <div>
                            <p className="order-id">Order #ORD-{order.id}</p>
                            <p className="order-date">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className={`status-badge ${order.status?.toLowerCase() === 'delivered' ? 'delivered' : 'processing'}`}>
                            {order.status || 'Processing'}
                          </span>
                        </div>
                        <div className="order-items">
                          {order.items?.map(item => (
                            <div key={item.id} className="order-item-mini">
                              {item.product_image ? (
                                <img src={item.product_image} alt={item.product_name} />
                              ) : (
                                <div style={{ width: 60, height: 60, backgroundColor: '#eee', borderRadius: 8 }}></div>
                              )}
                              <div className="item-mini-info">
                                <p className="font-bold">{item.product_name}</p>
                                <p className="text-secondary">Qty: {item.quantity}</p>
                              </div>
                              <div className="item-mini-price ml-auto font-bold">
                                ${parseFloat(item.price).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="order-footer">
                          <p className="order-total">Total: <strong>${parseFloat(order.total_amount).toFixed(2)}</strong></p>
                          <div className="action-group">
                            <Button variant="outline" size="sm">Track Package</Button>
                            <Button variant="secondary" size="sm">View Details</Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                className="dashboard-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="content-header">
                  <h2>Account Settings</h2>
                  <p className="text-secondary">Manage your personal information and security.</p>
                </div>

                <motion.div className="dashboard-panel mb-6" variants={itemVariants}>
                  <h3 className="panel-title-sm">Personal Information</h3>
                  <form className="profile-form" onSubmit={handleProfileUpdate}>
                    <div className="form-grid">
                      <Input 
                        label="First Name" 
                        value={profileData.first_name} 
                        onChange={(e) => setProfileData({...profileData, first_name: e.target.value})} 
                      />
                      <Input 
                        label="Last Name" 
                        value={profileData.last_name} 
                        onChange={(e) => setProfileData({...profileData, last_name: e.target.value})} 
                      />
                      <Input 
                        label="Email Address" 
                        value={user?.email || ''} 
                        disabled 
                        className="full-width" 
                      />
                      <Input 
                        label="Phone Number" 
                        value={profileData.phone_number} 
                        onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})} 
                        className="full-width" 
                      />
                    </div>
                    <div className="form-actions border-top">
                      <Button type="submit">Save Changes</Button>
                    </div>
                  </form>
                </motion.div>

                <motion.div className="dashboard-panel" variants={itemVariants}>
                  <h3 className="panel-title-sm">Security & Password</h3>
                  <form className="profile-form" onSubmit={handlePasswordUpdate}>
                    <div className="form-grid-single">
                      <Input 
                        label="Current Password" 
                        type="password" 
                        required
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                      />
                      <Input 
                        label="New Password" 
                        type="password" 
                        required
                        value={passwordData.new_password}
                        onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      />
                      <Input 
                        label="Confirm New Password" 
                        type="password" 
                        required
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                      />
                    </div>
                    <div className="form-actions border-top">
                      <Button type="submit" variant="outline">Update Password</Button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div 
                key="addresses"
                className="dashboard-content"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="content-header flex-between align-center">
                  <div>
                    <h2>Saved Addresses</h2>
                    <p className="text-secondary">Manage your shipping and billing addresses.</p>
                  </div>
                  <Button size="sm">Add New Address</Button>
                </div>
                
                <div className="address-grid">
                  {addresses.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: 16, border: '1px solid #eee' }}>
                      No saved addresses found.
                    </div>
                  ) : (
                    addresses.map(address => (
                      <motion.div key={address.id} className={`address-card ${address.is_default ? 'default-address' : ''}`} variants={itemVariants}>
                        {address.is_default && <div className="address-badge">Default</div>}
                        <h3 className="address-label">{address.title || 'Home'}</h3>
                        <div className="address-details">
                          <p className="font-bold">{address.full_name || `${user?.first_name} ${user?.last_name}`}</p>
                          <p>{address.street_address}</p>
                          {address.apartment && <p>{address.apartment}</p>}
                          <p>{address.city}, {address.state} {address.postal_code}</p>
                          <p>{address.country || 'United States'}</p>
                          <p className="text-secondary mt-2">{address.phone_number}</p>
                        </div>
                        <div className="address-actions border-top">
                          <button className="link-btn">Edit</button>
                          <button className="link-btn text-error ml-auto">Delete</button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
