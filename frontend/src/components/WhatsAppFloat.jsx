import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, FileText, ArrowUp } from 'lucide-react';

export default function WhatsAppFloat({ settings, onOpenQuote }) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScrollTop(window.scrollY > 350);
    };
    window.addEventListener('scroll', checkScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const whatsappNumber = settings.whatsapp_number || '9944076675';
  const primaryPhone = settings.phone_primary || '9944076675';
  const message = 'Hello Sri Angalamman Blue Metals, I would like to know the price and availability of construction materials.';
  const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {/* Smooth Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          title="Scroll smoothly to top"
          aria-label="Scroll to top"
          style={{
            position: 'fixed',
            bottom: '6.8rem',
            right: '2.3rem',
            zIndex: 899,
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(10, 18, 38, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(56, 189, 248, 0.25)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s, box-shadow 0.25s',
            animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="hover-lift"
        >
          <ArrowUp size={20} />
        </button>
      )}
      {/* Floating WhatsApp Bubble with Notification Badge */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp"
        title="Chat on WhatsApp with Dispatch"
        aria-label="WhatsApp Dispatch"
      >
        <span 
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '0.7rem',
            fontWeight: 800,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            border: '2px solid #03070f'
          }}
        >
          1
        </span>

        <svg
          viewBox="0 0 24 24"
          width="32"
          height="32"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      </a>

      {/* Mobile Sticky Quick Action Bar */}
      <div className="mobile-bottom-bar">
        <a
          href={`tel:${primaryPhone}`}
          className="btn btn-outline btn-sm"
          style={{ background: 'rgba(37, 99, 235, 0.25)', borderColor: 'rgba(37, 99, 235, 0.5)', color: '#93c5fd' }}
        >
          <Phone size={14} /> Call Now
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success btn-sm btn-shimmer"
          style={{ background: '#25d366', color: '#fff' }}
        >
          <MessageSquare size={14} /> WhatsApp
        </a>

        <button
          onClick={onOpenQuote}
          className="btn btn-orange btn-sm btn-shimmer"
        >
          <FileText size={14} /> Get Quote
        </button>
      </div>
    </>
  );
}
