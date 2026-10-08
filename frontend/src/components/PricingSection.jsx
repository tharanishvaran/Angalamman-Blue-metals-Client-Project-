import React from 'react';
import { Tag, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

export default function PricingSection({ materials = [], onOpenQuote }) {
  return (
    <section id="pricing" className="section-padding" style={{ position: 'relative' }}>
      <div className="container">
        
        {/* Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <Tag size={16} />
            <span>Transparent Material Tariffs</span>
          </div>
          <h2 className="section-title">
            Dynamic Material <span className="gradient-text">Pricing Index</span>
          </h2>
          <p className="section-desc">
            Direct crusher rates synchronized in real-time from our Puducherry yard inventory database.
          </p>
        </AnimatedSection>

        {/* Pricing Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem'
        }}>
          {materials.map((mat, idx) => (
            <AnimatedSection
              key={mat.id}
              animation="fade-up"
              delay={`${Math.min(idx * 0.06, 0.4)}s`}
              className="glass-card hover-lift"
              style={{
                padding: '1.6rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#fb923c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {mat.category}
                  </span>
                  {mat.available ? (
                    <span className="badge badge-green" style={{ fontSize: '0.68rem' }}>Available</span>
                  ) : (
                    <span className="badge badge-red" style={{ fontSize: '0.68rem' }}>Limited</span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {mat.name}
                </h3>
                
                <p style={{ fontSize: '0.84rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {mat.description ? mat.description.slice(0, 78) + '...' : ''}
                </p>
              </div>

              <div>
                <div style={{
                  padding: '0.85rem 1rem',
                  background: 'rgba(37, 99, 235, 0.12)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  border: '1px solid rgba(37, 99, 235, 0.28)'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Yard Rate:</span>
                  <span style={{ fontSize: '1.45rem', fontWeight: 800, color: '#38bdf8' }}>
                    ₹{mat.price.toLocaleString('en-IN')} <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>/ {mat.unit}</span>
                  </span>
                </div>

                <button
                  onClick={() => onOpenQuote(mat.name)}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', fontSize: '0.84rem' }}
                >
                  <FileText size={14} /> Get Exact Quote
                </button>
              </div>

            </AnimatedSection>
          ))}
        </div>

        {/* Disclaimer Notice Card */}
        <AnimatedSection
          animation="fade-up"
          style={{
            maxWidth: '880px',
            margin: '0 auto',
            background: 'rgba(249, 115, 22, 0.08)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: '18px',
            padding: '1.6rem 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.5rem',
            flexWrap: 'wrap',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: '1 1 300px' }}>
            <AlertCircle size={28} color="#fb923c" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: '#ffffff' }}>Important Pricing Policy</div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                Prices reflect ex-depot rates and adjust dynamically with diesel costs, load volume discounts, and site distance across Puducherry.
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenQuote()}
            className="btn btn-orange btn-shimmer"
            style={{ whiteSpace: 'nowrap' }}
          >
            Get Custom Site Quote
          </button>
        </AnimatedSection>

      </div>
    </section>
  );
}
