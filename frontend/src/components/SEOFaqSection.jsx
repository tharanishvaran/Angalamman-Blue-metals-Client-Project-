import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Phone } from 'lucide-react';
import AnimatedSection from './AnimatedSection';

const faqs = [
  {
    id: 'faq-1',
    question: 'What is the price of 20mm blue metal (3/4" stone) in Pondicherry?',
    answer: `The ex-yard price of 20mm blue metal aggregates (also called 3/4" jelly stone) starts at approximately ₹4,400 per load at our Thilaspettai depot. Transport charges to your construction site in Puducherry are calculated based on distance. We supply 20mm blue metal for columns, beams, roof slabs, and all structural RCC work. Call 9944076675 for today's rate and bulk order discounts.`
  },
  {
    id: 'faq-2',
    question: 'What is the price of M-Sand (manufactured sand) in Puducherry?',
    answer: `Our triple-washed M-Sand (Manufactured Sand) is priced at approximately ₹4,800 per load from our Thilaspettai yard, Puducherry. M-Sand has zero silt, uniform cubical grading, and passes IS 383 standards — ideal for structural concrete, columns, and foundation work. Delivery is available across all areas of Pondicherry. Contact us for bulk M-Sand pricing.`
  },
  {
    id: 'faq-3',
    question: 'What construction materials do you supply in Pondicherry?',
    answer: `Sri Angalamman Blue Metals supplies a complete range of construction materials in Puducherry:\n• M-Sand (Manufactured Sand) — for concrete and structural work\n• P-Sand (Plastering Sand) — for wall and ceiling plastering\n• River Sand (Aatrumanal) — for masonry and general construction\n• 6mm (1/4") Stone Chips — for asphalt and paver base\n• 12mm (1/2") Blue Metal — for lintels and precast work\n• 20mm (3/4") Blue Metal — standard structural aggregate\n• 40mm (1½") Blue Metal Ballast — for foundation PCC and road sub-base\n• Sengal (Red Clay Bricks) — kiln-fired, ~3,000 bricks per unit\n• Gravel / Kraval — for site filling and road compaction\n• Crusher Powder (Stone Dust) — for paving and block manufacturing`
  },
  {
    id: 'faq-4',
    question: 'Do you deliver blue metal and sand to construction sites in Pondicherry?',
    answer: `Yes! We offer direct site tipper delivery of all construction materials across Puducherry and nearby areas — including Villianur, Lawspet, Kalapet, Siruvanthandu, Ariyankuppam, Thilaspettai, Reddyarpalayam, and Ozhukarai. Our fleet includes hydraulic tractor trolleys (for narrow colony streets), mini tipper trucks (4-wheeler), and heavy multi-axle tipper lorries for bulk commercial orders.`
  },
  {
    id: 'faq-5',
    question: 'What is the price of P-Sand for plastering in Pondicherry?',
    answer: `P-Sand (Plastering Sand) is available at approximately ₹5,200 per load from our yard in Thilaspettai, Puducherry. Our P-Sand is super-fine micro-sieved, preventing wall shrinkage cracks and ensuring a perfectly smooth plaster finish for interior and exterior surfaces. It is the preferred choice by professional plasterers and civil engineers across Pondicherry.`
  },
  {
    id: 'faq-6',
    question: 'What is the price of 40mm blue metal (1½" ballast) in Puducherry?',
    answer: `40mm blue metal ballast (1½" stone) is priced at approximately ₹3,800 per load ex-yard from our Thilaspettai depot. It is the standard specification for foundation plain cement concrete (PCC), road sub-base layers, and retaining wall backfill. We offer bulk lorry loads for infrastructure contractors across Puducherry. Call 9944076675 for the current rate.`
  },
  {
    id: 'faq-7',
    question: 'Where is Sri Angalamman Blue Metals located in Pondicherry?',
    answer: `Our yard is located at: Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry — 605009. We are open Monday to Saturday 6:00 AM – 8:00 PM and Sunday 7:00 AM – 1:00 PM. You can reach us at 9944076675, 9345009337, or 9629657833. View our location on Google Maps at maps.app.goo.gl/Z4SS6rkY7Vknzc3SA`
  },
  {
    id: 'faq-8',
    question: 'Do you supply Sengal (red clay bricks) in bulk in Pondicherry?',
    answer: `Yes. Sri Angalamman Blue Metals is a leading Sengal and red clay brick supplier in Puducherry. We supply kiln-fired, high-density red clay bricks in bulk at approximately ₹25,500 per unit load (approx. 3,000 bricks). Our bricks offer high compressive strength and excellent thermal insulation for residential and commercial buildings. Tipper delivery is available across Pondicherry.`
  }
];

export default function SEOFaqSection() {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId(prev => (prev === id ? null : id));

  return (
    <section
      id="faq"
      className="section-padding"
      aria-label="Frequently Asked Questions about Blue Metal Suppliers in Pondicherry"
      style={{ background: 'rgba(7, 13, 26, 0.8)', position: 'relative' }}
    >
      <div className="container">

        {/* Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <HelpCircle size={16} />
            <span>Common Questions</span>
          </div>
          <h2 className="section-title">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="section-desc">
            Answers to the most common questions about blue metal prices, M-Sand, P-Sand, delivery, and construction material supply in Pondicherry.
          </p>
        </AnimatedSection>

        {/* FAQ Accordion Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 560px), 1fr))',
          gap: '1rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {faqs.map((faq, idx) => {
            const isOpen = openId === faq.id;
            return (
              <AnimatedSection
                key={faq.id}
                animation="fade-up"
                delay={`${Math.min(idx * 0.05, 0.35)}s`}
              >
                <div
                  style={{
                    background: isOpen
                      ? 'rgba(37, 99, 235, 0.08)'
                      : 'rgba(12, 22, 44, 0.72)',
                    border: isOpen
                      ? '1px solid rgba(56, 189, 248, 0.35)'
                      : '1px solid rgba(255, 255, 255, 0.07)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: isOpen
                      ? '0 8px 32px rgba(37, 99, 235, 0.18)'
                      : '0 2px 12px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {/* Question Button */}
                  <button
                    id={`${faq.id}-trigger`}
                    aria-expanded={isOpen}
                    aria-controls={`${faq.id}-panel`}
                    onClick={() => toggle(faq.id)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1.35rem 1.5rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: isOpen ? '#38bdf8' : '#f1f5f9',
                      lineHeight: 1.4,
                      transition: 'color 0.25s ease'
                    }}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={20}
                      color={isOpen ? '#38bdf8' : '#64748b'}
                      style={{
                        flexShrink: 0,
                        transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  </button>

                  {/* Answer Panel */}
                  <div
                    id={`${faq.id}-panel`}
                    role="region"
                    aria-labelledby={`${faq.id}-trigger`}
                    style={{
                      maxHeight: isOpen ? '600px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                  >
                    <div style={{
                      padding: '0 1.5rem 1.5rem 1.5rem',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                    }}>
                      <p style={{
                        fontSize: '0.92rem',
                        color: '#cbd5e1',
                        lineHeight: 1.75,
                        marginTop: '1rem',
                        whiteSpace: 'pre-line'
                      }}>
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ color: '#94a3b8', marginBottom: '1.25rem', fontSize: '1rem' }}>
            Have a specific question about blue metal pricing or site delivery in Puducherry?
          </p>
          <a
            href="tel:9944076675"
            id="faq-call-cta"
            className="btn btn-primary btn-lg btn-shimmer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            aria-label="Call Sri Angalamman Blue Metals for construction material enquiry"
          >
            <Phone size={18} />
            <span>Call 9944076675 for Material Enquiry</span>
          </a>
        </AnimatedSection>

      </div>
    </section>
  );
}
