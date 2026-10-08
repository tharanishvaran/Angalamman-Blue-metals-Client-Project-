import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Menu, 
  X, 
  User, 
  ShieldCheck, 
  FileText, 
  Truck, 
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  settings, 
  user, 
  admin, 
  onOpenQuote, 
  onOpenAuth, 
  onOpenAdminAuth, 
  onOpenDashboard, 
  onOpenAdminPortal, 
  onLogout 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastState = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY > 30;
          if (current !== lastState) {
            lastState = current;
            setIsScrolled(current);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Materials', href: '#materials' },
    { name: 'Services', href: '#services' },
    { name: 'Vehicles', href: '#vehicles' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Contact', href: '#contact' },
  ];

  const primaryPhone = settings.phone_primary || '9944076675';

  return (
    <header 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: 'all 0.3s ease',
        background: isScrolled ? 'rgba(7, 14, 27, 0.95)' : 'rgba(7, 14, 27, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: isScrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.05)',
        padding: isScrolled ? '0.75rem 0' : '1.1rem 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <a 
          href="#home" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            textDecoration: 'none', 
            color: '#fff' 
          }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb 0%, #f97316 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)'
          }}>
            <Truck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ 
              fontWeight: 800, 
              fontSize: '1.25rem', 
              letterSpacing: '-0.02em', 
              lineHeight: 1.1 
            }}>
              Sri Angalamman
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#f97316', 
              fontWeight: 700, 
              letterSpacing: '0.08em', 
              textTransform: 'uppercase' 
            }}>
              Blue Metals • Puducherry
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.25rem', margin: '0 1.5rem' }} className="desktop-nav">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              style={{
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '0.92rem',
                fontWeight: 500,
                transition: 'color 0.2s',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => (e.target.style.color = '#38bdf8')}
              onMouseLeave={(e) => (e.target.style.color = '#cbd5e1')}
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          
          {/* Quick Call Button */}
          <a
            href={`tel:${primaryPhone}`}
            className="btn btn-outline btn-sm"
            style={{ 
              display: 'none', 
              color: '#38bdf8', 
              borderColor: 'rgba(56, 189, 248, 0.3)',
              whiteSpace: 'nowrap'
            }}
            id="desktop-call-btn"
          >
            <Phone size={15} />
            <span>Call Now</span>
          </a>

          {/* Get Quote CTA */}
          <button
            onClick={onOpenQuote}
            className="btn btn-orange btn-sm btn-shimmer"
            style={{ fontWeight: 600 }}
          >
            <FileText size={15} />
            <span>Get Quote</span>
          </button>

          {/* User Account / Login */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-outline btn-sm"
                style={{ 
                  borderRadius: '9999px', 
                  padding: '0.35rem 0.8rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem' 
                }}
              >
                {user.profile_image ? (
                  <img 
                    src={user.profile_image} 
                    alt={user.name} 
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name ? user.name.split(' ')[0] : 'Customer'}
                </span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '210px',
                    background: '#0d172a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                    zIndex: 1100
                  }}
                >
                  <div style={{ padding: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {user.profile_image ? (
                      <img 
                        src={user.profile_image} 
                        alt={user.name} 
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                        {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{user.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenDashboard();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.06)')}
                    onMouseLeave={(e) => (e.target.style.background = 'none')}
                  >
                    <User size={15} /> My Dashboard
                  </button>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      color: '#f87171',
                      padding: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(239, 68, 68, 0.1)')}
                    onMouseLeave={(e) => (e.target.style.background = 'none')}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <User size={15} />
              <span>Login</span>
            </button>
          )}

          {/* Admin Portal Button (Only shown if currently authenticated as admin) */}
          {admin && (
            <button
              onClick={onOpenAdminPortal}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.42rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
              title="Admin Portal"
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '0.4rem'
            }}
            className="mobile-toggle"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(7, 14, 27, 0.98)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '1.5rem',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 16px 30px rgba(0, 0, 0, 0.8)'
          }}
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: '#e2e8f0',
                textDecoration: 'none',
                fontSize: '1.05rem',
                fontWeight: 500,
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}
            >
              {link.name}
            </a>
          ))}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <a
              href={`tel:${primaryPhone}`}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              <Phone size={16} /> Call {primaryPhone}
            </a>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="btn btn-orange"
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Get Quote
            </button>
          </div>

          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {user ? (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDashboard();
                  }}
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <User size={15} /> Dashboard
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="btn btn-outline"
                  style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <User size={16} /> Sign In / Register
              </button>
            )}

            {admin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminPortal();
                }}
                className="btn btn-outline"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  marginTop: '0.5rem',
                  borderColor: 'rgba(37, 99, 235, 0.45)',
                  color: '#60a5fa',
                  background: 'rgba(37, 99, 235, 0.1)'
                }}
              >
                <ShieldCheck size={16} /> Open Admin Control
              </button>
            )}
          </div>
        </div>
      )}

      {/* Media query styling for navbar */}
      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav {
            display: flex !important;
          }
          #desktop-call-btn {
            display: inline-flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
