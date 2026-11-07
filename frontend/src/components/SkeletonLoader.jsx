import React from 'react';

// Single Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px', padding: '16px' }}>
      <div className="skeleton skeleton-image" style={{ paddingTop: '100%', width: '100%', marginBottom: '14px' }}></div>
      <div className="skeleton" style={{ height: '18px', width: '30%', marginBottom: '10px' }}></div>
      <div className="skeleton skeleton-text" style={{ height: '18px', width: '90%', marginBottom: '8px' }}></div>
      <div className="skeleton skeleton-text" style={{ height: '18px', width: '60%', marginBottom: '10px' }}></div>
      
      {/* Simulated Star Rating Row */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ width: '13px', height: '13px', borderRadius: '50%' }}></div>
        ))}
        <div className="skeleton" style={{ width: '40px', height: '13px' }}></div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '45%' }}>
          <div className="skeleton" style={{ height: '12px', width: '50%' }}></div>
          <div className="skeleton" style={{ height: '20px', width: '100%' }}></div>
        </div>
        <div className="skeleton" style={{ height: '38px', width: '38px', borderRadius: '10px' }}></div>
      </div>
    </div>
  );
};

// Grid of Product Skeletons
export const ProductListSkeleton = ({ count = 6 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '24px',
      width: '100%'
    }}>
      {Array.from({ length: count }).map((_, idx) => (
        <ProductCardSkeleton key={idx} />
      ))}
    </div>
  );
};

// Product Detail Page Skeleton
export const ProductDetailSkeleton = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', margin: '40px 0' }}>
      <div className="skeleton skeleton-image" style={{ height: '450px', width: '100%' }}></div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="skeleton" style={{ height: '20px', width: '20%' }}></div>
        <div className="skeleton" style={{ height: '36px', width: '70%' }}></div>
        <div className="skeleton" style={{ height: '28px', width: '40%' }}></div>
        <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
        <div className="skeleton" style={{ height: '40px', width: '50%', marginTop: '16px' }}></div>
        <div className="skeleton" style={{ height: '50px', width: '100%', marginTop: '24px' }}></div>
      </div>
    </div>
  );
};

// Dashboard Statistics Skeleton
export const DashboardSkeleton = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="glass-card" style={{ height: '120px' }}>
            <div className="skeleton" style={{ height: '16px', width: '50%', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ height: '32px', width: '80%' }}></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div className="glass-card" style={{ height: '350px' }}>
          <div className="skeleton" style={{ height: '24px', width: '30%', marginBottom: '24px' }}></div>
          <div className="skeleton" style={{ height: '240px', width: '100%' }}></div>
        </div>
        <div className="glass-card" style={{ height: '350px' }}>
          <div className="skeleton" style={{ height: '24px', width: '50%', marginBottom: '24px' }}></div>
          <div className="skeleton" style={{ height: '240px', width: '100%' }}></div>
        </div>
      </div>
    </div>
  );
};
