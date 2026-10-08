import React from 'react';
import { Truck, Phone, MapPin, Mail, ArrowUp } from 'lucide-react';

export default function Footer({ settings, onOpenAuth, onOpenAdminAuth }) {
  const primaryPhone = settings.phone_primary || '9944076675';
  const secondaryPhone = settings.phone_secondary || '9345009337';
  const additionalPhone = settings.phone_additional || '9629657833';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: '#050a14',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      paddingTop: '4.5rem',
      paddingBottom: '2.5rem',
      position: 'relative'
    }}>
      <div className="container">
        
        {/* Top Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem'
        }}>
          
          {/* Column 1: Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb 0%, #f97316 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Truck size={22} color="#ffffff" />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>
                  Sri Angalamman
                </div>
                <div style={{ fontSize: '0.75rem', color: '#f97316', fontWeight: 700, letterSpacing: '0.05em' }}>
                  BLUE METALS • PUDUCHERRY
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              "Quality Materials for a Stronger Tomorrow." Supplying premium certified crusher aggregates, sands, and site logistics for residential and commercial construction across Puducherry.
            </p>

            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
              GST & Weighbridge Verified Supply Depot
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { name: 'Home', href: '#home' },
                { name: 'About Us', href: '#about' },
                { name: 'Materials Catalogue', href: '#materials' },
                { name: 'Services & Logistics', href: '#services' },
                { name: 'Vehicles & Fleet', href: '#vehicles' },
                { name: 'Customer Reviews', href: '#reviews' },
                { name: 'Yard Location & Contact', href: '#contact' },
              ].map((l) => (
                <li key={l.name}>
                  <a
                    href={l.href}
                    style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.88rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.target.style.color = '#38bdf8')}
                    onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
                  >
                    {l.name}
                  </a>
                </li>
              ))}
              <li>
                <button
                  onClick={onOpenAuth}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.88rem', cursor: 'pointer', padding: 0 }}
                  onMouseEnter={(e) => (e.target.style.color = '#38bdf8')}
                  onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
                >
                  Customer Account Login
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdminAuth}
                  style={{ background: 'none', border: 'none', color: '#fb923c', fontSize: '0.88rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}
                  onMouseEnter={(e) => (e.target.style.color = '#fdba74')}
                  onMouseLeave={(e) => (e.target.style.color = '#fb923c')}
                >
                  ⚙️ Admin Portal Login
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Materials & Services */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Products & Supply
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {[
                'M-Sand (Manufactured Sand)',
                'P-Sand (Plastering Sand)',
                'River Sand (Masonry)',
                'Sengal (Red Clay Bricks)',
                '1/4 Stone (6mm Chips)',
                '1/2 Stone (12mm Aggregate)',
                '3/4 Stone (20mm Aggregate)',
                '1 1/2 Stone (40mm Ballast)',
                'Gravel / Kraval Site Filling',
                'Crusher Powder (Stone Dust)',
                'Tractor & Tipper Transportation'
              ].map((m) => (
                <li key={m} style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                  • {m}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Depot */}
          <div>
            <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Puducherry Depot
            </h4>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <MapPin size={18} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
              <a 
                href="https://maps.app.goo.gl/Z4SS6rkY7Vknzc3SA"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5, textDecoration: 'none' }}
                onMouseEnter={(e) => (e.target.style.color = '#38bdf8')}
                onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
              >
                Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry, India 📍
              </a>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <Phone size={18} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <a href={`tel:${primaryPhone}`} style={{ display: 'block', color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                  {primaryPhone}
                </a>
                <a href={`tel:${secondaryPhone}`} style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
                  {secondaryPhone}
                </a>
                <a href={`tel:${additionalPhone}`} style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'none' }}>
                  {additionalPhone}
                </a>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Mail size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                contact@sriangalammanbluemetals.com
              </div>
            </div>

            <button
              onClick={onOpenAdminAuth}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                color: '#64748b',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Admin Portal Login 🔒
            </button>
          </div>

        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          paddingTop: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.82rem',
          color: '#64748b'
        }}>
          <div>
            © 2026 Sri Angalamman Blue Metals. All Rights Reserved. Kalathumettu Veedhi, Thilaspettai, Puducherry.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <span>Designed for Builders & Contractors</span>
            <button
              onClick={scrollToTop}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Back to Top"
            >
              <ArrowUp size={16} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
