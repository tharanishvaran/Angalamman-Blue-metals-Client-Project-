import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  X, 
  Coins, 
  MapPin, 
  Navigation, 
  AlertCircle, 
  Download,
  Truck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';
import { DEFAULT_MATERIALS, DEFAULT_SETTINGS } from '../defaultData';
import { downloadQuotationPDF } from '../utils/quotationPdf';

export default function QuoteModal({ 
  isOpen, 
  onClose, 
  initialMaterial = '', 
  materials = [], 
  settings = DEFAULT_SETTINGS,
  user, 
  onRequireLogin 
}) {
  const availableMaterials = useMemo(() => {
    return (materials && materials.length > 0) ? materials : DEFAULT_MATERIALS;
  }, [materials]);

  const fleetVehicles = useMemo(() => [
    {
      id: 'tipper',
      name: 'Mini Tipper Truck (4-Wheeler)',
      type: 'Express Urban Delivery',
      capacity: '2 - 3 Units / 4.5 Tons',
      bestFor: 'Town areas, rapid drops, medium site loads'
    },
    {
      id: 'tractor',
      name: 'Hydraulic Tractor Trolley',
      type: 'Narrow Street & Residential',
      capacity: '1 - 2 Units / 3 Tons',
      bestFor: 'Thilaspettai colony streets, individual home builds'
    },
    {
      id: 'lorry',
      name: 'Multi-Axle Heavy Tipper Lorry',
      type: 'Bulk Commercial Supply',
      capacity: '5 - 10 Units / 16 - 25 Tons',
      bestFor: 'Major infrastructure, layouts, multi-storey RCC pours'
    },
    {
      id: 'self',
      name: 'Customer Self-Arranged Transport (Depot Yard Pickup)',
      type: 'Customer Arranged Haulage',
      capacity: 'Ex-Yard Pickup (Direct Loading)',
      bestFor: 'Direct customer collection from Thilaspettai depot'
    }
  ], []);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    material: initialMaterial || 'M-Sand (Manufactured Sand)',
    quantity: '1',
    unit: 'Unit',
    vehicle: 'Mini Tipper Truck (4-Wheeler)',
    location: '',
    location_link: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
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

  // Lock body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow || 'unset';
      };
    }
  }, [isOpen]);

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
    ) || availableMaterials[0] || { price: 4800, unit: 'Load', category: 'Aggregate' };
  }, [form.material, availableMaterials]);

  const activeVehicleObj = useMemo(() => {
    const sel = (form.vehicle || '').toLowerCase();
    return fleetVehicles.find(v => 
      v.name.toLowerCase() === sel ||
      v.id.toLowerCase() === sel ||
      sel.includes(v.id.toLowerCase())
    ) || fleetVehicles[0];
  }, [form.vehicle, fleetVehicles]);

  const unitPrice = activeMaterialObj ? activeMaterialObj.price : 4800;
  const numQuantity = Math.max(0, parseFloat(form.quantity) || 0);
  // Quotation total is purely based on material amount (no vehicle fee added)
  const quotationTotal = Math.round(unitPrice * numQuantity);

  const validateField = useCallback((fieldName, value) => {
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
          return 'Enter a valid 10-digit Indian mobile number';
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
        if (value.trim().length < 3) return 'Please specify site area / landmark';
        return '';

      default:
        return '';
    }
  }, []);

  const validateAll = useCallback(() => {
    const newErrors = {};
    const fieldsToValidate = ['name', 'mobile', 'email', 'material', 'quantity', 'location'];
    
    fieldsToValidate.forEach(field => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, validateField]);

  // Fast input handler without synchronous validation re-renders
  const handleChange = useCallback((field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  }, []);

  // Validation only triggers when leaving an input
  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const err = validateField(field, form[field]);
    setErrors(prev => ({ ...prev, [field]: err }));
  }, [form, validateField]);

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
      () => {
        setDetectingGps(false);
        alert('Could not capture location automatically. Please paste Google Maps link manually.');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Download PDF Action (No vehicle fees added)
  const handleDownloadPDF = async (isFromSuccess = false) => {
    if (!isFromSuccess) {
      setTouched({
        name: true,
        mobile: true,
        material: true,
        quantity: true,
        location: true
      });
      if (!validateAll()) {
        alert('Please fill in Customer Name, Mobile Number, and Site Location to generate your official PDF quotation.');
        return;
      }
    }

    try {
      setGeneratingPdf(true);

      const targetQuote = isFromSuccess && submittedQuote ? submittedQuote : {
        customer_name: form.name.trim() || 'Valued Customer',
        customer_mobile: form.mobile.replace(/[\s\-\+]/g, '').replace(/^91/, ''),
        customer_email: form.email ? form.email.trim() : '',
        material_name: form.material,
        material_category: activeMaterialObj.category || 'Aggregate',
        material_description: activeMaterialObj.description || '',
        quantity: numQuantity,
        unit: form.unit,
        unit_price: unitPrice,
        vehicle_name: activeVehicleObj.name,
        vehicle_type: activeVehicleObj.type,
        vehicle_capacity: activeVehicleObj.capacity,
        vehicle_rate: 0, // No transport vehicle fees added in quotation
        delivery_location: form.location.trim() || 'Puducherry Site Dispatch',
        notes: form.message ? form.message.trim() : '',
        request_number: submittedQuote?.request_number || ''
      };

      await downloadQuotationPDF({
        ...targetQuote,
        business: settings
      });

      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Unable to generate quotation PDF: ' + (err.message || 'Unknown error'));
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({
      name: true,
      mobile: true,
      email: true,
      material: true,
      quantity: true,
      location: true
    });

    if (!validateAll()) return;

    try {
      setLoading(true);
      const cleanMobile = form.mobile.replace(/[\s\-\+]/g, '').replace(/^91/, '');

      const fullLocation = form.location_link 
        ? `${form.location.trim()}\n📍 Maps: ${form.location_link.trim()}`
        : form.location.trim();

      const combinedMessage = [
        `Preferred Vehicle: ${activeVehicleObj.name} (Capacity: ${activeVehicleObj.capacity})`,
        `Material Rate: ₹${unitPrice.toLocaleString('en-IN')}/${form.unit}`,
        `Quotation Total: ₹${quotationTotal.toLocaleString('en-IN')}`,
        form.message ? `Notes: ${form.message}` : null,
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
        material_name: form.material,
        material_category: activeMaterialObj.category || 'Aggregate',
        material_description: activeMaterialObj.description || '',
        original_price: unitPrice,
        material_subtotal: quotationTotal,
        vehicle_name: activeVehicleObj.name,
        vehicle_type: activeVehicleObj.type,
        vehicle_capacity: activeVehicleObj.capacity,
        vehicle_rate: 0,
        estimated_total: quotationTotal,
        location_link: form.location_link
      });

      confetti({
        particleCount: 75,
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

    // Smooth scroll back to materials
    setTimeout(() => {
      const targetElem = document.getElementById('materials');
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
          padding: '1.65rem 1.35rem'
        }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ 
              padding: '0.45rem', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25), rgba(249, 115, 22, 0.25))', 
              color: '#38bdf8', 
              border: '1px solid rgba(56, 189, 248, 0.35)' 
            }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 800, margin: 0 }}>Material Quotation & PDF</h3>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.04em' }}>
                DIRECT DEPOT RATES • DOWNLOADABLE OFFICIAL ESTIMATE
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* User Status Badge */}
        {user ? (
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '10px',
            padding: '0.6rem 0.85rem',
            marginBottom: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{user.name}</span>
                <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>Verified Customer</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.email} {user.mobile ? `• +91 ${user.mobile}` : ''}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            borderRadius: '10px',
            padding: '0.6rem 0.85rem',
            marginBottom: '1.15rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.78rem',
            color: '#bae6fd'
          }}>
            <Sparkles size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
            <span>Enter customer details below to generate and download an official quotation PDF immediately.</span>
          </div>
        )}

        {submittedQuote ? (
          <div style={{ textAlign: 'center', padding: '0.85rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.18)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.85rem auto'
            }}>
              <CheckCircle2 size={32} color="#10b981" />
            </div>

            <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.25rem', fontWeight: 800 }}>
              Quotation Request Received!
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.84rem', marginBottom: '1.15rem' }}>
              Your quotation reference has been registered at our Thilaspettai dispatch yard.
            </p>
            
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1.15rem',
              marginBottom: '1.25rem',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Quotation Ref:</span>
                <strong style={{ color: '#fb923c' }}>{submittedQuote.request_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Customer:</span>
                <span style={{ color: '#fff' }}>{submittedQuote.customer_name} ({submittedQuote.customer_mobile})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Material & Quantity:</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{submittedQuote.quantity} {submittedQuote.unit} of {submittedQuote.material_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Material Rate:</span>
                <span style={{ color: '#fbbf24', fontWeight: 700 }}>₹{submittedQuote.original_price?.toLocaleString('en-IN')} / {submittedQuote.unit}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.84rem' }}>Preferred Vehicle:</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>{submittedQuote.vehicle_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                <span style={{ color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 700 }}>Total Quotation Amount:</span>
                <strong style={{ color: '#38bdf8', fontSize: '1.15rem' }}>₹{submittedQuote.estimated_total?.toLocaleString('en-IN')}</strong>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '0.45rem', marginTop: '0.45rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Site Location:</span>
                <div style={{ color: '#fff', marginTop: '0.15rem', fontSize: '0.84rem' }}>{submittedQuote.delivery_location}</div>
              </div>
            </div>

            {/* DOWNLOAD PDF ON SUCCESS SCREEN */}
            <button
              type="button"
              onClick={() => handleDownloadPDF(true)}
              disabled={generatingPdf}
              className="btn btn-primary btn-shimmer"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.96rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.65rem',
                background: 'linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)',
                boxShadow: '0 8px 24px rgba(2, 132, 199, 0.4)'
              }}
            >
              <Download size={17} />
              <span>{generatingPdf ? 'Generating PDF...' : 'Download Official Quotation PDF'}</span>
            </button>

            <button onClick={handleReset} className="btn btn-outline" style={{ width: '100%', justifyContent: 'center' }}>
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
                padding: '0.65rem 0.9rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                color: '#fca5a5',
                fontSize: '0.8rem'
              }}>
                <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                <span>Please complete the required fields marked with an asterisk (*).</span>
              </div>
            )}

            {/* Customer Details Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem', marginBottom: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Customer Name <span style={{ color: '#ef4444' }}>*</span></label>
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
                  <div style={{ color: '#f87171', fontSize: '0.74rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {errors.name}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Contact Mobile <span style={{ color: '#ef4444' }}>*</span></label>
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
                  <div style={{ color: '#f87171', fontSize: '0.74rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <AlertCircle size={12} /> {errors.mobile}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                className="form-control"
                placeholder="For direct PDF quotation email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                style={{
                  borderColor: (errors.email && touched.email) ? '#ef4444' : undefined
                }}
              />
            </div>

            {/* Material & Quantity Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Chosen Material <span style={{ color: '#ef4444' }}>*</span></label>
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

            {/* PREFERRED VEHICLE (LOGISTICS ONLY - NO VEHICLE FEES ADDED) */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Truck size={14} color="#38bdf8" />
                  <span>Preferred Delivery Vehicle (Logistics)</span>
                </label>
                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>No transport fees added</span>
              </div>
              <select
                className="form-control"
                value={form.vehicle}
                onChange={(e) => handleChange('vehicle', e.target.value)}
                style={{ fontWeight: 600 }}
              >
                {fleetVehicles.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name} ({v.capacity})
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Type: {activeVehicleObj.type}</span>
                <span style={{ color: '#fb923c' }}>{activeVehicleObj.bestFor}</span>
              </div>
            </div>

            {/* TOTAL QUOTATION AMOUNT CARD (STRICTLY MATERIAL BASED - NO VEHICLE CHARGE) */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '0.85rem 1.05rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Coins size={14} color="#fbbf24" />
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Depot Rate:</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>
                  ₹{unitPrice.toLocaleString('en-IN')} / {form.unit}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div>
                  <span style={{ fontSize: '0.76rem', color: '#94a3b8', display: 'block' }}>Quotation Amount ({numQuantity} {form.unit}):</span>
                  <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600 }}>Weighbridge slip included</span>
                </div>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#38bdf8' }}>
                  ₹{quotationTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Site Location Field */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
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
                <div style={{ color: '#f87171', fontSize: '0.74rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={12} /> {errors.location}
                </div>
              )}
            </div>

            {/* Location Link with GPS */}
            <div className="form-group" style={{ marginBottom: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={13} color="#fb923c" />
                  <span>Google Maps Pin Link</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(Optional)</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingGps}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px solid rgba(249, 115, 22, 0.4)',
                    background: gpsSuccess ? 'rgba(16, 185, 129, 0.2)' : 'rgba(249, 115, 22, 0.15)',
                    color: gpsSuccess ? '#34d399' : '#fb923c'
                  }}
                >
                  <Navigation size={11} />
                  <span>{detectingGps ? 'Locating...' : gpsSuccess ? '✓ GPS' : '📍 Use GPS'}</span>
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
                style={{ fontSize: '0.82rem' }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.15rem' }}>
              <label className="form-label">Special Notes / Site Restrictions</label>
              <textarea
                rows="2"
                className="form-control"
                placeholder="Narrow lane, overhead electric lines, tractor needed, etc."
                value={form.message}
                onChange={(e) => handleChange('message', e.target.value)}
              />
            </div>

            {/* ACTION BUTTONS: DOWNLOAD PDF + SUBMIT REQUEST */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => handleDownloadPDF(false)}
                disabled={generatingPdf}
                className="btn btn-outline"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(2, 132, 199, 0.3))',
                  borderColor: 'rgba(56, 189, 248, 0.5)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  padding: '0.8rem 0.5rem',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
                title="Download attractive PDF quotation immediately"
              >
                <Download size={15} color="#38bdf8" />
                <span>{generatingPdf ? 'Generating...' : 'Download PDF Quote'}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-orange btn-shimmer"
                style={{
                  padding: '0.8rem 0.5rem',
                  fontSize: '0.86rem',
                  fontWeight: 800,
                  justifyContent: 'center',
                  borderRadius: '10px'
                }}
              >
                {loading ? 'Submitting...' : `Submit Request • ₹${quotationTotal.toLocaleString('en-IN')}`}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
