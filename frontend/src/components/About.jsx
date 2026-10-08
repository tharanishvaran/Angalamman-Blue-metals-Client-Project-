import React from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Coins, 
  Zap, 
  HeartHandshake 
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';
import BrandLogo from './BrandLogo';

export default function About({ settings, onOpenDelivery }) {
  const highlights = [
    {
      icon: <ShieldCheck size={20} color="#38bdf8" />,
      title: 'Quarry-Direct Quality',
      desc: 'Tested cubical blue metals and silt-free manufactured sand for maximum concrete strength.'
    },
    {
      icon: <Truck size={20} color="#f97316" />,
      title: 'Reliable Fleet Delivery',
      desc: 'Equipped with tractors for narrow streets and heavy tipper trucks for bulk sites.'
    },
    {
      icon: <Coins size={20} color="#10b981" />,
      title: 'Competitive Direct Pricing',
      desc: 'Transparent pricing directly from crusher yards without middlemen commissions.'
    },
    {
      icon: <Zap size={20} color="#eab308" />,
      title: 'Fast Turnaround',
      desc: 'Same-day and scheduled site deliveries across Thilaspettai, Villianur, Lawspet, and Pondy.'
    },
    {
      icon: <MapPin size={20} color="#ec4899" />,
      title: 'Puducherry Local Service',
      desc: 'Rooted in Sathiyamoorthy Nagar, Thilaspettai, serving builders and contractors since day one.'
    },
    {
      icon: <HeartHandshake size={20} color="#6366f1" />,
      title: 'Customer-Centric Approach',
      desc: 'Personalized attention, exact weighbridge receipts, and flexible load units.'
    }
  ];

  return (
    <section id="about" className="section-padding" style={{ position: 'relative' }}>
      <div className="container">
        
        {/* Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <span>About Sri Angalamman Blue Metals</span>
          </div>
          <h2 className="section-title">
            Trusted Construction Material <br />
            <span className="gradient-text">Supplier in Puducherry</span>
          </h2>
          <p className="section-desc">
            Sri Angalamman Blue Metals provides quality construction materials and reliable transportation services for residential, commercial and infrastructure projects.
          </p>
        </AnimatedSection>

        {/* Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '3.5rem',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Visual Fleet Showcase */}
          <AnimatedSection animation="slide-left" style={{ position: 'relative' }}>
            <div 
              className="hover-lift"
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(37, 99, 235, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                position: 'relative'
              }}
            >
              <img 
                src={settings.about_image || '/images/about.jpg'} 
                alt="Sri Angalamman Transport Fleet" 
                loading="lazy"
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = '1';
                    e.target.src = '/images/about.jpg';
                  }
                }}
                style={{
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.6s ease'
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(5, 11, 24, 0.9) 0%, transparent 60%)'
              }} />

              {/* Official Seal Badge */}
              <div 
                style={{
                  position: 'absolute',
                  top: '1.25rem',
                  left: '1.25rem',
                  background: 'rgba(7, 14, 28, 0.88)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.9rem 0.35rem 0.45rem',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  zIndex: 5
                }}
              >
                <BrandLogo size={32} showRing={true} showAura={true} showShine={true} />
                <div>
                  <div style={{ fontSize: '0.62rem', color: '#fbbf24', fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1 }}>
                    ஸ்ரீ அங்காளம்மன்
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#ffffff', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.2 }}>
                    Verified Quarry Supply
                  </div>
                </div>
              </div>

              <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                left: '1.5rem',
                right: '1.5rem'
              }}>
                <div style={{
                  fontSize: '0.82rem',
                  color: '#fb923c',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em'
                }}>
                  Fleet & Logistics Depot
                </div>
                <div style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginTop: '0.2rem'
                }}>
                  Prompt Dispatch Straight to Your Construction Site
                </div>
              </div>
            </div>

            {/* Floating Info Card */}
            <div 
              className="glass-card animate-float"
              style={{
                position: 'absolute',
                bottom: '-20px',
                right: '-12px',
                padding: '1rem 1.25rem',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                zIndex: 10
              }}
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'rgba(37, 99, 235, 0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#60a5fa',
                border: '1px solid rgba(37, 99, 235, 0.3)'
              }}>
                <Truck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Delivery Radius</div>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: '#fff' }}>Across Puducherry</div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right Column: Detailed Narrative & Features */}
          <AnimatedSection animation="slide-right">
            <h3 style={{ fontSize: '1.85rem', marginBottom: '1rem', color: '#f8fafc', fontWeight: 800, lineHeight: 1.25 }}>
              Building Puducherry's Future with <span className="gradient-text">Uncompromised Quality</span>
            </h3>
            <p style={{ color: '#cbd5e1', marginBottom: '1.25rem', lineHeight: 1.7 }}>
              From foundation laying to final roof plastering, the strength of every structure rests upon the quality of its aggregates and sand. At <strong>Sri Angalamman Blue Metals</strong>, we supply a comprehensive spectrum of crusher products including <strong>M-Sand, P-Sand, River Sand, Sengal (Red Bricks), 1/4" chips, 1/2", 3/4", and 1 1/2" blue metal stones, gravel, and fine crusher powder</strong>.
            </p>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.7 }}>
              Whether you are an individual homeowner building a family residence in Thilaspettai or a civil contractor managing an apartment complex or road project, our dispatch team ensures verified quantities and punctuality.
            </p>

            {/* Highlights Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2rem'
            }}>
              {highlights.map((h, i) => (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    gap: '0.85rem',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'transform 0.25s ease, background 0.25s ease'
                  }}
                  className="hover-lift"
                >
                  <div style={{ 
                    flexShrink: 0, 
                    marginTop: '2px',
                    padding: '0.35rem',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)'
                  }}>
                    {h.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f1f5f9' }}>{h.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.45 }}>{h.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={onOpenDelivery}
              className="btn btn-primary btn-lg btn-shimmer"
            >
              <Truck size={18} />
              <span>Request Site Delivery</span>
            </button>
          </AnimatedSection>

        </div>

      </div>
    </section>
  );
}
