import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, ChevronLeft, ChevronRight, Eye, DollarSign, ShoppingBag, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const AdminProducts = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Metrics states
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    lowStockCount: 0
  });

  // Selection states
  const [selectedProductIds, setSelectedProductIds] = useState([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    categoryId: '',
    description: '',
    image: '',
    colorsInput: '',
    sizesInput: ''
  });

  useEffect(() => {
    if (!isAdmin) {
      showToast('Access denied.', 'error');
      navigate('/');
      return;
    }
    loadData();
  }, [isAdmin, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load categories
      const catRes = await api.categories.getAll();
      setCategories(catRes.categories || []);

      // 2. Load products
      const prodRes = await api.products.getAll({ page, limit: 7 });
      setProducts(prodRes.products || []);
      setTotalPages(prodRes.totalPages || 1);

      // 3. Load analytics metrics for top summary cards
      const statsRes = await api.analytics.getDashboardStats();
      const rawProducts = prodRes.products || [];
      const lowStockList = rawProducts.filter(p => p.stock <= 10);

      setMetrics({
        totalRevenue: statsRes.stats?.totalRevenue || 0,
        activeOrders: statsRes.stats?.totalOrders || 0,
        lowStockCount: lowStockList.length
      });

      // Clear row selection on page change
      setSelectedProductIds([]);
    } catch (err) {
      showToast(err.message || 'Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Row selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProductIds(products.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (id) => {
    if (selectedProductIds.includes(id)) {
      setSelectedProductIds(selectedProductIds.filter(item => item !== id));
    } else {
      setSelectedProductIds([...selectedProductIds, id]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      name: '',
      price: '',
      stock: '',
      categoryId: categories.length > 0 ? categories[0].id.toString() : '',
      description: '',
      image: '',
      colorsInput: '',
      sizesInput: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setModalMode('edit');
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      categoryId: product.categoryId ? product.categoryId.toString() : '',
      description: product.description || '',
      image: product.image || '',
      colorsInput: product.options?.colors?.join(', ') || '',
      sizesInput: product.options?.sizes?.join(', ') || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const colors = formData.colorsInput
      ? formData.colorsInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    const sizes = formData.sizesInput
      ? formData.sizesInput.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      description: formData.description,
      image: formData.image,
      options: { colors, sizes }
    };

    try {
      if (modalMode === 'add') {
        await api.products.create(payload);
        showToast('Product added successfully!', 'success');
      } else {
        await api.products.update(editingId, payload);
        showToast('Product updated successfully!', 'success');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save product details.', 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await api.products.delete(id);
        showToast('Product deleted successfully!', 'success');
        loadData();
      } catch (err) {
        showToast(err.message || 'Failed to delete product.', 'error');
      }
    }
  };

  const formatVND = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(value);
  };

  return (
    <div style={{ padding: '40px 5%' }}>
      
      {/* Header and Back Link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '13px', fontWeight: '600' }} className="back-link">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          <h1 style={{ fontSize: '32px', color: 'var(--text-primary)' }}>Product Inventory</h1>
        </div>
        <button onClick={openAddModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Top Section: Row of 3 Metric Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Metric Card 1: Revenue */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>TOTAL INVENTORY REVENUE</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              {formatVND(metrics.totalRevenue)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
              <TrendingUp size={12} /> +12.5% <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>vs last month</span>
            </span>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={22} color="var(--color-success)" />
          </div>
        </div>

        {/* Metric Card 2: Active Orders */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>SYSTEM ORDERS</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              {metrics.activeOrders} orders
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
              <TrendingUp size={12} /> +8.2% <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>vs yesterday</span>
            </span>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={22} color="#3b82f6" />
          </div>
        </div>

        {/* Metric Card 3: Stock Alerts */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', fontWeight: '600' }}>LOW STOCK ALERTS</span>
            <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              {metrics.lowStockCount} products
            </span>
            <span style={{ fontSize: '12px', color: metrics.lowStockCount > 0 ? '#f59e0b' : 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
              <AlertTriangle size={12} /> {metrics.lowStockCount > 0 ? 'Restock Needed' : 'Safe'}
            </span>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={22} color="#f59e0b" />
          </div>
        </div>

      </div>

      {/* Bottom Section: Comprehensive Product Inventory Table */}
      <div className="glass-card" style={{ padding: '28px', borderRadius: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '20px' }}>Product List</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>Loading product inventory...</p>
        ) : products.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0' }}>Inventory is empty. No products found.</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    <th style={{ padding: '16px 12px', width: '40px' }}>
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedProductIds.length === products.length && products.length > 0}
                        style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ padding: '16px 12px' }}>Image</th>
                    <th style={{ padding: '16px 12px' }}>Product Name</th>
                    <th style={{ padding: '16px 12px' }}>Category</th>
                    <th style={{ padding: '16px 12px' }}>Price</th>
                    <th style={{ padding: '16px 12px' }}>Stock</th>
                    <th style={{ padding: '16px 12px' }}>Status</th>
                    <th style={{ padding: '16px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(prod => {
                    const isSelected = selectedProductIds.includes(prod.id);
                    
                    // Stock level badge config
                    let statusLabel = 'In Stock';
                    let statusBadgeClass = 'badge-success';
                    if (prod.stock === 0) {
                      statusLabel = 'Out of Stock';
                      statusBadgeClass = 'badge-error';
                    } else if (prod.stock <= 10) {
                      statusLabel = 'Low Stock';
                      statusBadgeClass = 'badge-warning';
                    }

                    return (
                      <tr 
                        key={prod.id} 
                        className={`table-row-hover ${isSelected ? 'row-selected' : ''}`}
                        style={{ 
                          borderBottom: '1px solid var(--glass-border)', 
                          color: 'var(--text-primary)',
                          background: isSelected ? 'rgba(124, 58, 237, 0.04)' : 'none',
                          transition: 'var(--transition-fast)'
                        }}
                      >
                        <td style={{ padding: '14px 12px' }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={() => handleSelectProduct(prod.id)}
                            style={{ accentColor: 'var(--color-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          {/* Circular/Rounded thumbnail */}
                          <img 
                            src={prod.image || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=800'} 
                            alt={prod.name} 
                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--glass-border)' }} 
                          />
                        </td>
                        <td style={{ padding: '14px 12px', fontWeight: '600', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {prod.name}
                        </td>
                        <td style={{ padding: '14px 12px' }}>{prod.category?.name || 'Uncategorized'}</td>
                        <td style={{ padding: '14px 12px', fontWeight: '700', color: 'var(--color-secondary)' }}>
                          {formatVND(prod.price)}
                        </td>
                        <td style={{ padding: '14px 12px', fontWeight: '600' }}>{prod.stock} units</td>
                        <td style={{ padding: '14px 12px' }}>
                          {/* Color coded native badges */}
                          <span className={`badge ${statusBadgeClass}`} style={{ fontSize: '11px', padding: '4px 10px', fontWeight: '700' }}>
                            {statusLabel}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <Link to={`/product/${prod.id}`} className="btn btn-secondary action-btn-icon" style={{ padding: '8px', borderRadius: '8px' }} title="View Details">
                              <Eye size={14} />
                            </Link>
                            <button onClick={() => openEditModal(prod)} className="btn btn-accent action-btn-icon" style={{ padding: '8px', borderRadius: '8px' }} title="Edit">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(prod.id, prod.name)} className="btn btn-danger action-btn-icon" style={{ padding: '8px', borderRadius: '8px' }} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination controller bar */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Showing page {page} of {totalPages}
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', opacity: page === 1 ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', opacity: page === totalPages ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit & Add Product Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--modal-backdrop)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative', border: '1px solid var(--glass-border)' }}>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '24px' }}>
              {modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Product Name *</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleInputChange}
                  className="glass-input"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Price (VND) *</label>
                  <input 
                    type="number" 
                    name="price" 
                    value={formData.price}
                    onChange={handleInputChange}
                    className="glass-input"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Stock Quantity *</label>
                  <input 
                    type="number" 
                    name="stock" 
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="glass-input"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Category *</label>
                <select 
                  name="categoryId" 
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="glass-input"
                  required
                >
                  <option value="" disabled>-- Select Category --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Image URL</label>
                <input 
                  type="text" 
                  name="image" 
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="glass-input"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Color Options (comma separated)</label>
                  <input 
                    type="text" 
                    name="colorsInput" 
                    value={formData.colorsInput}
                    onChange={handleInputChange}
                    placeholder="e.g. Pink, Red, White"
                    className="glass-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Size Options (comma separated)</label>
                  <input 
                    type="text" 
                    name="sizesInput" 
                    value={formData.sizesInput}
                    onChange={handleInputChange}
                    placeholder="e.g. S, M, L or 50ml, 100ml"
                    className="glass-input"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: '600' }}>Detailed Description</label>
                <textarea 
                  name="description" 
                  value={formData.description}
                  onChange={handleInputChange}
                  className="glass-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {modalMode === 'add' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.02) !important;
        }

        .action-btn-icon:hover {
          transform: scale(1.08);
        }

        .back-link:hover {
          color: var(--text-primary) !important;
          transform: translateX(-4px);
        }
      `}</style>
    </div>
  );
};

export default AdminProducts;
