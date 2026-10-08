import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle2, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api';

export default function QuoteModal({ isOpen, onClose, initialMaterial = '', user, onRequireLogin }) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    material: initialMaterial || 'M-Sand',
    quantity: '1',
    unit: 'Load',
    location: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
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
      setForm((prev) => ({ ...prev, material: initialMaterial }));
    }
  }, [initialMaterial]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user && onRequireLogin) {
      onRequireLogin();
      return;
    }
    try {
      setLoading(true);
      const res = await api.submitQuote({
        customer_name: form.name,
        customer_mobile: form.mobile,
        customer_email: form.email,
        material_name: form.material,
        quantity: parseFloat(form.quantity) || 1,
        unit: form.unit,
        delivery_location: form.location,
        message: form.message
      });

      setSubmittedQuote(res.quote);
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
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(249, 115, 22, 0.2)', color: '#fb923c' }}>
              <FileText size={20} />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>Request Official Quotation</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Status / Google Auth Badge */}
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
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '0.82rem', color: '#93c5fd' }}>
              🔒 Sign in with Google to pre-fill details & track your quote
            </div>
            {onRequireLogin && (
              <button
                type="button"
                onClick={onRequireLogin}
                className="btn btn-outline btn-sm"
                style={{ background: '#fff', color: '#1e293b', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
              >
                Sign in with Google
              </button>
            )}
          </div>
        )}

        {submittedQuote ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={54} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
              Quotation Request Registered!
            </h4>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem',
              margin: '1.5rem 0',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Quotation Reference ID:</span>
                <strong style={{ color: '#38bdf8' }}>{submittedQuote.request_number}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Customer:</span>
                <span style={{ color: '#fff' }}>{submittedQuote.customer_name} ({submittedQuote.customer_mobile})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Requested Material:</span>
                <span style={{ color: '#fff' }}>{submittedQuote.quantity} {submittedQuote.unit} of {submittedQuote.material_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Site Location:</span>
                <span style={{ color: '#fff' }}>{submittedQuote.delivery_location}</span>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Our Puducherry dispatch supervisor will call you within 15-30 minutes with our best rate including transportation.
            </p>

            <button onClick={handleReset} className="btn btn-primary" style={{ width: '100%' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  className="form-control"
                  placeholder="10-digit Indian Mobile"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                className="form-control"
                placeholder="For PDF quote copy"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">Material *</label>
                <select
                  className="form-control"
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                >
                  <option value="M-Sand">M-Sand (Manufactured)</option>
                  <option value="P-Sand">P-Sand (Plastering)</option>
                  <option value="River Sand">River Sand</option>
                  <option value="Sengal (Red Bricks)">Sengal (Red Bricks)</option>
                  <option value="1/4 Stone (6mm)">1/4 Stone (6mm)</option>
                  <option value="1/2 Stone (12mm)">1/2 Stone (12mm)</option>
                  <option value="3/4 Stone (20mm)">3/4 Stone (20mm)</option>
                  <option value="1 1/2 Stone (40mm)">1 1/2 Stone (40mm)</option>
                  <option value="Gravel / Kraval">Gravel / Kraval</option>
                  <option value="Crusher Powder">Crusher Powder</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  className="form-control"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit</label>
                <select
                  className="form-control"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                >
                  <option value="Load">Load</option>
                  <option value="Unit">Unit</option>
                  <option value="Ton">Ton</option>
                  <option value="Cubic Feet">Cu. Ft</option>
                  <option value="Pieces">Pieces</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Site Delivery Location (Puducherry) *</label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="e.g. Near Thilaspettai Bus Stop / Lawspet"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Message / Vehicle Requirement</label>
              <textarea
                rows="2"
                className="form-control"
                placeholder="Any special unloading requirements or narrow lane restrictions..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-orange"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Submitting...' : 'Submit Quotation Request'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
