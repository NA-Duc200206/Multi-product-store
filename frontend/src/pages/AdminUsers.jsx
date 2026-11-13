import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Users, Search, Shield, UserCheck, Calendar } from 'lucide-react';

const AdminUsers = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    if (!isAdmin) {
      showToast('Access denied. Administrator privileges required.', 'error');
      navigate('/');
      return;
    }
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.auth.getAllUsers();
      setUsers(res.users || []);
    } catch (err) {
      showToast(err.message || 'Failed to load user accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser?.id || userId === currentUser?._id) {
      if (!window.confirm('Warning: Changing your own role may revoke your administrative privileges. Proceed?')) {
        return;
      }
    }
    try {
      await api.auth.updateUserRole(userId, newRole);
      showToast('User role updated successfully!', 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user role.', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'warehouse':
        return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'support':
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
      default:
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
    }
  };

  return (
    <div style={{ padding: '40px 5%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link 
          to="/admin" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            textDecoration: 'none', 
            color: 'var(--text-secondary)', 
            marginBottom: '16px', 
            fontWeight: '600' 
          }}
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users size={28} color="var(--color-primary)" /> Customer & Staff Management
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              View registered users, assign roles, and inspect account activity ({users.length} total users).
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1', minWidth: '260px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by customer name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Roles</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="warehouse">Warehouse</option>
            <option value="support">Support</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading user records...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
          <p style={{ fontSize: '16px', fontWeight: '500' }}>No users match the search filter.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto', padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>User</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Email</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Role</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600' }}>Joined</th>
                <th style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const badgeStyle = getRoleBadgeStyle(u.role);
                const isSelf = u.id === currentUser?.id || u._id === currentUser?._id;
                return (
                  <tr key={u.id || u._id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>
                          {(u.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            {u.name} {isSelf && <span style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: '700' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: {String(u.id || u._id).slice(-6)}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '100px',
                        fontSize: '12px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        ...badgeStyle
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id || u._id, e.target.value)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '1px solid var(--glass-border)',
                          background: 'var(--input-bg)',
                          color: 'var(--text-primary)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="warehouse">Warehouse</option>
                        <option value="support">Support</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

