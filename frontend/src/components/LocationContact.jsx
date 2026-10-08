import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  ExternalLink, 
  MessageSquare, 
  CheckCircle2 
} from 'lucide-react';
import { api } from '../api';
import AnimatedSection from './AnimatedSection';

export default function LocationContact({ settings, onOpenQuote }) {
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    material: 'M-Sand',
    quantity: '1',
    location: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const primaryPhone = settings.phone_primary || '9944076675';
  const secondaryPhone = settings.phone_secondary || '9345009337';
  const additionalPhone = settings.phone_additional || '9629657833';
  const whatsappNumber = settings.whatsapp_number || '9944076675';
  const mapsUrl = settings.maps_url || 'https://maps.app.goo.gl/Z4SS6rkY7Vknzc3SA';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.submitQuote({
        customer_name: form.name,
        customer_mobile: form.mobile,
        material_name: form.material,
        quantity: parseFloat(form.quantity) || 1,
        unit: 'Load',
        delivery_location: form.location,
        message: form.message
      });
      setSubmitted(true);
      setForm({ name: '', mobile: '', material: 'M-Sand', quantity: '1', location: '', message: '' });
    } catch (err) {
      alert(err.message || 'Submission error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding" style={{ background: 'rgba(8, 16, 34, 0.65)', position: 'relative' }}>
      <div className="container">
        
        {/* Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <MapPin size={16} />
            <span>Puducherry Yard Location & Hotline</span>
          </div>
          <h2 className="section-title">
            Visit Our Yard or <span className="gradient-text">Contact Our Dispatch</span>
          </h2>
          <p className="section-desc">
            Directly located in Thilaspettai, Puducherry. Connect with our materials supervisor for instant availability and dispatch schedule.
          </p>
        </AnimatedSection>

        {/* Content Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: '2.5rem'
        }}>
          
          {/* Left Column: Business Details & Map */}
          <AnimatedSection animation="slide-left">
            <div className="glass-card hover-lift" style={{ padding: '2.2rem', borderRadius: '22px', marginBottom: '1.75rem', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: '1.35rem', fontWeight: 800 }}>
                {settings.business_name || 'Sri Angalamman Blue Metals'}
              </h3>

              {/* Address */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.35rem' }}>
                <div style={{ padding: '0.55rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.22)', color: '#60a5fa', height: 'fit-content', border: '1px solid rgba(37,99,235,0.3)' }}>
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#cbd5e1' }}>Yard Address</div>
                  <a 
                    href={mapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ fontSize: '0.96rem', color: '#fff', lineHeight: 1.5, marginTop: '2px', display: 'inline-block', textDecoration: 'none' }}
                    onMouseEnter={(e) => (e.target.style.color = '#38bdf8')}
                    onMouseLeave={(e) => (e.target.style.color = '#fff')}
                  >
                    {settings.address || 'Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry, India'} 📍
                  </a>
                </div>
              </div>

              {/* Phones */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.35rem' }}>
                <div style={{ padding: '0.55rem', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.22)', color: '#fb923c', height: 'fit-content', border: '1px solid rgba(249,115,22,0.3)' }}>
                  <Phone size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#cbd5e1' }}>Direct Hotline Numbers</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.35rem' }}>
                    <a href={`tel:${primaryPhone}`} style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
                      {primaryPhone} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(Primary)</span>
                    </a>
                    <span style={{ color: '#475569' }}>•</span>
                    <a href={`tel:${secondaryPhone}`} style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
                      {secondaryPhone}
                    </a>
                    <span style={{ color: '#475569' }}>•</span>
                    <a href={`tel:${additionalPhone}`} style={{ color: '#38bdf8', fontWeight: 700, textDecoration: 'none' }}>
                      {additionalPhone}
                    </a>
                  </div>
                </div>
              </div>

              {/* Operating Hours */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.6rem' }}>
                <div style={{ padding: '0.55rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.22)', color: '#34d399', height: 'fit-content', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#cbd5e1' }}>Working Hours</div>
                  <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '2px' }}>
                    {settings.operating_hours || 'Mon - Sat: 6:00 AM - 8:00 PM | Sun: 7:00 AM - 1:00 PM'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                <a
                  href={`tel:${primaryPhone}`}
                  className="btn btn-primary btn-sm btn-shimmer"
                  style={{ flex: 1 }}
                >
                  <Phone size={14} /> Call Primary
                </a>
                <a
                  href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent('Hello Sri Angalamman Blue Metals, I would like to know the price and availability of construction materials.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success btn-sm"
                  style={{ flex: 1 }}
                >
                  <MessageSquare size={14} /> WhatsApp
                </a>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1 }}
                >
                  <ExternalLink size={14} /> Directions
                </a>
              </div>
            </div>

            {/* Embedded Visual Map Preview */}
            <div 
              style={{
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                height: '220px',
                position: 'relative',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
              }}
            >
              <iframe
                title="Sri Angalamman Blue Metals Location"
                src="https://maps.google.com/maps?q=Sri+Angalamman+Blue+Metals+Pondy,11.9410733,79.7982839&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
              <div style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                background: 'rgba(7, 14, 27, 0.95)',
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.6)'
              }} className="hover-lift">
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Open Shop in Google Maps ↗</span>
                </a>
              </div>
            </div>
          </AnimatedSection>

          {/* Right Column: Instant Message / Inquiry Form */}
          <AnimatedSection animation="slide-right" className="glass-card" style={{ padding: '2.5rem', borderRadius: '22px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h3 style={{ fontSize: '1.45rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 800 }}>
              Instant Site Delivery Inquiry
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.75rem', lineHeight: 1.55 }}>
              Need an immediate quote or bulk dispatch confirmation? Send your requirements directly to our yard supervisor.
            </p>

            {submitted ? (
              <div style={{
                padding: '2.2rem 1.5rem',
                textAlign: 'center',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '16px'
              }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.5rem', fontWeight: 700 }}>Inquiry Received!</h4>
                <p style={{ color: '#cbd5e1', fontSize: '0.92rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Thank you! Our supervisor will contact you at your mobile number with load rates and delivery schedule.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="btn btn-outline btn-sm"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh"
                      className="form-control"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile"
                      className="form-control"
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Material Required</label>
                    <select
                      className="form-control"
                      value={form.material}
                      onChange={(e) => setForm({ ...form, material: e.target.value })}
                    >
                      <option value="M-Sand">M-Sand</option>
                      <option value="P-Sand">P-Sand</option>
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
                    <label className="form-label">Quantity (Loads)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      className="form-control"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Site Delivery Location (Puducherry) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Villianur Main Road / Lawspet 4th Cross"
                    className="form-control"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Notes or Vehicle Preference (Optional)</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Need narrow street tractor trolley delivery tomorrow 7 AM"
                    className="form-control"
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-orange btn-shimmer"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  <Send size={16} />
                  <span>{loading ? 'Submitting...' : 'Send Site Delivery Inquiry'}</span>
                </button>
              </form>
            )}
          </AnimatedSection>

        </div>

      </div>
    </section>
  );
}
