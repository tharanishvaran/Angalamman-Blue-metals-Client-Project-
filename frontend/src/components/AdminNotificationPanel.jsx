import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  X, 
  Trash2, 
  RefreshCw, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Truck, 
  Package, 
  User, 
  Calendar, 
  Clock, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import { api } from '../api';

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function AdminNotificationPanel({ 
  isOpen, 
  onClose, 
  onOpenAdminPortal,
  unreadCount = 0,
  onResetUnread
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'MATERIAL' | 'SERVICE' | 'LOGIN'
  const [searchQuery, setSearchQuery] = useState('');

  // Persisted cleared/dismissed notification IDs (ID-based, 100% reliable)
  const [clearedIds, setClearedIds] = useState(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('angalamman_cleared_notif_ids') || '[]');
      return Array.isArray(ids) ? ids : [];
    } catch {
      return [];
    }
  });

  // Fetch notifications
  const fetchNotifications = async (isManual = false) => {
    try {
      if (isManual) setLoading(true);
      const res = await api.getNotifications();
      if (res && res.notifications) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.warn('Failed to fetch admin notifications:', err.message);
    } finally {
      if (isManual) setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(true);
      if (onResetUnread) onResetUnread();
    }
  }, [isOpen]);

  // Periodic polling when open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 20000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Clear all current notifications
  const handleClearAll = () => {
    const currentIds = notifications.map(n => n.id);
    const updated = Array.from(new Set([...clearedIds, ...currentIds]));
    setClearedIds(updated);
    localStorage.setItem('angalamman_cleared_notif_ids', JSON.stringify(updated));
    localStorage.removeItem('angalamman_cleared_notifs_time');
    if (onResetUnread) onResetUnread();
  };

  // Dismiss an individual notification
  const handleDismissOne = (id, e) => {
    if (e) e.stopPropagation();
    const updated = Array.from(new Set([...clearedIds, id]));
    setClearedIds(updated);
    localStorage.setItem('angalamman_cleared_notif_ids', JSON.stringify(updated));
  };

  // Restore cleared notifications
  const handleRestoreAll = () => {
    setClearedIds([]);
    localStorage.removeItem('angalamman_cleared_notif_ids');
    localStorage.removeItem('angalamman_cleared_notifs_time');
    localStorage.removeItem('angalamman_dismissed_notif_ids');
    fetchNotifications(true);
  };

  if (!isOpen) return null;

  // Active (not dismissed or cleared)
  const activeNotifications = notifications.filter(item => {
    return !clearedIds.includes(item.id);
  });

  // Filtered notifications
  const filtered = activeNotifications.filter(item => {
    if (filter === 'MATERIAL' && item.type !== 'MATERIAL_BOOKED') return false;
    if (filter === 'SERVICE' && item.type !== 'SERVICE_BOOKED') return false;
    if (filter === 'LOGIN' && item.type !== 'USER_LOGIN') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (item.user_name || '').toLowerCase().includes(q);
      const matchMobile = (item.mobile || '').toLowerCase().includes(q);
      const matchAddr = (item.address || '').toLowerCase().includes(q);
      const matchService = (item.booked_service_or_material || '').toLowerCase().includes(q);
      return matchName || matchMobile || matchAddr || matchService;
    }
    return true;
  });

  const getCleanMobile = (mobile) => {
    if (!mobile) return '';
    return mobile.toString().replace(/[\s\-\+]/g, '').replace(/^91/, '');
  };

  const isAnyCleared = clearedIds.length > 0;

  return (
    <div 
      className="admin-notif-backdrop"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2200,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        padding: '76px 20px 20px 20px',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      {/* FLOATING WINDOW CONTAINER */}
      <div 
        className="admin-notif-floating-window"
        style={{
          width: '100%',
          maxWidth: '480px',
          height: 'min(88vh, 720px)',
          maxHeight: 'calc(100vh - 84px)',
          background: 'linear-gradient(180deg, rgba(10, 20, 40, 0.98) 0%, rgba(6, 12, 26, 0.98) 100%)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(56, 189, 248, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideInRight 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Window Header */}
        <div style={{
          padding: '1.1rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          gap: '0.65rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.16)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ef4444',
              flexShrink: 0
            }}>
              <Bell size={18} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: 0, whiteSpace: 'nowrap' }}>
                  Live Notifications
                </h3>
                <span style={{
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#34d399',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                  Live
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.1rem 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Customer logins & material bookings
              </p>
            </div>
          </div>

          {/* Header Action Buttons: Clear All, Refresh, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
            {activeNotifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn-clear-all"
                title="Clear all notifications"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  padding: '0.35rem 0.6rem',
                  borderRadius: '7px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  transition: 'all 0.2s'
                }}
              >
                <Trash2 size={13} />
                <span>Clear All</span>
              </button>
            )}

            <button
              onClick={() => fetchNotifications(true)}
              disabled={loading}
              title="Refresh notifications"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '0.4rem',
                borderRadius: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onClose}
              title="Close floating window"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '0.4rem',
                borderRadius: '7px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          padding: '0.65rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(10, 18, 36, 0.65)',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto',
          flexShrink: 0,
          scrollbarWidth: 'none'
        }}>
          {[
            { id: 'ALL', label: `All (${activeNotifications.length})` },
            { id: 'MATERIAL', label: `🚚 Materials (${activeNotifications.filter(n => n.type === 'MATERIAL_BOOKED').length})` },
            { id: 'SERVICE', label: `🏗️ Services (${activeNotifications.filter(n => n.type === 'SERVICE_BOOKED').length})` },
            { id: 'LOGIN', label: `👤 Logins (${activeNotifications.filter(n => n.type === 'USER_LOGIN').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                padding: '0.26rem 0.6rem',
                borderRadius: '6px',
                fontSize: '0.73rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                border: filter === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                background: filter === tab.id ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: filter === tab.id ? '#38bdf8' : '#94a3b8',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Notification List */}
        <div 
          className="admin-notif-scroll-area"
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            padding: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'rgba(56, 189, 248, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}>
                <CheckCircle2 size={30} />
              </div>
              <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f1f5f9' }}>
                {isAnyCleared ? 'All Notifications Cleared!' : 'No new notifications right now'}
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', maxWidth: '320px', lineHeight: 1.5, margin: 0 }}>
                {isAnyCleared 
                  ? 'You have cleared all past messages. New bookings or user logins will appear here automatically.'
                  : 'When users register, login, or book site deliveries and materials, their details appear here instantly.'}
              </p>

              {isAnyCleared && (
                <button
                  onClick={handleRestoreAll}
                  style={{
                    marginTop: '0.5rem',
                    background: 'rgba(56, 189, 248, 0.1)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    color: '#38bdf8',
                    padding: '0.35rem 0.8rem',
                    borderRadius: '7px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <RotateCcw size={13} />
                  <span>Restore Cleared Messages</span>
                </button>
              )}
            </div>
          ) : (
            filtered.map((item) => {
              const cleanMobile = getCleanMobile(item.mobile);
              const isMaterial = item.type === 'MATERIAL_BOOKED';
              const isService = item.type === 'SERVICE_BOOKED';
              const isLogin = item.type === 'USER_LOGIN';

              return (
                <div
                  key={item.id}
                  className="admin-notif-item-card"
                  style={{
                    flexShrink: 0,
                    minHeight: 'fit-content',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: isMaterial 
                      ? '1px solid rgba(56, 189, 248, 0.35)' 
                      : isService 
                        ? '1px solid rgba(245, 158, 11, 0.35)' 
                        : '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '0.9rem',
                    position: 'relative',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                    transition: 'transform 0.2s, border-color 0.2s'
                  }}
                >
                  {/* Top Bar: Badge, Timestamp & Dismiss X button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem', gap: '0.4rem' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '0.18rem 0.5rem',
                      borderRadius: '5px',
                      color: item.badge_color,
                      background: `${item.badge_color}22`,
                      border: `1px solid ${item.badge_color}44`,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {isMaterial && <Truck size={12} />}
                      {isService && <Package size={12} />}
                      {isLogin && <User size={12} />}
                      {item.badge}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' }}>
                        <Clock size={11} />
                        {formatTimeAgo(item.created_at)}
                      </span>

                      {/* Option to clear this individual notification */}
                      <button
                        onClick={(e) => handleDismissOne(item.id, e)}
                        title="Dismiss this notification"
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: 'none',
                          color: '#94a3b8',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#f87171';
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#94a3b8';
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Customer Core Profile: Name & Contact */}
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    marginBottom: '0.65rem',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.35rem' }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', wordBreak: 'break-word' }}>
                          👤 {item.user_name}
                        </div>
                        {item.email && (
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', wordBreak: 'break-all' }}>
                            {item.email}
                          </div>
                        )}
                      </div>

                      {/* Phone / Call & WhatsApp Quick Action Buttons */}
                      {cleanMobile && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                          <a
                            href={`tel:${cleanMobile}`}
                            title="Call customer directly"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              padding: '0.22rem 0.5rem',
                              borderRadius: '6px',
                              fontSize: '0.71rem',
                              fontWeight: 700,
                              textDecoration: 'none',
                              color: '#38bdf8',
                              background: 'rgba(56, 189, 248, 0.12)',
                              border: '1px solid rgba(56, 189, 248, 0.3)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <Phone size={11} />
                            <span>{cleanMobile}</span>
                          </a>

                          <a
                            href={`https://wa.me/91${cleanMobile}?text=${encodeURIComponent(`Vanakkam ${item.user_name}, this is Sri Angalamman Blue Metals regarding your order...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '0.22rem 0.45rem',
                              borderRadius: '6px',
                              fontSize: '0.71rem',
                              textDecoration: 'none',
                              color: '#22c55e',
                              background: 'rgba(34, 197, 94, 0.12)',
                              border: '1px solid rgba(34, 197, 94, 0.3)'
                            }}
                          >
                            <MessageCircle size={12} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Site Address */}
                    <div style={{
                      marginTop: '0.5rem',
                      paddingTop: '0.45rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.35rem',
                      fontSize: '0.77rem',
                      color: '#cbd5e1'
                    }}>
                      <MapPin size={13} color="#f97316" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ flex: 1, wordBreak: 'break-word', lineHeight: 1.35 }}>
                        <strong style={{ color: '#94a3b8' }}>Site Address: </strong>
                        {item.address || 'Puducherry Site (Address pending)'}
                      </div>
                    </div>
                  </div>

                  {/* IMPORTANT: BOOKED SERVICE / MATERIAL DETAIL LIST */}
                  {(isMaterial || isService) && (
                    <div style={{
                      background: isMaterial ? 'rgba(56, 189, 248, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                      border: isMaterial ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '8px',
                      padding: '0.65rem 0.75rem',
                      marginBottom: '0.65rem'
                    }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isMaterial ? '#93c5fd' : '#fde68a', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>
                        📋 Booked Material & Service Details:
                      </div>

                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.35rem', wordBreak: 'break-word' }}>
                        {item.booked_service_or_material}
                      </div>

                      {item.details?.preferred_date && (
                        <div style={{ fontSize: '0.74rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                          <Calendar size={12} color="#38bdf8" />
                          <span>Delivery Date: <strong>{item.details.preferred_date}</strong></span>
                        </div>
                      )}

                      {item.details?.notes && (
                        <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.25rem', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '0.3rem 0.45rem', borderRadius: '4px', wordBreak: 'break-word' }}>
                          "{item.details.notes}"
                        </div>
                      )}

                      {item.details?.message && (
                        <div style={{ fontSize: '0.73rem', color: '#94a3b8', marginTop: '0.25rem', fontStyle: 'italic', background: 'rgba(0,0,0,0.2)', padding: '0.3rem 0.45rem', borderRadius: '4px', wordBreak: 'break-word' }}>
                          "{item.details.message}"
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.45rem', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                          Ref: <strong style={{ color: '#fff' }}>{item.reference_no}</strong>
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.1rem 0.45rem',
                          borderRadius: '4px',
                          background: item.details?.status === 'Pending' ? 'rgba(234, 179, 8, 0.18)' : 'rgba(34, 197, 94, 0.18)',
                          color: item.details?.status === 'Pending' ? '#facc15' : '#4ade80'
                        }}>
                          {item.details?.status || 'Active'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* If User Login item: Additional Login Info */}
                  {isLogin && (
                    <div style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '8px',
                      padding: '0.55rem 0.7rem',
                      marginBottom: '0.65rem',
                      fontSize: '0.75rem',
                      color: '#a7f3d0'
                    }}>
                      ✓ Customer registered / signed into site account. Total visits: <strong>{item.details?.login_count || 1}</strong>
                    </div>
                  )}

                  {/* Action Link: Manage in Admin Portal */}
                  {onOpenAdminPortal && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAdminPortal();
                      }}
                      style={{
                        width: '100%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        padding: '0.4rem',
                        color: '#38bdf8',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => (e.target.style.background = 'rgba(56, 189, 248, 0.15)')}
                      onMouseLeave={(e) => (e.target.style.background = 'rgba(255, 255, 255, 0.04)')}
                    >
                      <span>Manage in Admin Portal</span>
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Floating Window Footer */}
        <div style={{
          padding: '0.8rem 1.2rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.95)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          gap: '0.5rem'
        }}>
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            {activeNotifications.length} active notifications
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {isAnyCleared && (
              <button
                onClick={handleRestoreAll}
                title="Restore all cleared notifications"
                style={{
                  background: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Restore
              </button>
            )}

            {onOpenAdminPortal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminPortal();
                }}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.32rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ShieldCheck size={13} />
                <span>Admin Portal</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
