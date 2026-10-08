import React from 'react';
import { 
  Award, 
  Scale, 
  Truck, 
  Clock, 
  Coins, 
  ShieldCheck 
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: <Award size={30} color="#38bdf8" />,
      title: 'Certified Crusher Quality',
      desc: 'Our blue metal aggregates are fractured into perfect cubical geometries for maximum compressive strength in structural concrete.'
    },
    {
      icon: <Scale size={30} color="#fb923c" />,
      title: 'Computerized Weighbridge',
      desc: 'Never worry about short loads. Every dispatched vehicle receives a computerized weighbridge printout for complete volume transparency.'
    },
    {
      icon: <Truck size={30} color="#10b981" />,
      title: 'Specialized Fleet Access',
      desc: 'Our nimble hydraulic tractors easily enter narrow residential colony streets where heavy lorries cannot maneuver.'
    },
    {
      icon: <Clock size={30} color="#eab308" />,
      title: 'Punctual Site Dispatch',
      desc: 'Concrete casting schedules wait for no one. We coordinate morning drops so your masonry and mason crews start right on time.'
    },
    {
      icon: <Coins size={30} color="#a855f7" />,
      title: 'Zero Middlemen Commission',
      desc: 'Direct dispatch pricing from quarry depots straight to your plot, passing maximum savings directly to you.'
    },
    {
      icon: <ShieldCheck size={30} color="#ec4899" />,
      title: 'Trusted Puducherry Roots',
      desc: 'Established in Thilaspettai with hundreds of satisfied independent home builders, engineers, and government contractors.'
    }
  ];

  return (
    <section className="section-padding" style={{ background: 'rgba(7, 14, 27, 0.75)', position: 'relative' }}>
      <div className="container">
        
        {/* Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <span>The Angalamman Advantage</span>
          </div>
          <h2 className="section-title">
            Why Builders Choose <span className="gradient-text">Our Materials</span>
          </h2>
          <p className="section-desc">
            We provide the solid foundation for homes, commercial complexes, and infrastructure across the Union Territory of Puducherry.
          </p>
        </AnimatedSection>

        {/* 6 Grid Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '1.5rem'
        }}>
          {reasons.map((r, i) => (
            <AnimatedSection 
              key={i}
              animation="fade-up"
              delay={`${Math.min(i * 0.08, 0.4)}s`}
              className="glass-card hover-lift"
              style={{
                padding: '2.2rem 1.85rem',
                borderRadius: '20px',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{
                width: '62px',
                height: '62px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 0.3s ease'
              }}>
                {r.icon}
              </div>

              <div>
                <h3 style={{ fontSize: '1.25rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: 700 }}>
                  {r.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6 }}>
                  {r.desc}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>

      </div>
    </section>
  );
}
