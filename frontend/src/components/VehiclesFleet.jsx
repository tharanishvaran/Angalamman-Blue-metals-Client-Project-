import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  ArrowRight, 
  Calculator, 
  Fuel, 
  Clock 
} from 'lucide-react';
import AnimatedSection from './AnimatedSection';

export default function VehiclesFleet({ settings, onOpenDelivery, onOpenQuote }) {
  const primaryPhone = settings.phone_primary || '9944076675';

  // Interactive Quick Delivery Estimator
  const [estMaterial, setEstMaterial] = useState('M-Sand');
  const [estQuantity, setEstQuantity] = useState(2);
  const [estDistance, setEstDistance] = useState(5); // km from Thilaspettai

  // Rough estimation logic: Base material * qty + (distance * 120 per km)
  const baseRates = {
    'M-Sand': 4800,
    'P-Sand': 5200,
    'River Sand': 6500,
    '3/4 Stone': 4400,
    '1/2 Stone': 4200,
    'Crusher Powder': 2400,
    'Gravel': 2800
  };

  const estimatedMaterialCost = (baseRates[estMaterial] || 4500) * estQuantity;
  const estimatedTransportCost = Math.max(500, estDistance * 100 * estQuantity);
  const totalEstimate = estimatedMaterialCost + estimatedTransportCost;

  const fleetVehicles = [
    {
      name: 'Hydraulic Tractor Trolley',
      type: 'Narrow Street & Residential',
      capacity: '1 - 2 Units / 3 Tons',
      bestFor: 'Thilaspettai colony streets, individual home builds, compact sites',
      features: 'High ground clearance, 3-way tipping, easy street maneuverability',
      image: settings.vehicle_tractor_image || '/images/tractor_trolley.jpg'
    },
    {
      name: 'Mini Tipper Truck (4-Wheeler)',
      type: 'Express Urban Delivery',
      capacity: '2 - 3 Units / 4.5 Tons',
      bestFor: 'Town areas, apartment renovations, rapid commercial drops',
      features: 'Fast transit, automated hydraulic lift, clean precision unloading',
      image: settings.vehicle_tipper_image || '/images/fleet.jpg'
    },
    {
      name: 'Multi-Axle Heavy Tipper Lorry',
      type: 'Bulk Commercial Supply',
      capacity: '5 - 10 Units / 16 - 25 Tons',
      bestFor: 'Major infrastructure, layouts, multi-storey RCC pours, road works',
      features: 'Heavy payload, direct quarry-to-site transit, maximum bulk economy',
      image: settings.vehicle_lorry_image || '/images/heavy_tipper.jpg'
    }
  ];

  const workflowSteps = [
    { step: '01', title: 'Select Material', desc: 'Choose M-Sand, P-Sand, aggregates, or bricks.' },
    { step: '02', title: 'Enter Quantity', desc: 'Specify loads, units, or approximate cubic feet.' },
    { step: '03', title: 'Delivery Location', desc: 'Provide your site address in Puducherry.' },
    { step: '04', title: 'Get Estimate', desc: 'Confirm transparent pricing and vehicle type.' },
    { step: '05', title: 'Material Delivered', desc: 'Dispatched to your site with weighbridge slip.' },
  ];

  return (
    <section id="vehicles" className="section-padding" style={{ background: 'rgba(10, 18, 36, 0.65)', position: 'relative' }}>
      <div className="container">
        
        {/* Section Header */}
        <AnimatedSection animation="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div className="section-tag">
            <Truck size={16} />
            <span>Dedicated Transportation Fleet</span>
          </div>
          <h2 className="section-title">
            Material Delivery <span className="gradient-text">to Your Location</span>
          </h2>
          <p className="section-desc">
            Order your required construction materials and get them transported directly to your location with our fleet of tractors and tippers.
          </p>
        </AnimatedSection>

        {/* 5-Step Process Workflow */}
        <AnimatedSection 
          animation="fade-up"
          style={{
            background: 'rgba(13, 23, 44, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            marginBottom: '4rem',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#fb923c', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Seamless Fulfillment Process
            </span>
            <h3 style={{ fontSize: '1.6rem', color: '#fff', marginTop: '0.3rem', fontWeight: 800 }}>
              How We Deliver Straight to Your Site
            </h3>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.5rem',
            position: 'relative'
          }}>
            {workflowSteps.map((ws, i) => (
              <div 
                key={i}
                className="hover-lift"
                style={{
                  textAlign: 'center',
                  padding: '1.4rem 1.1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  position: 'relative',
                  transition: 'transform 0.3s ease, border-color 0.3s ease'
                }}
              >
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #f97316 100%)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.1rem auto',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
                }}>
                  {ws.step}
                </div>
                <h4 style={{ fontSize: '1.08rem', color: '#fff', marginBottom: '0.45rem', fontWeight: 700 }}>{ws.title}</h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>{ws.desc}</p>
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Vehicles Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '2rem',
          marginBottom: '4rem'
        }}>
          {fleetVehicles.map((v, idx) => (
            <AnimatedSection 
              key={idx}
              animation="fade-up"
              delay={`${Math.min(idx * 0.1, 0.3)}s`}
              className="glass-card hover-lift"
              style={{
                borderRadius: '20px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="card-img-zoom" style={{ height: '210px', overflow: 'hidden', position: 'relative' }}>
                <img 
                  src={v.image} 
                  alt={v.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(7, 14, 27, 0.88)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  padding: '0.3rem 0.8rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  color: '#38bdf8',
                  fontWeight: 700,
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}>
                  {v.type}
                </div>
              </div>

              <div style={{ padding: '1.6rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.45rem', fontWeight: 700 }}>{v.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb923c', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                    <Truck size={17} /> Capacity: {v.capacity}
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#cbd5e1', marginBottom: '0.8rem', lineHeight: 1.5 }}>
                    <strong>Ideal for:</strong> {v.bestFor}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.45 }}>
                    {v.features}
                  </p>
                </div>

                <div style={{ marginTop: '1.4rem', paddingTop: '1.1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button
                    onClick={() => onOpenDelivery()}
                    className="btn btn-orange btn-sm btn-shimmer"
                    style={{ width: '100%', padding: '0.65rem 1rem' }}
                  >
                    <span>Request This Vehicle</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Interactive Estimator & Call for Transport Card */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 290px), 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          
          {/* Quick Estimator Tool */}
          <AnimatedSection animation="slide-left" className="glass-card" style={{ padding: '2.2rem', borderRadius: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.4rem' }}>
              <div style={{ padding: '0.6rem', borderRadius: '12px', background: 'rgba(37, 99, 235, 0.22)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)' }}>
                <Calculator size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 700 }}>Quick Material & Freight Estimator</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Estimate load + haulage from Thilaspettai</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Material</label>
                <select 
                  className="form-control"
                  value={estMaterial}
                  onChange={(e) => setEstMaterial(e.target.value)}
                >
                  <option value="M-Sand">M-Sand</option>
                  <option value="P-Sand">P-Sand</option>
                  <option value="River Sand">River Sand</option>
                  <option value="3/4 Stone">3/4 Stone (20mm)</option>
                  <option value="1/2 Stone">1/2 Stone (12mm)</option>
                  <option value="Crusher Powder">Crusher Powder</option>
                  <option value="Gravel">Gravel / Kraval</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Quantity (Loads)</label>
                <input 
                  type="number"
                  min="1"
                  max="20"
                  className="form-control"
                  value={estQuantity}
                  onChange={(e) => setEstQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Distance from Thilaspettai:</span>
                <strong style={{ color: '#38bdf8', fontSize: '1rem' }}>{estDistance} km</strong>
              </label>
              <input 
                type="range"
                min="1"
                max="35"
                value={estDistance}
                onChange={(e) => setEstDistance(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#2563eb', height: '6px', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b', marginTop: '0.3rem' }}>
                <span>1 km (Local Thilaspettai)</span>
                <span>15 km (Villianur / Kalapet)</span>
                <span>35 km (Tindivanam Border)</span>
              </div>
            </div>

            {/* Live Calculation Display */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.4rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#cbd5e1', marginBottom: '0.45rem' }}>
                <span>Material Cost ({estQuantity} Loads {estMaterial}):</span>
                <span>₹{estimatedMaterialCost.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', color: '#cbd5e1', marginBottom: '0.65rem' }}>
                <span>Est. Transportation ({estDistance} km):</span>
                <span>₹{estimatedTransportCost.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0.7rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#fff' }}>Approx. Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb923c' }}>
                  ₹{totalEstimate.toLocaleString('en-IN')}*
                </span>
              </div>
            </div>

            <button 
              onClick={() => onOpenDelivery()}
              className="btn btn-primary btn-shimmer"
              style={{ width: '100%' }}
            >
              <Truck size={17} /> Book This Delivery Now
            </button>
          </AnimatedSection>

          {/* Call for Transport Direct Banner */}
          <AnimatedSection 
            animation="slide-right"
            style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.28) 0%, rgba(249, 115, 22, 0.18) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '24px',
              padding: '2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="section-tag" style={{ alignSelf: 'flex-start' }}>
              <span>Instant Dispatch Helpdesk</span>
            </div>

            <h3 style={{ fontSize: '2rem', color: '#fff', marginBottom: '1rem', lineHeight: 1.2, fontWeight: 800 }}>
              Have Urgent Site Delivery Requirements Today?
            </h3>

            <p style={{ color: '#cbd5e1', lineHeight: 1.65, marginBottom: '2.2rem', fontSize: '0.95rem' }}>
              Our transport supervisor coordinates vehicle dispatches across Thilaspettai, Gorimedu, Lawspet, Villianur, and Ariyankuppam. Call us immediately for load availability and guaranteed dispatch timing.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              <a 
                href={`tel:${primaryPhone}`}
                className="btn btn-orange btn-lg btn-shimmer"
                style={{ flex: 1, minWidth: '200px' }}
              >
                <Phone size={18} />
                <span>Call {primaryPhone}</span>
              </a>

              <button 
                onClick={onOpenQuote}
                className="btn btn-outline btn-lg"
                style={{ flex: 1, minWidth: '160px' }}
              >
                Request Custom Quote
              </button>
            </div>
          </AnimatedSection>

        </div>

      </div>
    </section>
  );
}
