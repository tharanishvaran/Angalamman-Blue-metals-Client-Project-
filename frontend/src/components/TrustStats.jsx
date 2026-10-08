import React, { useState, useEffect } from 'react';
import { Layers, Truck, Award, Headphones } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

export default function TrustStats() {
  const [sectionRef, isVisible] = useScrollAnimation({ threshold: 0.1 });
  const [counts, setCounts] = useState({
    materials: 0,
    vehicles: 0,
    quality: 0,
    support: 0
  });

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const endMaterials = 10;
    const endVehicles = 3;
    const endQuality = 100;
    const endSupport = 24;

    const timer = setInterval(() => {
      start += 1;
      setCounts({
        materials: Math.min(start, endMaterials),
        vehicles: Math.min(start, endVehicles),
        quality: Math.min(start * 5, endQuality),
        support: Math.min(start * 2, endSupport)
      });
      if (start >= 20) {
        clearInterval(timer);
      }
    }, 45);

    return () => clearInterval(timer);
  }, [isVisible]);

  const stats = [
    {
      icon: <Layers size={28} color="#38bdf8" />,
      number: `${counts.materials}+`,
      title: 'Construction Materials',
      subtitle: 'Sands, aggregates, gravel & bricks',
      accentGlow: 'rgba(56, 189, 248, 0.2)'
    },
    {
      icon: <Truck size={28} color="#f97316" />,
      number: `${counts.vehicles}+`,
      title: 'Transport Vehicles',
      subtitle: 'Tractors, tippers & mini trucks',
      accentGlow: 'rgba(249, 115, 22, 0.2)'
    },
    {
      icon: <Award size={28} color="#10b981" />,
      number: `${counts.quality}%`,
      title: 'Quality Focus',
      subtitle: 'Crusher certified & weighbridge tested',
      accentGlow: 'rgba(16, 185, 129, 0.2)'
    },
    {
      icon: <Headphones size={28} color="#eab308" />,
      number: `${counts.support}/7`,
      title: 'Customer Support',
      subtitle: 'Direct calling & WhatsApp dispatch',
      accentGlow: 'rgba(234, 179, 8, 0.2)'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      style={{
        padding: '3.25rem 0',
        background: 'rgba(11, 20, 38, 0.75)',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        position: 'relative'
      }}
    >
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.5rem'
        }}>
          {stats.map((stat, idx) => (
            <div 
              key={idx}
              className={`glass-card anim-fade-up ${isVisible ? 'visible' : ''} delay-${idx + 1}`}
              style={{
                padding: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div style={{
                width: '58px',
                height: '58px',
                borderRadius: '16px',
                background: stat.accentGlow,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'transform 0.3s ease'
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-heading)',
                  color: '#ffffff',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em'
                }}>
                  {stat.number}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', marginTop: '0.2rem' }}>
                  {stat.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {stat.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
