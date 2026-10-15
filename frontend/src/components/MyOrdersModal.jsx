import React, { useState, useEffect } from 'react';
import { 
  X, 
  Package, 
  Truck, 
  FileText, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  RotateCw, 
  ExternalLink, 
  Plus, 
  AlertCircle,
  Receipt,
  ChevronRight
} from 'lucide-react';
import { api } from '../api';

const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function MyOrdersModal({ 
  isOpen, 
  onClose, 
  user, 
  admin,
  onOpenDelivery, 
  onOpenQuote, 
  onOpenDashboard,
  onViewInvoice 
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'quotes'
  const [deliveries, setDeliveries] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCustomerOrders();
    }
  }, [isOpen]);

  const loadCustomerOrders = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);
      setFetchError('');

      const [delRes, ordRes, qRes] = await Promise.all([
        api.getMyDeliveries().catch(() => []),
        api.getMyOrders ? api.getMyOrders().catch(() => []) : Promise.resolve([]),
        api.getMyQuotes().catch(() => [])
      ]);

      setDeliveries(Array.isArray(delRes) ? delRes : []);
      setOrders(Array.isArray(ordRes) ? ordRes : []);
      setQuotes(Array.isArray(qRes) ? qRes : []);
    } catch (err) {
      console.warn('Error loading customer orders:', err);
      setFetchError('Could not fetch latest orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (!isOpen) return null;

  // Combine delivery requests and direct orders
  const allOrdersList = [
    ...deliveries.map(d => ({
      id: `del-${d.id}`,
      type: 'delivery',
      number: d.request_number,
      title: `${d.quantity} ${d.unit || 'Load'} of ${d.material_name}`,
      material: d.material_name,
      quantity: d.quantity,
      unit: d.unit || 'Load',
      city: d.city || 'Pondicherry',
      transportCharge: d.transport_charge || 0,
      address: d.delivery_address,
      preferredDate: d.preferred_date,
      status: d.status || 'Pending',
      notes: d.additional_notes,
      createdAt: d.created_at,
      raw: d
    })),
    ...orders.map(o => ({
      id: `ord-${o.id}`,
      type: 'order',
      number: o.order_number,
      title: o.items && o.items.length 
        ? o.items.map(it => `${it.quantity} ${it.unit} ${it.material_name}`).join(', ')
        : `Order #${o.order_number}`,
      material: o.items && o.items[0] ? o.items[0].material_name : 'Materials',
      quantity: o.items && o.items[0] ? o.items[0].quantity : 1,
      unit: o.items && o.items[0] ? o.items[0].unit : 'Unit',
      address: o.delivery_address,
      preferredDate: null,
      status: o.status || 'Pending',
      notes: null,
      createdAt: o.created_at,
      finalAmount: o.final_amount,
      raw: o
    }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
      case 'Paid':
      case 'Converted':
        return (
          <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
            <CheckCircle2 size={12} /> {status}
          </span>
        );
      case 'Out for Delivery':
      case 'Confirmed':
      case 'Processing':
        return (
          <span className="badge badge-blue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
            <Truck size={12} /> {status}
          </span>
        );
      case 'Pending':
      case 'Unpaid':
        return (
          <span className="badge badge-orange" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
            <Clock size={12} /> {status}
          </span>
        );
      case 'Cancelled':
        return (
          <span className="badge badge-red" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
            {status}
          </span>
        );
      default:
        return (
          <span className="badge badge-blue" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
            {status}
          </span>
        );
    }
  };

  const getProgressStep = (status) => {
    if (status === 'Delivered') return 4;
    if (status === 'Out for Delivery') return 3;
    if (status === 'Confirmed' || status === 'Processing') return 2;
    if (status === 'Cancelled') return -1;
    return 1; // Pending
  };

  const activeOrdersCount = allOrdersList.filter(o => 
    o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  const deliveredCount = allOrdersList.filter(o => o.status === 'Delivered').length;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.82)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        className="modal-container orders-modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #0d172a 0%, #080f1e 100%)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.12)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.65)',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(37, 99, 235, 0.3) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)'
            }}>
              <Package size={22} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <h2 style={{
                  margin: 0,
                  fontSize: 'clamp(1.15rem, 3.5vw, 1.35rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap'
                }}>
                  My Orders & Deliveries
                </h2>
                {allOrdersList.length > 0 && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '0.15rem 0.5rem',
                    borderRadius: '9999px'
                  }}>
                    {allOrdersList.length} Total
                  </span>
                )}
              </div>
              <p style={{
                margin: '0.2rem 0 0 0',
                fontSize: '0.82rem',
                color: '#94a3b8',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.name || 'Customer'} • Real-time status for Puducherry site dispatch
              </p>
            </div>
          </div>

          {/* Right Action Icons in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <button
              onClick={() => loadCustomerOrders(true)}
              className="btn btn-outline btn-sm orders-refresh-btn"
              disabled={refreshing || loading}
              style={{
                padding: '0.4rem 0.65rem',
                borderRadius: '8px',
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: '#94a3b8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.78rem'
              }}
              title="Refresh Orders"
            >
              <RotateCw size={14} className={refreshing ? 'animate-spin' : ''} />
              <span className="orders-header-btn-text">Refresh</span>
            </button>

            {onOpenDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDashboard();
                }}
                className="btn btn-outline btn-sm orders-dashboard-btn"
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  borderColor: 'rgba(56, 189, 248, 0.35)',
                  background: 'rgba(56, 189, 248, 0.08)',
                  color: '#38bdf8',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
                title="Go to Full Dashboard"
              >
                <span>Full Dashboard</span>
                <ExternalLink size={13} />
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
              aria-label="Close My Orders Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Quick Metric Bar */}
        <div style={{
          background: 'rgba(10, 18, 34, 0.6)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '0.75rem 1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Dispatches
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '0.1rem' }}>
              {activeOrdersCount}
            </span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Completed Deliveries
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', marginTop: '0.1rem' }}>
              {deliveredCount}
            </span>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <span style={{ fontSize: '0.70rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Price Quotes
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb923c', marginTop: '0.1rem' }}>
              {quotes.length}
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem 0 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          overflowX: 'auto'
        }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              background: activeTab === 'orders' ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
              color: activeTab === 'orders' ? '#38bdf8' : '#94a3b8',
              borderBottom: activeTab === 'orders' ? '2px solid #38bdf8' : '2px solid transparent',
              fontWeight: activeTab === 'orders' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
          >
            <Truck size={15} />
            <span>Site Deliveries & Orders ({allOrdersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.6rem 1.1rem',
              borderRadius: '10px 10px 0 0',
              border: 'none',
              background: activeTab === 'quotes' ? 'rgba(251, 146, 60, 0.15)' : 'transparent',
              color: activeTab === 'quotes' ? '#fb923c' : '#94a3b8',
              borderBottom: activeTab === 'quotes' ? '2px solid #fb923c' : '2px solid transparent',
              fontWeight: activeTab === 'quotes' ? 700 : 500,
              fontSize: '0.88rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s'
            }}
          >
            <FileText size={15} />
            <span>Quotations ({quotes.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {fetchError && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} />
              <span>{fetchError}</span>
            </div>
          )}

          {loading ? (
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <RotateCw size={32} className="animate-spin" color="#38bdf8" />
              <div style={{ fontSize: '0.92rem' }}>Fetching your order dispatch records...</div>
            </div>
          ) : activeTab === 'orders' ? (
            /* Orders & Deliveries Tab */
            allOrdersList.length === 0 ? (
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px dashed rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '3rem 1.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <Truck size={28} />
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                  No Site Orders Placed Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                  You haven't booked any construction material deliveries yet. Order M-Sand, Blue Metals, or gravel with direct site transport.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenDelivery) onOpenDelivery();
                    }}
                    className="btn btn-primary"
                    style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
                  >
                    <Truck size={16} /> Book Site Delivery Now
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenQuote) onOpenQuote();
                    }}
                    className="btn btn-outline"
                    style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
                  >
                    <FileText size={16} /> Get Price Quote
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {allOrdersList.map((order) => {
                  const step = getProgressStep(order.status);
                  return (
                    <div
                      key={order.id}
                      style={{
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.09)',
                        borderRadius: '16px',
                        padding: '1.25rem',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                        transition: 'all 0.2s ease',
                        position: 'relative'
                      }}
                    >
                      {/* Top Header of Card */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '0.65rem',
                        marginBottom: '0.75rem',
                        paddingBottom: '0.65rem',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <span style={{
                            fontSize: '0.88rem',
                            fontWeight: 800,
                            color: '#38bdf8',
                            letterSpacing: '0.02em',
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.25)',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px'
                          }}>
                            #{order.number}
                          </span>
                          {getStatusBadge(order.status)}
                          {order.city && (
                            <span className={`badge ${order.city === 'Villupuram' ? 'badge-blue' : order.city === 'Tindivanam' ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}>
                              📍 {order.city} {order.transportCharge > 0 ? `(+₹${Number(order.transportCharge).toLocaleString('en-IN')})` : ''}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Clock size={13} />
                          <span>Booked: {formatDateDDMMYYYY(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Title & Quantity */}
                      <div style={{ marginBottom: '0.75rem' }}>
                        <h4 style={{
                          margin: '0 0 0.35rem 0',
                          fontSize: '1.15rem',
                          fontWeight: 700,
                          color: '#ffffff'
                        }}>
                          {order.title}
                        </h4>

                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem',
                          fontSize: '0.86rem',
                          color: '#cbd5e1'
                        }}>
                          {order.address && (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                              <MapPin size={15} color="#fb923c" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span style={{ color: '#cbd5e1' }}>
                                Site: <strong style={{ color: '#ffffff' }}>{order.address}</strong>
                              </span>
                            </div>
                          )}

                          {order.preferredDate && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                              <Calendar size={14} color="#60a5fa" />
                              <span>Preferred Dispatch Date: <strong style={{ color: '#cbd5e1' }}>{order.preferredDate}</strong></span>
                            </div>
                          )}

                          {order.finalAmount != null && (
                            <div style={{ fontSize: '0.88rem', color: '#34d399', fontWeight: 700, marginTop: '0.2rem' }}>
                              Order Total: ₹{Number(order.finalAmount).toLocaleString('en-IN')}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Visual Dispatch Progress Bar (if not cancelled) */}
                      {step > 0 && (
                        <div style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                          padding: '0.65rem 0.85rem',
                          marginTop: '0.6rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                            {[
                              { label: 'Placed', s: 1 },
                              { label: 'Confirmed', s: 2 },
                              { label: 'Dispatched', s: 3 },
                              { label: 'Delivered', s: 4 }
                            ].map((st, idx, arr) => {
                              const isCompleted = step >= st.s;
                              const isCurrent = step === st.s;
                              return (
                                <div key={st.label} style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  position: 'relative',
                                  zIndex: 2,
                                  flex: 1
                                }}>
                                  <div style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    background: isCompleted ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                                    color: isCompleted ? '#0f172a' : '#64748b',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.65rem',
                                    fontWeight: 900,
                                    border: isCurrent ? '2px solid #ffffff' : 'none',
                                    boxShadow: isCurrent ? '0 0 10px #38bdf8' : 'none'
                                  }}>
                                    {isCompleted ? '✓' : st.s}
                                  </div>
                                  <span style={{
                                    fontSize: '0.70rem',
                                    marginTop: '0.25rem',
                                    fontWeight: isCurrent ? 700 : 500,
                                    color: isCurrent ? '#38bdf8' : isCompleted ? '#cbd5e1' : '#64748b',
                                    textAlign: 'center'
                                  }}>
                                    {st.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Quotations Tab */
            quotes.length === 0 ? (
              <div style={{
                background: 'rgba(15, 23, 42, 0.5)',
                border: '1px dashed rgba(255, 255, 255, 0.12)',
                borderRadius: '16px',
                padding: '3rem 1.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(251, 146, 60, 0.1)',
                  color: '#fb923c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto'
                }}>
                  <FileText size={28} />
                </div>
                <h3 style={{ color: '#ffffff', fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.4rem 0' }}>
                  No Quotations Requested Yet
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 1.5rem auto', lineHeight: 1.5 }}>
                  Need an official price calculation including lorry freight for your site in Puducherry? Submit a quotation request.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenQuote) onOpenQuote();
                  }}
                  className="btn btn-orange"
                  style={{ fontSize: '0.88rem', padding: '0.65rem 1.25rem' }}
                >
                  <FileText size={16} /> Request Official Quotation
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {quotes.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.65rem',
                      marginBottom: '0.75rem',
                      paddingBottom: '0.65rem',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{
                          fontSize: '0.88rem',
                          fontWeight: 800,
                          color: '#fb923c',
                          letterSpacing: '0.02em',
                          background: 'rgba(251, 146, 60, 0.1)',
                          border: '1px solid rgba(251, 146, 60, 0.25)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '6px'
                        }}>
                          #{q.request_number}
                        </span>
                        {getStatusBadge(q.status)}
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        Requested: {formatDateDDMMYYYY(q.created_at)}
                      </div>
                    </div>

                    <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
                      {q.quantity} {q.unit || 'Load'} of {q.material_name}
                    </h4>

                    <div style={{ fontSize: '0.86rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={15} color="#fb923c" /> Location: {q.delivery_location}
                    </div>

                    {q.admin_notes && (
                      <div style={{
                        marginTop: '0.65rem',
                        padding: '0.6rem 0.85rem',
                        background: 'rgba(37, 99, 235, 0.12)',
                        border: '1px solid rgba(37, 99, 235, 0.28)',
                        borderRadius: '8px',
                        fontSize: '0.84rem',
                        color: '#93c5fd'
                      }}>
                        <strong>Yard Dispatch Note:</strong> {q.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <button
            onClick={() => {
              onClose();
              if (onOpenDelivery) onOpenDelivery();
            }}
            className="btn btn-primary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}
          >
            <Plus size={15} /> Book Another Delivery
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {onOpenDashboard && (
              <button
                onClick={() => {
                  onClose();
                  onOpenDashboard();
                }}
                className="btn btn-outline btn-sm"
                style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}
              >
                Go to Full Dashboard →
              </button>
            )}
            <button
              onClick={onClose}
              className="btn btn-outline btn-sm"
              style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Responsive media styles for modal */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 640px) {
          .orders-modal-container {
            max-height: 94vh !important;
            border-radius: 16px !important;
          }
          .orders-header-btn-text {
            display: none !important;
          }
          .orders-dashboard-btn {
            padding: 0.35rem 0.55rem !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
