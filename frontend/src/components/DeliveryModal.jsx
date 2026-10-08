import React, { useState, useEffect, useMemo } from 'react';
import { 
  Truck, 
  CheckCircle2, 
  X, 
  MapPin, 
  AlertCircle, 
  ExternalLink, 
  Navigation, 
  Coins, 
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { DEFAULT_MATERIALS } from '../defaultData';

export default function DeliveryModal({ 
  isOpen, 
  onClose, 
  initialMaterial = '', 
  materials = [], 
  user, 
  onRequireLogin 
}) {
  const availableMaterials = useMemo(() => {
    return (materials && materials.length > 0) ? materials : DEFAULT_MATERIALS;
  }, [materials]);

  // Today's local date string formatted as YYYY-MM-DD for native date min attribute
  const todayDateString = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Tomorrow's date string
  const tomorrowDateString = useMemo(() => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    const d = String(next.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Day after tomorrow date string
  const dayAfterDateString = useMemo(() => {
    const next = new Date();
    next.setDate(next.getDate() + 2);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    const d = String(next.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    material: initialMaterial || 'M-Sand (Manufactured Sand)',
    quantity: '2',
    unit: 'Ton', // Restrict exclusively to Ton
    address: '',
    location_link: '',
    preferred_date: todayDateString,
    preferred_time_slot: 'Morning (7:00 AM - 11:00 AM)',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [bookedDelivery, setBookedDelivery] = useState(null);

  // Sync logged in user profile
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        mobile: user.mobile || prev.mobile,
        email: user.email || prev.email,
        address: user.address || prev.address
      }));
    }
  }, [user]);

  // Sync initial material if modal was triggered from specific product card
  useEffect(() => {
    if (initialMaterial) {
      const match = availableMaterials.find(m => 
        m.name.toLowerCase().includes(initialMaterial.toLowerCase()) ||
        initialMaterial.toLowerCase().includes(m.name.toLowerCase())
      );
      setForm((prev) => ({ 
        ...prev, 
        material: match ? match.name : initialMaterial,
        unit: 'Ton'
      }));
    }
  }, [initialMaterial, availableMaterials]);

  // Find active material price per Ton
  const activeMaterialObj = useMemo(() => {
    return availableMaterials.find(m => 
      m.name === form.material ||
      m.name.toLowerCase().includes(form.material.toLowerCase()) ||
      form.material.toLowerCase().includes(m.name.toLowerCase())
    ) || availableMaterials[0] || { price: 1600, unit: 'Ton' };
  }, [form.material, availableMaterials]);

  // Ton price: if standard load price is provided, convert or display authentic per-ton rate
  const unitPricePerTon = useMemo(() => {
    if (!activeMaterialObj) return 1600;
    const base = activeMaterialObj.price || 4800;
    if (activeMaterialObj.unit && activeMaterialObj.unit.toLowerCase() === 'ton') {
      return base;
    }
    // Transparent conversion for bulk materials (1 standard tipper load ~ 2.5 - 3 tons)
    if (activeMaterialObj.name.includes('M-Sand')) return 1600;
    if (activeMaterialObj.name.includes('P-Sand')) return 1750;
    if (activeMaterialObj.name.includes('River Sand')) return 2200;
    if (activeMaterialObj.name.includes('Sengal')) return 2400;
    if (activeMaterialObj.name.includes('1/4')) return 1400;
    if (activeMaterialObj.name.includes('1/2')) return 1500;
    if (activeMaterialObj.name.includes('3/4')) return 1600;
    if (activeMaterialObj.name.includes('1 1/2')) return 1450;
    if (activeMaterialObj.name.includes('Gravel')) return 1100;
    if (activeMaterialObj.name.includes('Powder')) return 950;
    return Math.round(base / 2.5);
  }, [activeMaterialObj]);

  const numQuantity = Math.max(0, parseFloat(form.quantity) || 0);
  const estimatedSubtotal = Math.round(unitPricePerTon * numQuantity);

  // Field validation logic
  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        if (!value || !value.trim()) return 'Customer Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s\.]+$/.test(value.trim())) return 'Name should contain letters only';
        return '';

      case 'mobile':
        if (!value || !value.trim()) return 'Mobile number is required';
        const cleanMobile = value.replace(/[\s\-\+]/g, '').replace(/^91/, '');
        if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
          return 'Enter a valid 10-digit Indian mobile number (e.g. 9842103456)';
        }
        return '';

      case 'email':
        if (value && value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email address';
          }
        }
        return '';

      case 'material':
        if (!value || !value.trim()) return 'Please select a construction material';
        return '';

      case 'quantity':
        if (!value || isNaN(value)) return 'Please specify quantity in tons';
        const q = parseFloat(value);
        if (q <= 0) return 'Quantity must be greater than 0 tons';
        if (q > 500) return 'For bulk quantities above 500 tons, please contact dispatch office directly';
        return '';

      case 'preferred_date':
        if (!value || !value.trim()) {
          return 'Please select a delivery date';
        }
        if (value < todayDateString) {
          return 'Delivery date cannot be in the past. Please select today or an upcoming date.';
        }
        return '';

      case 'address':
        if (!value || !value.trim()) return 'Site delivery address in Puducherry is required';
        if (value.trim().length < 8) return 'Please provide full site address (at least 8 characters with landmark/area)';
        return '';

      case 'location_link':
        if (value && value.trim()) {
          const val = value.trim();
          if (!/^https?:\/\//i.test(val)) {
            return 'Link must start with http:// or https:// (e.g. https://maps.app.goo.gl/...)';
          }
        }
        return '';

      default:
        return '';
    }
  };

  const validateAll = () => {
    const newErrors = {};
    const fieldsToValidate = ['name', 'mobile', 'email', 'material', 'quantity', 'preferred_date', 'address', 'location_link'];
    
    fieldsToValidate.forEach(field => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (touched[field]) {
      const err = validateField(field, val);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  // Browser Geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        handleChange('location_link', mapsUrl);
        setDetectingGps(false);
        setGpsSuccess(true);
      },
      (err) => {
        setDetectingGps(false);
        let msg = 'Unable to retrieve location automatically.';
        if (err.code === 1) msg = 'Location permission denied. Please allow access or paste Google Maps link manually.';
        alert(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      mobile: true,
      email: true,
      material: true,
      quantity: true,
      preferred_date: true,
      address: true,
      location_link: true
    });

    if (!validateAll()) return;

    if (!user && onRequireLogin) {
      onRequireLogin();
      return;
    }

    try {
      setLoading(true);
      const cleanMobile = form.mobile.replace(/[\s\-\+]/g, '').replace(/^91/, '');

      const fullAddress = form.location_link 
        ? `${form.address.trim()}\n📍 Google Maps: ${form.location_link.trim()}`
        : form.address.trim();

      const combinedNotes = [
        form.preferred_time_slot ? `Slot: ${form.preferred_time_slot}` : null,
        form.notes ? `Vehicle: ${form.notes}` : null,
        `Original Rate: ₹${unitPricePerTon.toLocaleString('en-IN')}/Ton`,
        `Est. Total: ₹${estimatedSubtotal.toLocaleString('en-IN')}`,
        form.location_link ? `Maps Link: ${form.location_link}` : null
      ].filter(Boolean).join(' | ');

      const formattedDateString = `${form.preferred_date} (${form.preferred_time_slot})`;

      const res = await api.submitDelivery({
        customer_name: form.name.trim(),
        customer_mobile: cleanMobile,
        customer_email: form.email ? form.email.trim() : '',
        material_name: form.material,
        quantity: numQuantity,
        unit: 'Ton', // Always Ton
        delivery_address: fullAddress,
        preferred_date: formattedDateString,
        additional_notes: combinedNotes
      });

      setBookedDelivery({
        ...res.delivery,
        original_price_per_ton: unitPricePerTon,
        estimated_total: estimatedSubtotal,
        preferred_date_raw: form.preferred_date,
        preferred_time_slot: form.preferred_time_slot,
        location_link: form.location_link
      });

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      alert(err.message || 'Delivery booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setBookedDelivery(null);
    setErrors({});
    setTouched({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '95%',
          maxHeight: '92vh',
          overflowY: 'auto',
          padding: '1.75rem 1.4rem'
        }}
      >
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              padding: '0.5rem', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(249, 115, 22, 0.25))', 
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              <Truck size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                Book Site Material Delivery
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#fb923c', fontWeight: 700, letterSpacing: '0.04em' }}>
                EXACT WEIGHBRIDGE TONNAGE • PUDUCHERRY
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              color: '#94a3b8', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Auth Banner */}
        {user ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '12px',
            padding: '0.65rem 0.9rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {user.profile_image ? (
              <img
                src={user.profile_image}
                alt={user.name}
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 700
              }}>
                {(user.name || user.email || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{user.name}</span>
                <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>Google Verified</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email} {user.mobile ? `• +91 ${user.mobile}` : ''}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(37, 99, 235, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#93c5fd' }}>
              🔒 Sign in with Google to link dispatches and download GST weighbridge receipts
            </div>
            {onRequireLogin && (
              <button
                type="button"
                onClick={onRequireLogin}
                className="btn btn-outline btn-sm"
                style={{ background: '#fff', color: '#1e293b', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 700, borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Sign in
              </button>
            )}
          </div>
        )}

        {/* BOOKED CONFIRMATION SCREEN */}
        {bookedDelivery ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.18)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}>
              <CheckCircle2 size={36} color="#10b981" />
            </div>

            <h4 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.3rem', fontWeight: 800 }}>
              Material Dispatch Booked!
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginBottom: '1.25rem' }}>
              Your order has been registered at our Thilaspettai dispatch depot.
            </p>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Tracking Reference ID:</span>
                <strong style={{ color: '#38bdf8', fontSize: '0.92rem' }}>{bookedDelivery.request_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Customer:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{bookedDelivery.customer_name} ({bookedDelivery.customer_mobile})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Material & Quantity:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{bookedDelivery.quantity} Ton(s) of {bookedDelivery.material_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Original Rate:</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹{bookedDelivery.original_price_per_ton?.toLocaleString('en-IN')} / Ton</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Est. Material Subtotal:</span>
                <strong style={{ color: '#34d399', fontSize: '1rem' }}>₹{bookedDelivery.estimated_total?.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Scheduled Dispatch:</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>{bookedDelivery.preferred_date}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.65rem', marginTop: '0.65rem' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.2rem' }}>Site Delivery Address:</div>
                <div style={{ color: '#e2e8f0', fontSize: '0.88rem', lineHeight: 1.4 }}>{bookedDelivery.delivery_address}</div>
              </div>
              {bookedDelivery.location_link && (
                <div style={{ marginTop: '0.65rem' }}>
                  <a
                    href={bookedDelivery.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: '#38bdf8',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    <MapPin size={14} /> Open Location in Google Maps <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Our transport driver will phone you before departure with the computerized weighbridge printout.
            </p>

            <button onClick={handleReset} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Done & Return
            </button>
          </div>
        ) : (
          /* DELIVERY BOOKING FORM */
          <form onSubmit={handleSubmit} noValidate>

            {/* Error Banner if form has issues */}
            {Object.keys(errors).some(k => errors[k]) && Object.keys(touched).length > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '10px',
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#fca5a5',
                fontSize: '0.82rem'
              }}>
                <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>Please correct the highlighted fields before booking delivery.</span>
              </div>
            )}

            {/* Row 1: Customer Name & Mobile */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Customer Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. V. Ramanathan"
                  className={`form-control ${errors.name && touched.name ? 'input-error' : ''}`}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  style={{
                    borderColor: (errors.name && touched.name) ? '#ef4444' : undefined,
                    background: (errors.name && touched.name) ? 'rgba(239, 68, 68, 0.05)' : undefined
                  }}
                />
                {errors.name && touched.name && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} /> {errors.name}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  placeholder="10-digit mobile (e.g. 9842103456)"
                  maxLength={13}
                  className={`form-control ${errors.mobile && touched.mobile ? 'input-error' : ''}`}
                  value={form.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  onBlur={() => handleBlur('mobile')}
                  style={{
                    borderColor: (errors.mobile && touched.mobile) ? '#ef4444' : undefined,
                    background: (errors.mobile && touched.mobile) ? 'rgba(239, 68, 68, 0.05)' : undefined
                  }}
                />
                {errors.mobile && touched.mobile && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} /> {errors.mobile}
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Email (Optional) */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email Address (Optional)</label>
              <input
                type="email"
                placeholder="your.email@gmail.com (for tax invoice & receipt)"
                className="form-control"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                style={{
                  borderColor: (errors.email && touched.email) ? '#ef4444' : undefined
                }}
              />
              {errors.email && touched.email && (
                <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.email}
                </div>
              )}
            </div>

            {/* Row 3: Material, Quantity in Ton, and Unit (Ton ONLY) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Material <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  className="form-control"
                  value={form.material}
                  onChange={(e) => {
                    const selectedName = e.target.value;
                    handleChange('material', selectedName);
                    handleChange('unit', 'Ton');
                  }}
                  onBlur={() => handleBlur('material')}
                >
                  {availableMaterials.map((m) => (
                    <option key={m.id || m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {errors.material && touched.material && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    {errors.material}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">
                  Quantity (Tons) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  placeholder="e.g. 3"
                  className={`form-control ${errors.quantity && touched.quantity ? 'input-error' : ''}`}
                  value={form.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  onBlur={() => handleBlur('quantity')}
                  style={{
                    borderColor: (errors.quantity && touched.quantity) ? '#ef4444' : undefined,
                    fontWeight: 700
                  }}
                />
                {errors.quantity && touched.quantity && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem' }}>
                    {errors.quantity}
                  </div>
                )}
              </div>

              {/* UNIT FIELD: RESTRICTED TO TON ONLY */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Unit</label>
                <select
                  className="form-control"
                  value="Ton"
                  onChange={() => handleChange('unit', 'Ton')}
                  style={{
                    fontWeight: 700,
                    color: '#38bdf8',
                    background: 'rgba(15, 23, 42, 0.95)'
                  }}
                >
                  <option value="Ton">Ton</option>
                </select>
              </div>
            </div>

            {/* Quick Ton Quantity Select Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '1.1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>Quick Tons:</span>
              {[1, 2, 3, 5, 10, 20].map(qty => (
                <button
                  key={qty}
                  type="button"
                  onClick={() => handleChange('quantity', qty.toString())}
                  style={{
                    padding: '0.2rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: form.quantity === qty.toString() ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                    background: form.quantity === qty.toString() ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    color: form.quantity === qty.toString() ? '#38bdf8' : '#cbd5e1',
                    transition: 'all 0.2s'
                  }}
                >
                  {qty} Ton{qty > 1 ? 's' : ''}
                </button>
              ))}
            </div>

            {/* LIVE ORIGINAL PRICE & ESTIMATE CARD (PER TON) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '12px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1.25rem',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Coins size={16} color="#fbbf24" />
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>
                    Original Depot Rate (Per Ton):
                  </span>
                </div>
                <div style={{
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  color: '#fbbf24',
                  background: 'rgba(245, 158, 11, 0.15)',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  ₹{unitPricePerTon.toLocaleString('en-IN')} <span style={{ fontSize: '0.72rem', color: '#fde68a', fontWeight: 600 }}>/ Ton</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.45rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                    {numQuantity} Ton(s) × ₹{unitPricePerTon.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 600 }}>
                    ✓ Computerized Weighbridge Slip Included
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Est. Material Subtotal
                  </div>
                  <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#38bdf8' }}>
                    ₹{estimatedSubtotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 4: PREFERRED DATE & TIME SLOT (FUTURE / TODAY ONLY) */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={15} color="#38bdf8" />
                  <span>Choose Delivery Date <span style={{ color: '#ef4444' }}>*</span></span>
                  <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>(Today or Upcoming Days Only)</span>
                </label>

                {/* Quick Date Shortcuts */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    type="button"
                    onClick={() => handleChange('preferred_date', todayDateString)}
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '5px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: form.preferred_date === todayDateString ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background: form.preferred_date === todayDateString ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)',
                      color: form.preferred_date === todayDateString ? '#38bdf8' : '#94a3b8'
                    }}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('preferred_date', tomorrowDateString)}
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '5px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: form.preferred_date === tomorrowDateString ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background: form.preferred_date === tomorrowDateString ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)',
                      color: form.preferred_date === tomorrowDateString ? '#38bdf8' : '#94a3b8'
                    }}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange('preferred_date', dayAfterDateString)}
                    style={{
                      padding: '0.15rem 0.5rem',
                      borderRadius: '5px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: form.preferred_date === dayAfterDateString ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)',
                      background: form.preferred_date === dayAfterDateString ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.04)',
                      color: form.preferred_date === dayAfterDateString ? '#38bdf8' : '#94a3b8'
                    }}
                  >
                    Day After
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <div>
                  <input
                    type="date"
                    min={todayDateString}
                    className={`form-control ${errors.preferred_date && touched.preferred_date ? 'input-error' : ''}`}
                    value={form.preferred_date}
                    onChange={(e) => handleChange('preferred_date', e.target.value)}
                    onBlur={() => handleBlur('preferred_date')}
                    style={{
                      borderColor: (errors.preferred_date && touched.preferred_date) ? '#ef4444' : undefined,
                      fontWeight: 700,
                      colorScheme: 'dark'
                    }}
                  />
                  {errors.preferred_date && touched.preferred_date && (
                    <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlertCircle size={13} /> {errors.preferred_date}
                    </div>
                  )}
                </div>

                <div>
                  <select
                    className="form-control"
                    value={form.preferred_time_slot}
                    onChange={(e) => handleChange('preferred_time_slot', e.target.value)}
                  >
                    <option value="Morning (7:00 AM - 11:00 AM)">Morning (7:00 AM - 11:00 AM)</option>
                    <option value="Midday (11:00 AM - 3:00 PM)">Midday (11:00 AM - 3:00 PM)</option>
                    <option value="Afternoon / Evening (3:00 PM - 7:00 PM)">Evening (3:00 PM - 7:00 PM)</option>
                    <option value="First Dispatch (Immediate)">Immediate First Dispatch</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 5: Customer Address Field */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Exact Site Delivery Address in Puducherry <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Area / Landmark required</span>
              </div>
              <textarea
                rows="2"
                placeholder="Plot no / Door no, Street name, Landmark, Village or Area (e.g. Kalathumettu St, Thilaspettai / Lawspet / Villianur)"
                className={`form-control ${errors.address && touched.address ? 'input-error' : ''}`}
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
                onBlur={() => handleBlur('address')}
                style={{
                  borderColor: (errors.address && touched.address) ? '#ef4444' : undefined,
                  resize: 'vertical'
                }}
              />
              {errors.address && touched.address && (
                <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.address}
                </div>
              )}
            </div>

            {/* Row 6: Location Link Option with GPS Detector */}
            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={15} color="#38bdf8" />
                  <span>Site Location Link (Google Maps Pin)</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>(Optional)</span>
                </label>

                {/* GPS Current Location Button */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingGps}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    background: gpsSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(37, 99, 235, 0.2)',
                    color: gpsSuccess ? '#34d399' : '#38bdf8',
                    transition: 'all 0.2s'
                  }}
                  title="Detect and fill current GPS location"
                >
                  <Navigation size={13} />
                  <span>{detectingGps ? 'Locating...' : gpsSuccess ? '✓ GPS Captured' : '📍 Use Current GPS Location'}</span>
                </button>
              </div>

              <input
                type="url"
                placeholder="Paste Google Maps link (e.g. https://maps.app.goo.gl/... or google.com/maps?q=...)"
                className={`form-control ${errors.location_link && touched.location_link ? 'input-error' : ''}`}
                value={form.location_link}
                onChange={(e) => {
                  handleChange('location_link', e.target.value);
                  setGpsSuccess(false);
                }}
                onBlur={() => handleBlur('location_link')}
                style={{
                  borderColor: (errors.location_link && touched.location_link) ? '#ef4444' : undefined,
                  fontSize: '0.84rem'
                }}
              />
              
              {/* Preview Link if URL is valid */}
              {form.location_link && /^https?:\/\//i.test(form.location_link.trim()) && (
                <div style={{ marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.74rem', color: '#10b981', fontWeight: 600 }}>✓ Valid Maps URL</span>
                  <a
                    href={form.location_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: '0.74rem', color: '#38bdf8', textDecoration: 'none', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                  >
                    <span>Test Pin on Maps</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              )}

              {errors.location_link && touched.location_link && (
                <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.location_link}
                </div>
              )}
            </div>

            {/* Row 7: Vehicle Preference */}
            <div className="form-group" style={{ marginBottom: '1.4rem' }}>
              <label className="form-label">Vehicle Preference for Puducherry Access</label>
              <select
                className="form-control"
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              >
                <option value="">Any suitable vehicle (Depot Supervisor will choose)</option>
                <option value="Tractor (Narrow Street / 1-3 Tons)">Tractor (Narrow Street / 1-3 Tons)</option>
                <option value="Mini Tipper Truck (Town / 3-5 Tons)">Mini Tipper Truck (Town / 3-5 Tons)</option>
                <option value="Heavy Tipper Lorry (Bulk Haulage / 10-25 Tons)">Heavy Tipper Lorry (Bulk Haulage / 10-25 Tons)</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-shimmer"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                fontWeight: 800,
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.4)'
              }}
            >
              <Truck size={18} />
              <span>{loading ? 'Processing Dispatch...' : `Confirm Delivery Booking • ₹${estimatedSubtotal.toLocaleString('en-IN')}`}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.74rem', color: '#94a3b8' }}>
              ✓ Computerized Weighbridge slip reading • Exact Tonnage Guaranteed
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
