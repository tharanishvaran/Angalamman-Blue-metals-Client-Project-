import React, { useState, useEffect } from 'react';
import { 
  User, 
  FileText, 
  Truck, 
  Receipt, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowLeft, 
  Phone, 
  MapPin, 
  Plus 
} from 'lucide-react';
import { api } from '../api';

export default function CustomerDashboard({ 
  user, 
  onClose, 
  onOpenQuote, 
  onOpenDelivery, 
  onViewInvoice, 
  onProfileUpdated 
}) {
  const [activeTab, setActiveTab] = useState('deliveries'); // 'deliveries', 'quotes', 'invoices', 'profile'
  const [quotes, setQuotes] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user.name || '');
  const [profileMobile, setProfileMobile] = useState(user.mobile || '');
  const [profileAddress, setProfileAddress] = useState(user.address || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

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
      setQuotes(q);
      setDeliveries(d);
      setInvoices(inv);
    } catch (err) {
      console.error('Error fetching dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const res = await api.updateProfile({
        name: profileName,
        mobile: profileMobile,
        address: profileAddress
      });
      setProfileMsg('Profile saved successfully!');
      if (onProfileUpdated) onProfileUpdated(res.user);
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Paid':
      case 'Converted':
        return <span className="badge badge-green">{status}</span>;
      case 'Out for Delivery':
      case 'Confirmed':
      case 'Processing':
        return <span className="badge badge-blue">{status}</span>;
      case 'Pending':
      case 'Unpaid':
        return <span className="badge badge-orange">{status}</span>;
      case 'Cancelled':
        return <span className="badge badge-red">{status}</span>;
      default:
        return <span className="badge badge-blue">{status}</span>;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 15% 15%, #0f1d38 0%, #070e1b 60%, #050a14 100%)',
      paddingTop: '6rem',
      paddingBottom: '5rem'
    }}>
      <div className="container">
        
        {/* Top Header Bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2.5rem'
        }}>
          <div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#38bdf8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              <ArrowLeft size={16} /> Back to Website
            </button>
            <h1 style={{ fontSize: '2.2rem', color: '#fff', fontWeight: 800 }}>
              Welcome, <span className="gradient-text">{user.name || 'Valued Customer'}</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Manage your construction material dispatches, track orders, and view tax invoices.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onOpenQuote} className="btn btn-outline btn-sm">
              <Plus size={14} /> New Quote
            </button>
            <button onClick={onOpenDelivery} className="btn btn-orange btn-sm">
              <Truck size={14} /> Book Delivery
            </button>
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
            { id: 'deliveries', label: `Site Deliveries (${deliveries.length})`, icon: <Truck size={16} /> },
            { id: 'quotes', label: `Quotations (${quotes.length})`, icon: <FileText size={16} /> },
            { id: 'invoices', label: `Bills & Invoices (${invoices.length})`, icon: <Receipt size={16} /> },
            { id: 'profile', label: 'My Customer Profile', icon: <User size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                border: 'none',
                background: activeTab === tab.id ? 'rgba(37, 99, 235, 0.25)' : 'transparent',
                color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
                fontWeight: activeTab === tab.id ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
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
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Truck size={42} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Site Deliveries Yet</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Ready to pour concrete or lay bricks? Book vehicle transport with our dispatch team.
                </p>
                <button onClick={onOpenDelivery} className="btn btn-primary btn-sm">
                  Book First Delivery
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {deliveries.map((del) => (
                  <div 
                    key={del.id}
                    className="glass-card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      borderRadius: '14px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>
                          {del.request_number}
                        </span>
                        {getStatusBadge(del.status)}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.25rem' }}>
                        {del.quantity} {del.unit} of {del.material_name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} color="#fb923c" /> Site: {del.delivery_address}
                      </div>
                      {del.preferred_date && (
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                          Preferred Slot: {del.preferred_date}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Booked: {new Date(del.created_at).toLocaleDateString()}
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
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <FileText size={42} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Quotation Requests</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Request formal price calculations for sands, aggregates, or bulk truckloads.
                </p>
                <button onClick={onOpenQuote} className="btn btn-orange btn-sm">
                  Request Quotation
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {quotes.map((q) => (
                  <div 
                    key={q.id}
                    className="glass-card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      borderRadius: '14px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fb923c' }}>
                          {q.request_number}
                        </span>
                        {getStatusBadge(q.status)}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.25rem' }}>
                        {q.quantity} {q.unit} of {q.material_name}
                      </h3>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                        Location: {q.delivery_location}
                      </div>
                      {q.admin_notes && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(37, 99, 235, 0.1)', border: '1px solid rgba(37, 99, 235, 0.25)', borderRadius: '6px', fontSize: '0.8rem', color: '#93c5fd' }}>
                          <strong>Yard Note:</strong> {q.admin_notes}
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Requested: {new Date(q.created_at).toLocaleDateString()}
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
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <Receipt size={42} color="#64748b" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>No Invoices Issued</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Official tax invoices generated by our accounts office will appear here for viewing and downloading.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {invoices.map((inv) => (
                  <div 
                    key={inv.id}
                    className="glass-card"
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1.5rem',
                      borderRadius: '14px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8' }}>
                          {inv.invoice_number}
                        </span>
                        {getStatusBadge(inv.payment_status)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                        {inv.items ? inv.items.map(it => `${it.quantity} ${it.unit} ${it.material_name}`).join(', ') : 'Materials & Freight'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                        Date: {new Date(inv.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Grand Total</div>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fb923c' }}>
                          ₹{inv.grand_total.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <button
                        onClick={() => onViewInvoice(inv)}
                        className="btn btn-outline btn-sm"
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
          <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', borderRadius: '18px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1.25rem' }}>
              Customer Contact Details
            </h3>

            {profileMsg && (
              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Google Account)</label>
                <input
                  type="email"
                  disabled
                  className="form-control"
                  style={{ opacity: 0.7 }}
                  value={user.email}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Verified Mobile Number (10 digits)</label>
                <input
                  type="tel"
                  required
                  className="form-control"
                  placeholder="9944076675"
                  value={profileMobile}
                  onChange={(e) => setProfileMobile(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Construction Site Address (Puducherry)</label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="Plot/Street, Colony, Area in Puducherry"
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {savingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
