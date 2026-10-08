import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  X, 
  Coins, 
  MapPin, 
  Navigation, 
  AlertCircle, 
  ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { DEFAULT_MATERIALS } from '../defaultData';

export default function QuoteModal({ 
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

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    material: initialMaterial || 'M-Sand (Manufactured Sand)',
    quantity: '1',
    unit: 'Load',
    location: '',
    location_link: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [submittedQuote, setSubmittedQuote] = useState(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        mobile: user.mobile || prev.mobile,
        email: user.email || prev.email,
        location: user.address || prev.location
      }));
    }
  }, [user]);

  useEffect(() => {
    if (initialMaterial) {
      const match = availableMaterials.find(m => 
        m.name.toLowerCase().includes(initialMaterial.toLowerCase()) ||
        initialMaterial.toLowerCase().includes(m.name.toLowerCase())
      );
      setForm((prev) => ({ 
        ...prev, 
        material: match ? match.name : initialMaterial,
        unit: match ? (match.unit || 'Load') : prev.unit
      }));
    }
  }, [initialMaterial, availableMaterials]);

  const activeMaterialObj = useMemo(() => {
    return availableMaterials.find(m => 
      m.name === form.material ||
      m.name.toLowerCase().includes(form.material.toLowerCase()) ||
      form.material.toLowerCase().includes(m.name.toLowerCase())
    ) || availableMaterials[0] || { price: 4800, unit: 'Load' };
  }, [form.material, availableMaterials]);

  const unitPrice = activeMaterialObj ? activeMaterialObj.price : 4800;
  const numQuantity = Math.max(0, parseFloat(form.quantity) || 0);
  const estimatedSubtotal = Math.round(unitPrice * numQuantity);

  const validateField = (fieldName, value) => {
    switch (fieldName) {
      case 'name':
        if (!value || !value.trim()) return 'Full Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        if (!/^[a-zA-Z\s\.]+$/.test(value.trim())) return 'Name should contain letters only';
        return '';

      case 'mobile':
        if (!value || !value.trim()) return 'Mobile number is required';
        const cleanMobile = value.replace(/[\s\-\+]/g, '').replace(/^91/, '');
        if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
          return 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210)';
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
        if (!value || isNaN(value)) return 'Quantity is required';
        const q = parseFloat(value);
        if (q <= 0) return 'Quantity must be greater than 0';
        return '';

      case 'location':
        if (!value || !value.trim()) return 'Site delivery location is required';
        if (value.trim().length < 8) return 'Please specify full site location with landmark/area';
        return '';

      case 'location_link':
        if (value && value.trim()) {
          if (!/^https?:\/\//i.test(value.trim())) {
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
    const fieldsToValidate = ['name', 'mobile', 'email', 'material', 'quantity', 'location', 'location_link'];
    
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
        alert('Could not capture location automatically. Please paste Google Maps link manually.');
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
      location: true,
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

      const fullLocation = form.location_link 
        ? `${form.location.trim()}\n📍 Maps: ${form.location_link.trim()}`
        : form.location.trim();

      const combinedMessage = [
        form.message ? `Notes: ${form.message}` : null,
        `Original Rate: ₹${unitPrice.toLocaleString('en-IN')}/${form.unit}`,
        `Est. Material Total: ₹${estimatedSubtotal.toLocaleString('en-IN')}`,
        form.location_link ? `Maps Link: ${form.location_link}` : null
      ].filter(Boolean).join(' | ');

      const res = await api.submitQuote({
        customer_name: form.name.trim(),
        customer_mobile: cleanMobile,
        customer_email: form.email ? form.email.trim() : '',
        material_name: form.material,
        quantity: numQuantity,
        unit: form.unit,
        delivery_location: fullLocation,
        message: combinedMessage
      });

      setSubmittedQuote({
        ...res.quote,
        original_price: unitPrice,
        estimated_total: estimatedSubtotal,
        location_link: form.location_link
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      alert(err.message || 'Failed to submit quote request');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedQuote(null);
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
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ padding: '0.45rem', borderRadius: '10px', background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
              <FileText size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 800, margin: 0 }}>Request Official Quotation</h3>
              <div style={{ fontSize: '0.74rem', color: '#fb923c', fontWeight: 700, letterSpacing: '0.04em' }}>TRANSPARENT DIRECT DEPOT RATES</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Status Badge */}
        {user ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
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
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
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
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{user.name}</span>
                <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>Google Verified</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email} {user.mobile ? `• +91 ${user.mobile}` : ''}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#fed7aa' }}>
              🔒 Sign in with Google to download official GST quotation PDFs
            </div>
            {onRequireLogin && (
              <button
                type="button"
                onClick={onRequireLogin}
                className="btn btn-outline btn-sm"
                style={{ background: '#fff', color: '#1e293b', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Sign in
              </button>
            )}
          </div>
        )}

        {submittedQuote ? (
          <div style={{ textAlign: 'center', padding: '1.2rem 0' }}>
            <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.3rem', fontWeight: 800 }}>
              Quotation Request Received!
            </h4>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.25rem',
              margin: '1.25rem 0',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Quotation Ref:</span>
                <strong style={{ color: '#fb923c' }}>{submittedQuote.request_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Customer:</span>
                <span style={{ color: '#fff' }}>{submittedQuote.customer_name} ({submittedQuote.customer_mobile})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Material & Quantity:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{submittedQuote.quantity} {submittedQuote.unit} of {submittedQuote.material_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Original Rate:</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹{submittedQuote.original_price?.toLocaleString('en-IN')} / {submittedQuote.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Est. Material Subtotal:</span>
                <strong style={{ color: '#38bdf8' }}>₹{submittedQuote.estimated_total?.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Site Location:</span>
                <div style={{ color: '#fff', marginTop: '0.2rem' }}>{submittedQuote.delivery_location}</div>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Our Puducherry dispatch supervisor will contact you within 15-30 minutes with the finalized rate including direct site transportation.
            </p>

            <button onClick={handleReset} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            
            {/* Error Banner */}
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
                <span>Please correct the highlighted fields before submitting.</span>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  style={{
                    borderColor: (errors.name && touched.name) ? '#ef4444' : undefined
                  }}
                />
                {errors.name && touched.name && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} /> {errors.name}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mobile Number <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="tel"
                  placeholder="10-digit Indian Mobile"
                  maxLength={13}
                  className="form-control"
                  value={form.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  onBlur={() => handleBlur('mobile')}
                  style={{
                    borderColor: (errors.mobile && touched.mobile) ? '#ef4444' : undefined
                  }}
                />
                {errors.mobile && touched.mobile && (
                  <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <AlertCircle size={13} /> {errors.mobile}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                className="form-control"
                placeholder="For PDF quote copy"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Material <span style={{ color: '#ef4444' }}>*</span></label>
                <select
                  className="form-control"
                  value={form.material}
                  onChange={(e) => {
                    const sel = e.target.value;
                    const matched = availableMaterials.find(m => m.name === sel);
                    handleChange('material', sel);
                    if (matched && matched.unit) handleChange('unit', matched.unit);
                  }}
                  onBlur={() => handleBlur('material')}
                >
                  {availableMaterials.map((m) => (
                    <option key={m.id || m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quantity <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  type="number"
                  min="0.5"
                  step="any"
                  className="form-control"
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

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Unit</label>
                <select
                  className="form-control"
                  value={form.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                >
                  <option value="Load">Load</option>
                  <option value="Unit">Unit</option>
                  <option value="Ton">Ton</option>
                  <option value="Pieces">Pieces</option>
                  <option value="Cubic Feet">Cu. Ft</option>
                </select>
              </div>
            </div>

            {/* Price Details Summary Card */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: '12px',
              padding: '0.85rem 1.1rem',
              marginBottom: '1.25rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Coins size={16} color="#fbbf24" />
                  <span style={{ fontSize: '0.82rem', color: '#cbd5e1', fontWeight: 700 }}>Original Depot Price:</span>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fbbf24' }}>
                  ₹{unitPrice.toLocaleString('en-IN')} / {form.unit}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', marginTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  {numQuantity} {form.unit}(s) estimated
                </span>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#38bdf8' }}>
                  Subtotal: ₹{estimatedSubtotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Site Location Field */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label">
                Site Delivery Location (Puducherry) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Near Thilaspettai Bus Stop / Lawspet 5th Cross"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                onBlur={() => handleBlur('location')}
                style={{
                  borderColor: (errors.location && touched.location) ? '#ef4444' : undefined
                }}
              />
              {errors.location && touched.location && (
                <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.location}
                </div>
              )}
            </div>

            {/* Location Link with GPS */}
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} color="#fb923c" />
                  <span>Google Maps Location Link</span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingGps}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid rgba(249, 115, 22, 0.4)',
                    background: gpsSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(249, 115, 22, 0.15)',
                    color: gpsSuccess ? '#34d399' : '#fb923c'
                  }}
                >
                  <Navigation size={12} />
                  <span>{detectingGps ? 'Locating...' : gpsSuccess ? '✓ GPS Captured' : '📍 Use Current GPS'}</span>
                </button>
              </div>

              <input
                type="url"
                placeholder="https://maps.app.goo.gl/... or coordinates"
                className="form-control"
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
              {errors.location_link && touched.location_link && (
                <div style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <AlertCircle size={13} /> {errors.location_link}
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Special Notes / Site Unloading Restrictions</label>
              <textarea
                rows="2"
                className="form-control"
                placeholder="Narrow lane, overhead electric lines, tractor needed, etc."
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-orange btn-shimmer"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 800, justifyContent: 'center' }}
            >
              {loading ? 'Submitting Request...' : `Submit Quote Request • ₹${estimatedSubtotal.toLocaleString('en-IN')}`}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
