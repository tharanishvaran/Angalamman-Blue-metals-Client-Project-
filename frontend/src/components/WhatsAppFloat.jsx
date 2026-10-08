import React from 'react';
import { Phone, MessageSquare, FileText } from 'lucide-react';

export default function WhatsAppFloat({ settings, onOpenQuote }) {
  const whatsappNumber = settings.whatsapp_number || '9944076675';
  const primaryPhone = settings.phone_primary || '9944076675';
  const message = 'Hello Sri Angalamman Blue Metals, I would like to know the price and availability of construction materials.';
  const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
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
