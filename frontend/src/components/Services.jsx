import React from 'react';
import { 
  Layers, 
  Feather, 
  Gem, 
  Mountain, 
  Wind, 
  Truck, 
  Building2, 
  Navigation,
  ArrowRight
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const iconMap = {
  Layers: <Layers size={26} color="#38bdf8" />,
  Feather: <Feather size={26} color="#fb923c" />,
  Gem: <Gem size={26} color="#38bdf8" />,
  Mountain: <Mountain size={26} color="#10b981" />,
  Wind: <Wind size={26} color="#a855f7" />,
  Truck: <Truck size={26} color="#f97316" />,
  Building2: <Building2 size={26} color="#3b82f6" />,
  Navigation: <Navigation size={26} color="#ec4899" />
};

export default function Services({ services = [], onSelectServiceQuote }) {
  return (
    <section id="services" className="section-padding" style={{ position: 'relative' }}>
      <div className="container">
        
        {/* Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <span>Specialized Capabilities</span>
          </div>
          <h2 className="section-title">
            Our Construction & <span className="gradient-text">Logistics Services</span>
          </h2>
          <p className="section-desc">
            Complete supply-chain coverage for Puducherry builders: from raw aggregates and plaster sand to heavy tipper site transportation.
          </p>
        </AnimatedSection>

        {/* Services Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '2rem'
        }}>
          {services.map((service, idx) => (
            <AnimatedSection
              key={service.id}
              animation="fade-up"
              delay={`${Math.min(idx * 0.08, 0.45)}s`}
              className="glass-card hover-lift"
              style={{
                padding: '2rem 1.85rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {/* Top Accent Icon & Starting Tag */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.09)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.3s ease'
                  }}>
                    {iconMap[service.icon_name] || <Truck size={26} color="#38bdf8" />}
                  </div>

                  {service.starting_price > 0 && (
                    <span style={{ 
                      fontSize: '0.78rem', 
                      color: '#93c5fd', 
                      background: 'rgba(37, 99, 235, 0.14)', 
                      border: '1px solid rgba(37, 99, 235, 0.3)',
                      padding: '0.25rem 0.65rem', 
                      borderRadius: '8px',
                      fontWeight: 600
                    }}>
                      From ₹{service.starting_price.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.75rem' }}>
                  {service.name}
                </h3>

                <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.75rem' }}>
                  {service.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectServiceQuote(service.name)}
                className="btn btn-outline btn-sm"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.65rem 1rem'
                }}
              >
                <span style={{ fontWeight: 600 }}>Request Service</span>
                <ArrowRight size={16} />
              </button>

            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  );
}
