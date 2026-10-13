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
  ChevronDown,
  Bell,
  Package
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Navbar({ 
  settings, 
  user, 
  admin, 
  onOpenQuote, 
  onOpenDelivery,
  onOpenOrders,
  onOpenAuth, 
  onOpenAdminAuth, 
  onOpenDashboard, 
  onOpenAdminPortal, 
  onOpenAdminNotifications,
  adminUnreadCount = 0,
  onLogout 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [activeNav, setActiveNav] = useState('home');

  useEffect(() => {
    let ticking = false;
    let lastState = false;
    const sectionIds = ['home', 'about', 'materials', 'services', 'vehicles', 'reviews', 'contact'];

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY > 30;
          if (current !== lastState) {
            lastState = current;
            setIsScrolled(current);
          }

          // Active scroll spy
          const scrollPos = window.scrollY + 160;
          for (let i = sectionIds.length - 1; i >= 0; i--) {
            const el = document.getElementById(sectionIds[i]);
            if (el && el.offsetTop <= scrollPos) {
              setActiveNav(sectionIds[i]);
              break;
            }
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

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const navOffset = 78;
      const elementPos = element.getBoundingClientRect().top;
      const offsetPos = elementPos + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPos,
        behavior: 'smooth'
      });
      try {
        window.history.pushState(null, '', href);
      } catch (err) {}
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
          onClick={(e) => handleNavClick(e, '#home')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.65rem', 
            textDecoration: 'none', 
            color: '#fff',
            cursor: 'pointer',
            flexShrink: 0,
            marginRight: '1rem'
          }}
        >
          <BrandLogo 
            size={44}
            showRing={true}
            showAura={true}
            showShine={true}
            showSparkles={true}
            showFloat={false}
          />
          <div>
            <div className="nav-brand-title" style={{ 
              fontWeight: 800, 
              fontSize: '1.18rem', 
              letterSpacing: '-0.02em', 
              lineHeight: 1.15,
              whiteSpace: 'nowrap'
            }}>
              Sri Angalamman
            </div>
            <div className="nav-brand-sub" style={{ 
              fontSize: '0.70rem', 
              color: '#f97316', 
              fontWeight: 700, 
              letterSpacing: '0.07em', 
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}>
              Blue Metals • Puducherry
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.1rem', margin: '0 0.85rem', flexShrink: 1 }} className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = activeNav === link.href.replace('#', '');
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                style={{
                  color: isActive ? '#38bdf8' : '#cbd5e1',
                  textDecoration: 'none',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 700 : 500,
                  transition: 'color 0.2s, transform 0.2s',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                  padding: '0.25rem 0',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.target.style.color = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.target.style.color = '#cbd5e1';
                }}
              >
                {link.name}
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    bottom: '-4px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    borderRadius: '2px',
                    background: 'linear-gradient(90deg, #38bdf8, #2563eb)',
                    boxShadow: '0 0 8px #38bdf8'
                  }} />
                )}
              </a>
            );
          })}
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

          {/* Site Delivery CTA */}
          <button
            onClick={onOpenDelivery}
            className="btn btn-outline btn-sm nav-site-delivery-btn"
            style={{ 
              color: '#38bdf8', 
              borderColor: 'rgba(56, 189, 248, 0.4)', 
              background: 'rgba(56, 189, 248, 0.08)',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Truck size={14} />
            <span>Site Delivery</span>
          </button>

          {/* My Orders Button - Only for Logged In Customer Accounts (Not Admin) */}
          {(user && !admin) && (
            <button
              onClick={onOpenOrders}
              className="btn btn-outline btn-sm nav-my-orders-btn"
              style={{ 
                color: '#38bdf8', 
                borderColor: 'rgba(56, 189, 248, 0.45)', 
                background: 'rgba(56, 189, 248, 0.1)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap'
              }}
              title="View My Ordered Materials & Delivery Status"
            >
              <Package size={14} />
              <span className="nav-my-orders-text">My Orders</span>
            </button>
          )}

          {/* User Account / Login */}
          {admin ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="btn btn-outline btn-sm"
                style={{ 
                  borderRadius: '9999px', 
                  padding: '0.35rem 0.8rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  borderColor: 'rgba(239, 68, 68, 0.45)',
                  background: 'rgba(239, 68, 68, 0.1)'
                }}
              >
                {admin.profile_image ? (
                  <img 
                    src={admin.profile_image} 
                    alt={admin.name} 
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    <ShieldCheck size={14} />
                  </div>
                )}
                <span className="nav-admin-name" style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {admin.name ? admin.name.split(' ')[0] : 'Admin'}
                </span>
                <span style={{ fontSize: '0.62rem', background: '#dc2626', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '9999px', fontWeight: 700 }}>
                  ADMIN
                </span>
                <ChevronDown size={14} />
              </button>

              {userDropdownOpen && (
                <div 
                  style={{
                    position: 'absolute',
                    top: '120%',
                    right: 0,
                    width: '240px',
                    background: '#0d172a',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.7)',
                    zIndex: 1100
                  }}
                >
                  <div style={{ padding: '0.6rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {admin.profile_image ? (
                      <img 
                        src={admin.profile_image} 
                        alt={admin.name} 
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ShieldCheck size={18} />
                      </div>
                    )}
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{admin.name || 'Administrator'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{admin.email}</div>
                      <span style={{ fontSize: '0.62rem', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.05rem 0.35rem', borderRadius: '4px', fontWeight: 700, marginTop: '0.2rem', display: 'inline-block' }}>
                        {admin.role || 'SUPER_ADMIN'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenAdminPortal();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'rgba(37, 99, 235, 0.15)',
                      border: '1px solid rgba(37, 99, 235, 0.35)',
                      color: '#60a5fa',
                      padding: '0.6rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      marginTop: '0.3rem'
                    }}
                  >
                    <ShieldCheck size={16} /> Open Admin Portal
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
                      padding: '0.5rem 0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      marginTop: '0.25rem'
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(239, 68, 68, 0.1)')}
                    onMouseLeave={(e) => (e.target.style.background = 'none')}
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : user ? (
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
                <span className="nav-user-name" style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                      onOpenOrders();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'rgba(56, 189, 248, 0.1)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      color: '#38bdf8',
                      padding: '0.5rem 0.65rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: '6px',
                      marginTop: '0.3rem',
                      marginBottom: '0.2rem'
                    }}
                    onMouseEnter={(e) => (e.target.style.background = 'rgba(56, 189, 248, 0.18)')}
                    onMouseLeave={(e) => (e.target.style.background = 'rgba(56, 189, 248, 0.1)')}
                  >
                    <Package size={15} /> My Orders
                  </button>
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

          {/* Admin Notifications Bell (Only when admin is logged in on home website) */}
          {admin && (
            <button
              onClick={onOpenAdminNotifications}
              className="btn btn-outline btn-sm admin-notif-btn"
              style={{
                position: 'relative',
                padding: '0.42rem 0.65rem',
                borderRadius: '8px',
                borderColor: adminUnreadCount > 0 ? 'rgba(239, 68, 68, 0.65)' : 'rgba(56, 189, 248, 0.4)',
                background: adminUnreadCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.85)',
                color: adminUnreadCount > 0 ? '#fca5a5' : '#38bdf8',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Admin Live Notifications (User Logins & Booked Materials)"
            >
              <Bell size={17} />
              {adminUnreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontSize: '0.66rem',
                  fontWeight: 900,
                  minWidth: '17px',
                  height: '17px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.8)'
                }}>
                  {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                </span>
              )}
            </button>
          )}

          {/* Admin Portal Quick Button (if admin is authenticated) */}
          {admin && (
            <button
              onClick={onOpenAdminPortal}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.42rem 0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700 }}
              title="Admin Portal"
            >
              <ShieldCheck size={16} />
              <span>Admin Portal</span>
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
              onClick={(e) => handleNavClick(e, link.href)}
              style={{
                color: activeNav === link.href.replace('#', '') ? '#38bdf8' : '#e2e8f0',
                textDecoration: 'none',
                fontSize: '1.05rem',
                fontWeight: activeNav === link.href.replace('#', '') ? 700 : 500,
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>{link.name}</span>
              {activeNav === link.href.replace('#', '') && (
                <span style={{ fontSize: '0.7rem', color: '#38bdf8', fontWeight: 700 }}>● Active</span>
              )}
            </a>
          ))}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginTop: '0.5rem' }}>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenDelivery) onOpenDelivery();
              }}
              className="btn btn-primary"
              style={{ justifyContent: 'center', fontWeight: 600, fontSize: '0.86rem' }}
            >
              <Truck size={15} /> Site Delivery
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuote();
              }}
              className="btn btn-orange"
              style={{ justifyContent: 'center', fontWeight: 600, fontSize: '0.86rem' }}
            >
              <FileText size={15} /> Get Quote
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <a
              href={`tel:${primaryPhone}`}
              className="btn btn-outline"
              style={{ flex: 1, justifyContent: 'center', fontSize: '0.86rem' }}
            >
              <Phone size={15} /> Call {primaryPhone}
            </a>
          </div>

          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {admin ? (
              <div>
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '10px',
                  marginBottom: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#dc2626',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {admin.name || 'Admin'}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.72rem', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                      {admin.email}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onOpenAdminPortal();
                      }}
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center', fontWeight: 700 }}
                    >
                      <ShieldCheck size={16} /> Open Admin Portal
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="btn btn-outline"
                      style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#f87171' }}
                      title="Sign Out"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdminNotifications && onOpenAdminNotifications();
                    }}
                    className="btn btn-outline"
                    style={{
                      borderColor: adminUnreadCount > 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(56, 189, 248, 0.4)',
                      color: adminUnreadCount > 0 ? '#fca5a5' : '#38bdf8',
                      background: adminUnreadCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      fontWeight: 700,
                      padding: '0.65rem'
                    }}
                  >
                    <Bell size={16} />
                    <span>Live Activity Notifications {adminUnreadCount > 0 ? `(${adminUnreadCount} New)` : ''}</span>
                  </button>
                </div>
              </div>
            ) : user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenOrders) onOpenOrders();
                  }}
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    borderColor: 'rgba(56, 189, 248, 0.45)',
                    background: 'rgba(56, 189, 248, 0.12)',
                    color: '#38bdf8',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.65rem'
                  }}
                >
                  <Package size={16} /> My Orders
                </button>
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
          </div>
        </div>
      )}

      {/* Media query styling for navbar */}
      <style>{`
        @media (max-width: 680px) {
          .nav-site-delivery-btn {
            display: none !important;
          }
          .nav-brand-title {
            font-size: 1.02rem !important;
          }
          .nav-brand-sub {
            font-size: 0.62rem !important;
          }
          .nav-my-orders-btn {
            padding: 0.32rem 0.6rem !important;
            font-size: 0.78rem !important;
            gap: 0.28rem !important;
          }
        }
        @media (max-width: 480px) {
          .nav-brand-title {
            font-size: 0.94rem !important;
          }
          .nav-user-name, .nav-admin-name {
            max-width: 60px !important;
            font-size: 0.8rem !important;
          }
          .nav-my-orders-btn {
            padding: 0.3rem 0.5rem !important;
            font-size: 0.75rem !important;
          }
        }
        @media (max-width: 380px) {
          .nav-user-name, .nav-admin-name {
            display: none !important;
          }
          .nav-my-orders-text {
            font-size: 0.72rem !important;
          }
        }
        @media (min-width: 1140px) {
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
        @media (min-width: 1140px) and (max-width: 1280px) {
          .desktop-nav {
            gap: 0.75rem !important;
            margin: 0 0.5rem !important;
          }
          .desktop-nav a {
            font-size: 0.84rem !important;
          }
        }
        @media (max-width: 1139px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}
