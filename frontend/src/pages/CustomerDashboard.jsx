import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Truck, 
  Receipt, 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Plus,
  LogOut,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  Download
} from 'lucide-react';
import { api } from '../api';

export default function CustomerDashboard({ 
  user, 
  admin,
  onClose, 
  onOpenAdminPortal,
  onOpenQuote, 
  onOpenDelivery, 
  onViewInvoice, 
  onProfileUpdated,
  onLogout
}) {
  const ADMIN_EMAILS = [
    'angalammanbluemetalspondy@gmail.com',
    'sriangalammanbluemetalspondy@gmail.com',
    'admin@angalamman.com'
  ];
  const isAccountAdmin = Boolean(
    admin ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    ADMIN_EMAILS.includes((user?.email || '').toLowerCase().trim()) ||
    ADMIN_EMAILS.includes((admin?.email || '').toLowerCase().trim())
  );

  const [activeTab, setActiveTab] = useState('deliveries'); // 'deliveries', 'quotes', 'invoices', 'profile'
  const [quotes, setQuotes] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileMobile, setProfileMobile] = useState(user?.mobile || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [q, d, inv] = await Promise.all([
        api.getMyQuotes().catch(() => []),
        api.getMyDeliveries().catch(() => []),
        api.getMyInvoices().catch(() => [])
      ]);
      setQuotes(Array.isArray(q) ? q : []);
      setDeliveries(Array.isArray(d) ? d : []);
      setInvoices(Array.isArray(inv) ? inv : []);
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileMsg('');

    if (!profileName || profileName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }

    const cleanedMobile = (profileMobile || '').replace(/\D/g, '');
    if (cleanedMobile && !/^[6-9]\d{9}$/.test(cleanedMobile)) {
      setProfileError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.updateProfile({
        name: profileName.trim(),
        mobile: cleanedMobile,
        address: profileAddress.trim()
      });
      setProfileMsg('Profile updated successfully!');
      if (onProfileUpdated) onProfileUpdated(res.user);
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Paid':
      case 'Converted':
        return <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle2 size={12} /> {status}</span>;
      case 'Out for Delivery':
      case 'Confirmed':
      case 'Processing':
        return <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Truck size={12} /> {status}</span>;
      case 'Pending':
      case 'Unpaid':
        return <span className="badge badge-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={12} /> {status}</span>;
      case 'Cancelled':
        return <span className="badge badge-red">{status}</span>;
      default:
        return <span className="badge badge-blue">{status}</span>;
    }
  };

  const renderAvatar = (size = 46) => {
    if (user?.profile_image) {
      return (
        <img
          src={user.profile_image}
          alt={user.name || 'User'}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(56, 189, 248, 0.4)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
          }}
        />
      );
    }
    const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #0284c7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: `${Math.round(size * 0.42)}px`,
          fontWeight: 800,
          border: '2px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
        }}
      >
        {initial}
      </div>
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 15% 15%, #0f1d38 0%, #070e1b 60%, #050a14 100%)',
      paddingTop: '3rem',
      paddingBottom: '5rem',
      position: 'relative',
      zIndex: 1
    }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {/* Admin Quick Switcher Banner (Shown if current user has admin privileges) */}
        {isAccountAdmin && onOpenAdminPortal && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.18) 0%, rgba(153, 27, 27, 0.28) 100%)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            backdropFilter: 'blur(16px)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: '0 8px 24px rgba(220, 38, 38, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#dc2626',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Administrator Account Detected</span>
                  <span style={{ fontSize: '0.65rem', background: '#dc2626', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>SUPER ADMIN</span>
                </div>
                <div style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.15rem' }}>
                  {user?.email || admin?.email} is registered with administrative privileges. You can manage materials, deliveries, quotes, and customer accounts in the Admin Portal.
                </div>
              </div>
            </div>
            <button
              onClick={onOpenAdminPortal}
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                borderColor: '#ef4444',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)'
              }}
            >
              <ShieldCheck size={16} /> Open Admin Portal →
            </button>
          </div>
        )}

        {/* Top Header Card */}
        <div style={{
          background: 'rgba(13, 22, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '1.75rem 2rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1.25rem'
          }}>
            {/* Customer Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {renderAvatar(56)}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.75rem', color: '#fff', fontWeight: 800, margin: 0 }}>
                    {user?.name || admin?.name || 'Valued Customer'}
                  </h1>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    background: isAccountAdmin ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.18)',
                    color: isAccountAdmin ? '#f87171' : '#34d399',
                    border: isAccountAdmin ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.35)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    <ShieldCheck size={12} /> {isAccountAdmin ? 'Admin Account' : 'Verified Customer'}
                  </span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <span>{user?.email || admin?.email}</span>
                  {(user?.mobile || admin?.mobile) && <span>• +91 {user?.mobile || admin?.mobile}</span>}
                </div>
              </div>
            </div>

            {/* Quick Navigation Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {isAccountAdmin && onOpenAdminPortal && (
                <button
                  onClick={onOpenAdminPortal}
                  className="btn btn-primary btn-sm"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                    borderColor: '#ef4444',
                    fontWeight: 700
                  }}
                >
                  <ShieldCheck size={15} /> Admin Portal
                </button>
              )}
              <button 
                onClick={onOpenQuote} 
                className="btn btn-outline btn-sm"
                style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                <Plus size={15} /> New Quote
              </button>
              <button 
                onClick={onOpenDelivery} 
                className="btn btn-orange btn-sm"
              >
                <Truck size={15} /> Book Delivery
              </button>
              <button 
                onClick={onClose} 
                className="btn btn-outline btn-sm"
                style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
              >
                <ArrowLeft size={15} /> Back to Store
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                  title="Sign Out"
                >
                  <LogOut size={15} /> Logout
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics Counter */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Site Deliveries</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.2rem' }}>{deliveries.length}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quotations Requested</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fb923c', marginTop: '0.2rem' }}>{quotes.length}</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.9rem 1.1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoices & Bills</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>{invoices.length}</div>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          paddingBottom: '0.75rem',
          marginBottom: '2rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'deliveries', label: `My Deliveries (${deliveries.length})`, icon: <Truck size={16} /> },
            { id: 'quotes', label: `My Quotations (${quotes.length})`, icon: <FileText size={16} /> },
            { id: 'invoices', label: `Invoices & Bills (${invoices.length})`, icon: <Receipt size={16} /> },
            { id: 'profile', label: 'Customer Profile', icon: <User size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'rgba(255, 255, 255, 0.04)',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 4px 14px rgba(37, 99, 235, 0.4)' : 'none'
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Site Deliveries */}
        {activeTab === 'deliveries' && (
          <div>
            {deliveries.length === 0 ? (
              <div style={{
                background: 'rgba(13, 22, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '3.5rem 2rem',
                textAlign: 'center'
              }}>
                <Truck size={48} color="#38bdf8" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  No Site Deliveries Booked Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.75rem', maxWidth: '480px', margin: '0 auto 1.75rem auto' }}>
                  Ready to order blue metals, sands, or gravel? Book direct site delivery with our Puducherry dispatch tippers.
                </p>
                <button onClick={onOpenDelivery} className="btn btn-primary">
                  <Truck size={16} /> Book Your First Delivery
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {deliveries.map((del) => (
                  <div 
                    key={del.id}
                    style={{
                      background: 'rgba(13, 22, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '1.5rem 1.75rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.04em' }}>
                          #{del.request_number}
                        </span>
                        {getStatusBadge(del.status)}
                      </div>
                      <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700, marginBottom: '0.35rem' }}>
                        {del.quantity} {del.unit} of {del.material_name}
                      </h3>
                      <div style={{ fontSize: '0.88rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                        <MapPin size={15} color="#fb923c" /> Site Address: {del.delivery_address}
                      </div>
                      {del.preferred_date && (
                        <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} color="#60a5fa" /> Preferred Date: {del.preferred_date}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Requested on: {new Date(del.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Quotations */}
        {activeTab === 'quotes' && (
          <div>
            {quotes.length === 0 ? (
              <div style={{
                background: 'rgba(13, 22, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '3.5rem 2rem',
                textAlign: 'center'
              }}>
                <FileText size={48} color="#fb923c" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  No Quotations Requested Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginBottom: '1.75rem', maxWidth: '480px', margin: '0 auto 1.75rem auto' }}>
                  Need an official price calculation including lorry freight for your site in Puducherry? Submit a quotation request.
                </p>
                <button onClick={onOpenQuote} className="btn btn-orange">
                  <FileText size={16} /> Request Official Quotation
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {quotes.map((q) => (
                  <div 
                    key={q.id}
                    style={{
                      background: 'rgba(13, 22, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '1.5rem 1.75rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fb923c' }}>
                          #{q.request_number}
                        </span>
                        {getStatusBadge(q.status)}
                      </div>
                      <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700, marginBottom: '0.35rem' }}>
                        {q.quantity} {q.unit} of {q.material_name}
                      </h3>
                      <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                        Location: {q.delivery_location}
                      </div>
                      {q.admin_notes && (
                        <div style={{ marginTop: '0.65rem', padding: '0.6rem 0.85rem', background: 'rgba(37, 99, 235, 0.12)', border: '1px solid rgba(37, 99, 235, 0.28)', borderRadius: '8px', fontSize: '0.84rem', color: '#93c5fd' }}>
                          <strong>Yard Dispatch Note:</strong> {q.admin_notes}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Submitted: {new Date(q.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Invoices */}
        {activeTab === 'invoices' && (
          <div>
            {invoices.length === 0 ? (
              <div style={{
                background: 'rgba(13, 22, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '18px',
                padding: '3.5rem 2rem',
                textAlign: 'center'
              }}>
                <Receipt size={48} color="#34d399" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
                <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                  No Invoices Issued Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.92rem', maxWidth: '480px', margin: '0 auto' }}>
                  Official weighbridge bills and GST tax invoices generated for your site will be displayed here for instant viewing and printing.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {invoices.map((inv) => (
                  <div 
                    key={inv.id}
                    style={{
                      background: 'rgba(13, 22, 42, 0.85)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '16px',
                      padding: '1.5rem 1.75rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#38bdf8' }}>
                          {inv.invoice_number}
                        </span>
                        {getStatusBadge(inv.payment_status)}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
                        {inv.items ? inv.items.map(it => `${it.quantity} ${it.unit} ${it.material_name}`).join(', ') : 'Materials & Freight'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                        Date: {new Date(inv.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Grand Total</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb923c' }}>
                          ₹{inv.grand_total.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        onClick={() => onViewInvoice && onViewInvoice(inv)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <Receipt size={14} /> View / Print
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Customer Profile */}
        {activeTab === 'profile' && (
          <div style={{
            maxWidth: '620px',
            margin: '0 auto',
            background: 'rgba(13, 22, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '20px',
            padding: '2rem 2.25rem',
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              {renderAvatar(50)}
              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 700, margin: 0 }}>
                  Customer Profile
                </h3>
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Update your contact details for site dispatch coordination.
                </div>
              </div>
            </div>

            {profileMsg && (
              <div style={{ padding: '0.8rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', borderRadius: '10px', color: '#34d399', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                ✓ {profileMsg}
              </div>
            )}

            {profileError && (
              <div style={{ padding: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', borderRadius: '10px', color: '#f87171', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your name"
                  className="form-control"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="form-control"
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                  value={user?.email || ''}
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>
                  Registered account email cannot be changed.
                </span>
              </div>

              <div className="form-group" style={{ marginBottom: '1.1rem' }}>
                <label className="form-label">Contact Mobile (10-Digit Indian Mobile) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontWeight: 600 }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="Enter 10-digit number"
                    className="form-control"
                    style={{ paddingLeft: '45px' }}
                    value={profileMobile}
                    onChange={(e) => setProfileMobile(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Default Construction Site Address</label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="Street / Plot No., Colony, Area in Puducherry"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
              >
                {savingProfile ? 'Saving Details...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
