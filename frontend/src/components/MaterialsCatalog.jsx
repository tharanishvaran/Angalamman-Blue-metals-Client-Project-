import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  FileText, 
  Truck, 
  Info, 
  Sparkles 
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';

export default function MaterialsCatalog({ 
  materials = [], 
  onSelectQuoteMaterial, 
  onSelectDeliveryMaterial 
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMaterialModal, setActiveMaterialModal] = useState(null);

  const categories = ['All', 'Sand', 'Aggregates', 'Bricks', 'Base Material', 'Powder'];

  const filteredMaterials = materials.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="materials" className="section-padding" style={{ background: 'rgba(8, 16, 32, 0.5)', position: 'relative' }}>
      <div className="container">
        
        {/* Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div className="section-tag">
            <Sparkles size={16} />
            <span>Crusher Certified Product Line</span>
          </div>
          <h2 className="section-title">
            Premium Construction <span className="gradient-text">Materials Catalogue</span>
          </h2>
          <p className="section-desc">
            Direct supply from quarry crushing plants with calibrated sieve analysis, high bulk density, and zero contamination.
          </p>

          {/* Filter Bar & Search */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            background: 'rgba(12, 22, 44, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.85rem 1.35rem',
            borderRadius: '20px',
            maxWidth: '920px',
            margin: '0 auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}>
            {/* Category Pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    border: selectedCategory === cat ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.06)',
                    background: selectedCategory === cat 
                      ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' 
                      : 'rgba(255, 255, 255, 0.04)',
                    color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                    transform: selectedCategory === cat ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: selectedCategory === cat ? '0 4px 16px rgba(37, 99, 235, 0.4)' : 'none'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '220px', flex: '1 1 200px' }}>
              <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                placeholder="Search sand, stone, bricks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.4rem',
                  background: 'rgba(7, 14, 27, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '9999px',
                  color: '#ffffff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        </AnimatedSection>

        {/* Materials Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem'
        }}>
          {filteredMaterials.map((material, idx) => (
            <div 
              key={material.id}
              className="glass-card hover-lift"
              style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                animation: `fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${Math.min(idx * 0.06, 0.4)}s forwards`
              }}
            >
              {/* Image Container with Zoom Effect */}
              <div className="card-img-zoom" style={{ position: 'relative', height: '195px', overflow: 'hidden' }}>
                <img 
                  src={material.image_url || '/images/hero.jpg'} 
                  alt={material.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="lazy"
                />
                
                {/* Availability Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 2
                }}>
                  {material.available ? (
                    <span className="badge badge-green" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>In Stock</span>
                  ) : (
                    <span className="badge badge-red" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>Unavailable</span>
                  )}
                </div>

                {/* Category Pill */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  zIndex: 2,
                  background: 'rgba(7, 14, 27, 0.88)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  padding: '0.25rem 0.7rem',
                  borderRadius: '8px',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}>
                  {material.category}
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.22rem', fontWeight: 700, color: '#ffffff' }}>
                    {material.name}
                  </h3>
                  <button 
                    onClick={() => setActiveMaterialModal(material)}
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.05)', 
                      border: 'none', 
                      color: '#94a3b8', 
                      cursor: 'pointer', 
                      padding: '5px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'color 0.2s, background 0.2s'
                    }}
                    title="View technical details"
                  >
                    <Info size={16} />
                  </button>
                </div>

                <p style={{
                  fontSize: '0.86rem',
                  color: '#94a3b8',
                  lineHeight: 1.55,
                  marginBottom: '1.25rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  flex: 1
                }}>
                  {material.description}
                </p>

                {/* Dynamic Price Display */}
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '12px',
                  marginBottom: '1.15rem',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
                      Yard Price
                    </span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>
                      ₹{material.price.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: '#cbd5e1', marginLeft: '5px' }}>
                      / {material.unit}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', textAlign: 'right' }}>
                    *Ex-yard Puducherry
                  </span>
                </div>

                {/* Card Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <button
                    onClick={() => onSelectQuoteMaterial(material.name)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.84rem' }}
                  >
                    <FileText size={14} /> Quote
                  </button>
                  <button
                    onClick={() => onSelectDeliveryMaterial(material.name)}
                    className="btn btn-orange btn-sm btn-shimmer"
                    style={{ fontSize: '0.84rem' }}
                  >
                    <Truck size={14} /> Deliver
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
            <p style={{ fontSize: '1.1rem' }}>No materials found matching "{searchQuery}". Try browsing by category or reset search.</p>
          </div>
        )}

      </div>

      {/* Material Detail Quick Modal */}
      {activeMaterialModal && (
        <div className="modal-overlay" onClick={() => setActiveMaterialModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#ffffff', fontWeight: 700 }}>{activeMaterialModal.name} Specifications</h3>
              <button 
                onClick={() => setActiveMaterialModal(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <img 
              src={activeMaterialModal.image_url} 
              alt={activeMaterialModal.name} 
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '14px', marginBottom: '1.25rem' }} 
            />

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
              <span className="badge badge-blue">Category: {activeMaterialModal.category}</span>
              <span className="badge badge-green">Unit: {activeMaterialModal.unit}</span>
            </div>

            <p style={{ color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {activeMaterialModal.description}
            </p>

            <div style={{
              background: 'rgba(37, 99, 235, 0.1)',
              border: '1px solid rgba(37, 99, 235, 0.3)',
              borderRadius: '14px',
              padding: '1.1rem',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>Standard Base Rate</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8' }}>
                  ₹{activeMaterialModal.price.toLocaleString('en-IN')} <span style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>/ {activeMaterialModal.unit}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#94a3b8', textAlign: 'right', maxWidth: '190px' }}>
                Transportation calculated by site distance from Thilaspettai depot.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  const name = activeMaterialModal.name;
                  setActiveMaterialModal(null);
                  onSelectQuoteMaterial(name);
                }}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Request Quotation
              </button>
              <button
                onClick={() => {
                  const name = activeMaterialModal.name;
                  setActiveMaterialModal(null);
                  onSelectDeliveryMaterial(name);
                }}
                className="btn btn-orange btn-shimmer"
                style={{ flex: 1 }}
              >
                Book Site Delivery
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
