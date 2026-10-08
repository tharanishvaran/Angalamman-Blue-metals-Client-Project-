import React, { useState } from 'react';
import { Star, MessageSquarePlus, User, CheckCircle2 } from 'lucide-react';
import { api } from '../api';
import AnimatedSection from './AnimatedSection';

export default function ReviewsSection({ reviews = [], onReviewSubmitted, user }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(user ? user.name : '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !comment) return;

    try {
      setSubmitting(true);
      await api.submitReview({
        customer_name: name,
        rating,
        comment
      });
      setSubmittedMessage('Thank you! Your feedback has been submitted for admin approval.');
      setComment('');
      setTimeout(() => {
        setSubmittedMessage('');
        setShowModal(false);
        if (onReviewSubmitted) onReviewSubmitted();
      }, 2000);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="section-padding" style={{ position: 'relative' }}>
      <div className="container">
        
        {/* Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <Star size={16} />
            <span>Customer Testimonials</span>
          </div>
          <h2 className="section-title">
            What Puducherry Builders <span className="gradient-text">Say About Us</span>
          </h2>
          <p className="section-desc">
            Genuine experiences from engineers, site contractors, and independent house owners across Puducherry.
          </p>
          
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-outline btn-sm btn-shimmer"
            style={{ borderColor: 'rgba(255, 255, 255, 0.25)', padding: '0.65rem 1.4rem' }}
          >
            <MessageSquarePlus size={16} />
            <span>Share Your Review</span>
          </button>
        </AnimatedSection>

        {/* Reviews Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
          gap: '2rem'
        }}>
          {reviews.map((rev, idx) => (
            <AnimatedSection
              key={rev.id}
              animation="fade-up"
              delay={`${Math.min(idx * 0.08, 0.4)}s`}
              className="glass-card hover-lift"
              style={{
                padding: '2.2rem 2rem',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div>
                {/* Stars */}
                <div style={{ display: 'flex', gap: '5px', marginBottom: '1.25rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < rev.rating ? '#f59e0b' : 'none'}
                      color={i < rev.rating ? '#f59e0b' : '#475569'}
                    />
                  ))}
                </div>

                <p style={{
                  fontSize: '0.96rem',
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                  fontStyle: 'italic',
                  marginBottom: '1.75rem'
                }}>
                  "{rev.comment}"
                </p>
              </div>

              {/* Author */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                paddingTop: '1.2rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)'
                }}>
                  {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.96rem', color: '#fff' }}>
                    {rev.customer_name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <CheckCircle2 size={13} /> Verified Material Customer
                  </div>
                </div>
              </div>

            </AnimatedSection>
          ))}
        </div>

      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 700 }}>Submit Customer Feedback</h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.6rem', cursor: 'pointer', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {submittedMessage ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={48} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.5rem' }}>Review Submitted!</h4>
                <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>{submittedMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name & Role (e.g., Civil Contractor / Home Owner)</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. S. Murugan (Site Engineer, Lawspet)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                      >
                        <Star
                          size={28}
                          fill={star <= rating ? '#f59e0b' : 'none'}
                          color={star <= rating ? '#f59e0b' : '#64748b'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Experience / Feedback</label>
                  <textarea
                    required
                    className="form-control"
                    placeholder="Tell us about the blue metal or sand quality, delivery timeliness, and vehicle service..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary btn-shimmer"
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
}
