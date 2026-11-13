import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { ResponsiveContainer, ComposedChart, AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package, ArrowRight, Eye, LayoutDashboard, ShoppingBag, Ticket } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { theme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeMainChart, setActiveMainChart] = useState('composed');
  const [data, setData] = useState({
    stats: { totalRevenue: 0, totalUsers: 0, totalOrders: 0, statusCounts: {} },
    bestSellers: [],
    recentOrders: [],
    salesOverTime: []
  });

  // Access control
  useEffect(() => {
    if (!isAdmin) {
      showToast('Access denied.', 'error');
      navigate('/');
      return;
    }

    const loadDashboardStats = async () => {
      try {
        const res = await api.analytics.getDashboardStats();
        setData(res);
      } catch (err) {
        showToast(err.message || 'Failed to load report data.', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div style={{ padding: '40px 5%' }}>
        <DashboardSkeleton />
      </div>
    );
  }

  const formatVND = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
  };

  const composedData = data.salesOverTime?.map(item => {
    const revenue = parseFloat(item.revenue);
    const orders = parseInt(item.ordersCount);
    return {
      name: item.month,
      Revenue: revenue,
      Orders: orders,
      AOV: orders > 0 ? Math.round(revenue / orders) : 0
    };
  }) || [];

  const statusData = [
    { name: 'Pending', value: data.stats?.statusCounts?.pending || 0, color: 'var(--color-warning)' },
    { name: 'Paid', value: data.stats?.statusCounts?.paid || 0, color: 'var(--color-success)' },
    { name: 'Shipping', value: data.stats?.statusCounts?.shipping || 0, color: 'var(--color-accent)' },
    { name: 'Completed', value: data.stats?.statusCounts?.completed || 0, color: 'var(--color-primary)' },
    { name: 'Cancelled', value: data.stats?.statusCounts?.cancelled || 0, color: 'var(--color-error)' }
  ].filter(item => item.value > 0);

  const bestSellersData = data.bestSellers?.map(item => ({
    name: item.product?.name ? (item.product.name.length > 15 ? item.product.name.slice(0, 15) + '...' : item.product.name) : 'Product',
    Revenue: parseFloat(item.revenue),
    Units: parseInt(item.totalSold)
  })) || [];

  const statCards = [
    { title: 'Cumulative Revenue', value: formatVND(data.stats?.totalRevenue), icon: <DollarSign size={20} color="#34d399" />, glow: 'rgba(16, 185, 129, 0.15)' },
    { title: 'Total Orders', value: data.stats?.totalOrders, icon: <ShoppingCart size={20} color="#3b82f6" />, glow: 'rgba(59, 130, 246, 0.15)' },
    { title: 'Registered Customers', value: data.stats?.totalUsers, icon: <Users size={20} color="#64748b" />, glow: 'rgba(100, 116, 139, 0.15)' },
    { title: 'Pending Orders', value: data.stats?.statusCounts?.pending || 0, icon: <Package size={20} color="#f59e0b" />, glow: 'rgba(245, 158, 11, 0.15)' }
  ];

  return (
    <div style={{ padding: '40px 5%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LayoutDashboard size={32} color="var(--color-primary)" /> Admin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Welcome admin, {user?.name}</p>
        </div>

        {/* Navigation Quick Links */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link to="/admin/products" className="btn btn-secondary">
            <ShoppingBag size={16} /> Products
          </Link>
          <Link to="/admin/orders" className="btn btn-accent">
            <ShoppingCart size={16} /> Orders
          </Link>
          <Link to="/admin/users" className="btn btn-secondary">
            <Users size={16} /> Users
          </Link>
          <Link to="/admin/coupons" className="btn btn-secondary">
            <Ticket size={16} /> Coupons
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        {statCards.map((card, idx) => (
          <div key={idx} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
            <div>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>{card.title}</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)' }}>{card.value}</span>
            </div>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: card.glow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 0 15px ${card.glow}`
            }}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Sales Performance Chart */}
      <div className="glass-card" style={{ padding: '24px', minHeight: '450px', display: 'flex', flexDirection: 'column', marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>Sales and Transaction Analytics</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Historical monthly overview of sales performance, volume, and Average Order Value (AOV)</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', background: 'var(--input-bg)', padding: '4px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            {[
              { id: 'composed', label: 'Overview' },
              { id: 'revenue', label: 'Revenue' },
              { id: 'orders', label: 'Volume' }
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveMainChart(type.id)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  border: 'none',
                  background: activeMainChart === type.id ? 'var(--color-primary)' : 'transparent',
                  color: activeMainChart === type.id ? (theme === 'light' ? '#ffffff' : '#0f172a') : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{ flex: 1, minHeight: '320px' }}>
          {composedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {activeMainChart === 'composed' ? (
                <ComposedChart data={composedData} margin={{ top: 10, right: -5, left: -5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis yAxisId="left" stroke="var(--text-muted)" fontSize={11} tickFormatter={(val) => `${val/1000000}M`} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: 'var(--toast-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                    formatter={(value, name) => {
                      if (name === 'Revenue') return [formatVND(value), 'Revenue'];
                      if (name === 'AOV') return [formatVND(value), 'Average Order Value'];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area yAxisId="left" type="monotone" name="Revenue" dataKey="Revenue" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  <Bar yAxisId="right" name="Orders Count" dataKey="Orders" barSize={20} fill="var(--color-secondary)" radius={[4, 4, 0, 0]} opacity={0.6} />
                  <Line yAxisId="left" type="monotone" name="AOV" dataKey="AOV" stroke="var(--color-accent)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </ComposedChart>
              ) : activeMainChart === 'revenue' ? (
                <AreaChart data={composedData} margin={{ top: 10, right: -5, left: -5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenueOnly" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickFormatter={(val) => `${val/1000000}M`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--toast-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                    formatter={(value) => [formatVND(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="Revenue" stroke="var(--color-accent)" fillOpacity={1} fill="url(#colorRevenueOnly)" strokeWidth={2.5} />
                </AreaChart>
              ) : (
                <LineChart data={composedData} margin={{ top: 10, right: -5, left: -5, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip
                    contentStyle={{ background: 'var(--toast-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="Orders" stroke="var(--color-primary)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              No transaction data available yet.
            </div>
          )}
        </div>
      </div>

      {/* Auxiliary Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px', marginBottom: '40px' }}>
        
        {/* Order Status Distribution (Donut Chart) */}
        <div className="glass-card" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>Order Status Share</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Distribution of transaction states across the store</p>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '260px', position: 'relative' }}>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'var(--toast-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                    labelStyle={{ color: 'var(--text-primary)', fontWeight: 'bold' }}
                    formatter={(value) => [value, 'Orders']}
                  />
                  <Legend 
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                    iconSize={10}
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', right: 0 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No status data available yet.
              </div>
            )}
          </div>
        </div>

        {/* Best Sellers (Bar Chart) */}
        <div className="glass-card" style={{ padding: '24px', height: '400px', display: 'flex', flexDirection: 'column' }}>
          <div>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '4px' }}>Top Selling Products</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Revenue performance comparison of top 5 best sellers</p>
          </div>
          <div style={{ flex: 1, minHeight: '260px', paddingTop: '20px' }}>
            {bestSellersData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bestSellersData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={(val) => `${val/1000000}M`} />
                  <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} width={80} />
                  <Tooltip
                    contentStyle={{ background: 'var(--toast-bg)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}
                    formatter={(value, name) => {
                      if (name === 'Revenue') return [formatVND(value), 'Revenue'];
                      return [value, name];
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar name="Revenue" dataKey="Revenue" fill="var(--color-accent)" radius={[0, 4, 4, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No bestseller data available yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Recent Orders</h3>
          <Link to="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none', color: 'var(--color-primary)', fontSize: '13px', fontWeight: '600' }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 8px' }}>Order ID</th>
                <th style={{ padding: '12px 8px' }}>Customer</th>
                <th style={{ padding: '12px 8px' }}>Total</th>
                <th style={{ padding: '12px 8px' }}>Payment</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders?.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}>
                  <td style={{ padding: '16px 8px', fontWeight: '700' }}>#{order.id}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{order.user?.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.user?.email}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 8px', fontWeight: '600' }}>{formatVND(order.totalAmount)}</td>
                  <td style={{ padding: '16px 8px' }}>
                    <span className={`badge ${order.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                      {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 8px' }}>
                    {order.status === 'pending' && <span className="badge badge-warning">Pending</span>}
                    {order.status === 'paid' && <span className="badge badge-success">Paid</span>}
                    {order.status === 'shipping' && <span className="badge badge-primary">Shipping</span>}
                    {order.status === 'completed' && <span className="badge badge-success">Completed</span>}
                    {order.status === 'cancelled' && <span className="badge badge-error">Cancelled</span>}
                  </td>
                  <td style={{ padding: '16px 8px', textAlign: 'right' }}>
                    <Link to="/admin/orders" className="btn btn-secondary" style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '6px' }} title="View Details">
                      <Eye size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
