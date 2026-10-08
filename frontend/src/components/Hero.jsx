import React from 'react';
import { 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Scale, 
  Clock,
  CheckCircle2,
  MapPin,
  ExternalLink
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import AnimatedSection from './AnimatedSection';

export default function Hero({ settings, onOpenQuote, onOpenDelivery }) {
  const primaryPhone = settings.phone_primary || '9944076675';
  const mapsUrl = settings.maps_url || 'https://maps.app.goo.gl/Z4SS6rkY7Vknzc3SA';

  return (
    <section 
      id="home"
      style={{
        position: 'relative',
        minHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        paddingTop: '6.5rem',
        paddingBottom: '2.5rem',
        overflow: 'hidden'
      }}
    >
      {/* Soft Static Ambient Accents (Zero repaint cost) */}
      <div 
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '480px',
          height: '480px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, transparent 65%)',
          pointerEvents: 'none'
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-8%',
          width: '440px',
          height: '440px',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, transparent 65%)',
          pointerEvents: 'none'
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          
          {/* Left Text Column */}
          <AnimatedSection animation="fade-up">
            
            {/* Tags / Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginBottom: '1.35rem' }}>
              <div 
                className="section-tag" 
                style={{ 
                  margin: 0,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Sparkles size={16} />
                <span>{settings.tagline || 'Quality Materials for a Stronger Tomorrow'}</span>
              </div>

              <a 
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.45rem 1rem',
                  borderRadius: '9999px',
                  background: 'rgba(37, 99, 235, 0.18)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                className="hover-lift"
                title="Open Shop in Google Maps"
              >
                <MapPin size={15} color="#38bdf8" />
                <span>Thilaspettai, Puducherry • View on Google Maps ↗</span>
              </a>
            </div>

            {/* Main Headline */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              lineHeight: 1.12,
              fontWeight: 800,
              marginBottom: '1.25rem'
            }}>
              Quality <span className="gradient-text">Blue Metals</span> & <br className="hidden-br" />
              <span className="gradient-orange-text">Construction Materials</span>
            </h1>

            {/* Subheadline */}
            <p style={{
              fontSize: 'clamp(1.05rem, 2vw, 1.22rem)',
              color: '#cbd5e1',
              maxWidth: '560px',
              lineHeight: 1.65,
              marginBottom: '2rem'
            }}>
              {settings.subheadline || 'Reliable construction materials and transportation services in Puducherry.'} Supplying high-grade M-Sand, P-Sand, River Sand, Blue Metal aggregates, bricks, and direct site transport.
            </p>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1rem',
              marginBottom: '2.5rem'
            }}>
              <a 
                href="#materials" 
                className="btn btn-primary btn-lg btn-shimmer"
              >
                <span>Explore Materials</span>
                <ArrowRight size={18} />
              </a>

              <button 
                onClick={onOpenQuote}
                className="btn btn-orange btn-lg btn-shimmer"
              >
                <span>Get Instant Quote</span>
              </button>

              <a 
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
                style={{ color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)' }}
              >
                <MapPin size={18} />
                <span>Shop Location 📍</span>
              </a>

              <a 
                href={`tel:${primaryPhone}`} 
                className="btn btn-outline btn-lg"
                style={{ color: '#38bdf8' }}
              >
                <Phone size={18} />
                <span>Call Dispatch</span>
              </a>
            </div>

            {/* Trust Micro-Pills */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.22)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)' }}>
                  <Scale size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Accurate Weights</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Certified Weighbridge</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.22)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>
                  <Truck size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Fleet Dispatch</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Tractor & Tipper Fleet</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.22)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <Clock size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>Prompt Delivery</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>All Puducherry Areas</div>
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Right Visual Showcase Card */}
          <AnimatedSection animation="fade-up" delay="0.12s" style={{ position: 'relative' }}>
            
            {/* Visual Frame */}
            <div 
              className="hero-image-frame"
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                background: '#091122',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(37, 99, 235, 0.2)'
              }}
            >
              <img 
                src={settings.hero_image || '/images/hero.jpg'} 
                alt="Sri Angalamman Blue Metals Quarry Depot and Vehicles" 
                loading="eager"
                fetchPriority="high"
                onError={(e) => {
                  if (!e.target.dataset.fallback) {
                    e.target.dataset.fallback = '1';
                    e.target.src = '/images/hero.jpg';
                  }
                }}
                style={{
                  width: '100%',
                  height: '420px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(5, 11, 24, 0.92) 0%, rgba(5, 11, 24, 0.15) 60%, transparent 100%)'
                }}
              />

              {/* Bottom Card Overlay Badge with Location link */}
              <div style={{
                position: 'absolute',
                bottom: '1.25rem',
                left: '1.25rem',
                right: '1.25rem',
                background: 'rgba(10, 18, 36, 0.92)',
                padding: '1rem 1.25rem',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Direct Crusher Depot
                  </div>
                  <a 
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ 
                      fontWeight: 700, 
                      fontSize: '0.98rem', 
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none'
                    }}
                    title="View on Google Maps"
                  >
                    <span>Thilaspettai, Puducherry</span>
                    <ExternalLink size={14} color="#38bdf8" />
                  </a>
                </div>
                <button
                  onClick={onOpenDelivery}
                  className="btn btn-orange btn-sm btn-shimmer"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <Truck size={14} />
                  <span>Book Transport</span>
                </button>
              </div>
            </div>

            {/* Official Animated Brand Seal Medallion */}
            <div 
              className="animate-float"
              style={{
                position: 'absolute',
                top: '-24px',
                left: '-14px',
                background: 'rgba(7, 14, 28, 0.94)',
                backdropFilter: 'blur(16px)',
                border: '1.5px solid rgba(245, 158, 11, 0.55)',
                borderRadius: '9999px',
                padding: '0.4rem 1rem 0.4rem 0.5rem',
                boxShadow: '0 14px 36px rgba(0, 0, 0, 0.75), 0 0 24px rgba(245, 158, 11, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                zIndex: 22
              }}
            >
              <BrandLogo 
                size={44} 
                showRing={true} 
                showAura={true} 
                showShine={true} 
                showSparkles={true} 
              />
              <div>
                <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 800, letterSpacing: '0.04em', lineHeight: 1.1 }}>
                  ஸ்ரீ அங்காளம்மன் துணை
                </div>
                <div style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.2 }}>
                  Certified Depot Seal
                </div>
              </div>
            </div>

            {/* Floating Top Badge with Radar Dot */}
            <div 
              style={{
                position: 'absolute',
                top: '-16px',
                right: '18px',
                background: 'rgba(10, 18, 36, 0.95)',
                border: '1px solid rgba(59, 130, 246, 0.45)',
                borderRadius: '9999px',
                padding: '0.55rem 1.1rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                zIndex: 20
              }}
            >
              <div className="radar-dot" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '0.02em' }}>
                Open Now • Dispatches Active
              </span>
            </div>

          </AnimatedSection>

        </div>

        {/* Clean Static Feature Highlight Bar with smooth animation */}
        <AnimatedSection animation="fade-up" delay="0.18s" style={{ marginTop: '3.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            background: 'rgba(11, 20, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '1.1rem 1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>Certified M-Sand & P-Sand</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Direct crusher yard supply</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#f97316" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>20mm, 40mm & 12mm Blue Metals</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Cubical fracture aggregates</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>Computerized Weighbridge</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Exact weight slip for every load</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={18} color="#fbbf24" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>Hydraulic Fleet Dispatch</div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>Tractors & tipper trucks</div>
              </div>
            </div>
          </div>
        </AnimatedSection>

      </div>
    </section>
  );
}
