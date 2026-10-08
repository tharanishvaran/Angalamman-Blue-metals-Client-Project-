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
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
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
                    style={{ width: '22px', height: '22px', borderRadius: '50%' }} 
                  />
                ) : (
                  <User size={16} color="#38bdf8" />
                )}
                <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                    width: '200px',
                    background: '#0d172a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.6)',
                    zIndex: 1100
                  }}
                >
                  <div style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{user.mobile || user.email}</div>
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

          {/* Admin Portal Button */}
          {admin ? (
            <button
              onClick={onOpenAdminPortal}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.42rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
              title="Admin Portal"
            >
              <ShieldCheck size={16} />
              <span>Admin</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminAuth}
              className="btn btn-outline btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'rgba(249, 115, 22, 0.45)',
                color: '#fb923c',
                background: 'rgba(249, 115, 22, 0.08)',
                padding: '0.4rem 0.75rem',
                fontWeight: 600,
                fontSize: '0.82rem'
              }}
              title="Admin Access Portal"
            >
              <ShieldCheck size={15} />
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
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (admin) {
                  onOpenAdminPortal();
                } else {
                  onOpenAdminAuth();
                }
              }}
              className="btn btn-outline"
              style={{
                width: '100%',
                justifyContent: 'center',
                borderColor: 'rgba(249, 115, 22, 0.45)',
                color: '#fb923c',
                background: 'rgba(249, 115, 22, 0.08)'
              }}
            >
              <ShieldCheck size={16} /> {admin ? 'Open Admin Control' : 'Admin Portal Login'}
            </button>
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
