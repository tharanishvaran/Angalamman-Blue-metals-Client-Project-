import React from 'react';
import { Printer, Download, X, CheckCircle, Clock, AlertTriangle, ShieldCheck, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Helper: Strict DD/MM/YYYY formatting (Date / Month / Year)
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function InvoiceViewModal({ invoice, business = {}, onClose }) {
  if (!invoice) return null;

  // Accurate monetary calculations
  const subtotal = Number(invoice.subtotal || 0);
  const discount = Number(invoice.discount || 0);
  const grandTotal = Number(invoice.grand_total || 0);
  const paidAmount = Number(
    invoice.paid_amount != null 
      ? invoice.paid_amount 
      : (invoice.payment_status === 'Paid' ? grandTotal : 0)
  );
  const balanceDue = Math.max(0, grandTotal - paidAmount);
  
  const isPaid = (paidAmount >= grandTotal && grandTotal > 0) || invoice.payment_status === 'Paid';
  const isPartial = !isPaid && paidAmount > 0;
  const isUnpaid = !isPaid && paidAmount === 0;

  const statusLabel = isPaid ? 'Fully Paid' : isPartial ? 'Partially Paid' : 'Unpaid';
  const formattedDate = formatDateDDMMYYYY(invoice.created_at);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const primaryPhone = business.phone_primary || '9944076675';
    const secondaryPhone = business.phone_secondary || '9345009337';
    const address = business.address || 'Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry';

    // Header Background Accent Bar
    doc.setFillColor(30, 58, 138); // Navy blue
    doc.rect(0, 0, 210, 8, 'F');

    // Company Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('SRI ANGALAMMAN BLUE METALS', 14, 20);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text('Government Approved Weighbridge Dispatch & Construction Logistics', 14, 25);
    doc.text(address, 14, 30);
    doc.text(`Hotline: +91 ${primaryPhone} / +91 ${secondaryPhone} | GST Registered Vendor`, 14, 35);

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(14, 39, 196, 39);

    // Two-Column Meta Box (Tax Invoice Details & Customer Info)
    // Left Box: Invoice Meta
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`TAX INVOICE: ${invoice.invoice_number}`, 14, 46);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Invoice Date: ${formattedDate}`, 14, 52);
    doc.text(`Payment Status: ${statusLabel.toUpperCase()}`, 14, 57);
    if (invoice.notes) {
      doc.text(`Ref Note: ${invoice.notes.substring(0, 45)}`, 14, 62);
    }

    // Right Box: Customer Billed To
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('BILLED TO CUSTOMER:', 115, 46);

    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(invoice.customer_name || 'Valued Customer', 115, 52);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Mobile: ${invoice.customer_mobile || 'N/A'}`, 115, 57);
    if (invoice.customer_email) {
      doc.text(`Email: ${invoice.customer_email}`, 115, 62);
    }
    const siteAddr = invoice.customer_address || 'Puducherry Site Dispatch';
    doc.text(`Site: ${siteAddr.substring(0, 45)}`, 115, invoice.customer_email ? 67 : 62);

    doc.setDrawColor(203, 213, 225);
    doc.line(14, 72, 196, 72);

    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, 75, 182, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('#', 17, 80);
    doc.text('Material / Description', 25, 80);
    doc.text('Quantity', 95, 80);
    doc.text('Rate (INR)', 128, 80);
    doc.text('Amount (INR)', 165, 80);

    // Table Rows
    doc.setFont('helvetica', 'normal');
    let y = 89;
    (invoice.items || []).forEach((item, index) => {
      // Row zebra striping
      if (index % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 5, 182, 7.5, 'F');
      }
      doc.setTextColor(15, 23, 42);
      doc.text(String(index + 1), 17, y);
      doc.setFont('helvetica', 'bold');
      doc.text(item.material_name || 'Material Item', 25, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`${item.quantity} ${item.unit || 'Unit'}`, 95, y);
      doc.text(`Rs. ${Number(item.unit_price || 0).toLocaleString('en-IN')}`, 128, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${Number(item.subtotal || 0).toLocaleString('en-IN')}`, 165, y);
      doc.setFont('helvetica', 'normal');
      y += 8;
    });

    doc.setDrawColor(203, 213, 225);
    doc.line(14, y + 2, 196, y + 2);
    y += 9;

    // Totals Block
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text('Subtotal:', 125, y);
    doc.text(`Rs. ${subtotal.toLocaleString('en-IN')}`, 165, y);
    y += 6;

    if (discount > 0) {
      doc.setTextColor(22, 163, 74);
      doc.text('Discount:', 125, y);
      doc.text(`- Rs. ${discount.toLocaleString('en-IN')}`, 165, y);
      y += 6;
    }

    // Grand Total Line
    doc.setFillColor(241, 245, 249);
    doc.rect(120, y - 4, 76, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 58, 138);
    doc.text('Grand Total:', 125, y + 1.5);
    doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}`, 165, y + 1.5);
    y += 10;

    // Amount Paid Line
    doc.setFontSize(9);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    doc.text('Amount Paid:', 125, y);
    doc.text(`Rs. ${paidAmount.toLocaleString('en-IN')}`, 165, y);
    y += 6.5;

    // Balance Due Line
    doc.setFont('helvetica', 'bold');
    if (balanceDue > 0) {
      doc.setTextColor(185, 28, 28);
      doc.text('Balance Due:', 125, y);
      doc.text(`Rs. ${balanceDue.toLocaleString('en-IN')}`, 165, y);
    } else {
      doc.setTextColor(22, 163, 74);
      doc.text('Balance Due:', 125, y);
      doc.text('Rs. 0 (Fully Paid)', 165, y);
    }

    // Official Seal representation on the left side
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, y - 22, 90, 24, 2, 2, 'D');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('OFFICIAL WEIGHBRIDGE DISPATCH BILL', 18, y - 16);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(`Certified: Sri Angalamman Blue Metals`, 18, y - 11);
    doc.text(`Status: ${statusLabel} | Date: ${formattedDate}`, 18, y - 6);
    doc.text(`Authorized Dispatch Officer`, 18, y - 1);

    // Terms & Conditions Footer
    y += 18;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, 196, y);
    y += 6;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Terms & Delivery Conditions:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('1. Net weight and volume confirmed at Sri Angalamman electronic weighbridge prior to site transit.', 14, y + 4.5);
    doc.text('2. Please inspect aggregates and brick quality upon tipping at site. Transit delays subject to local road norms.', 14, y + 8.5);
    doc.text('3. For digital payment confirmations, verify transaction reference with dispatch billing desk.', 14, y + 12.5);

    // Bottom copyright
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Sri Angalamman Blue Metals • Quality Aggregates for Everlasting Structures • Computer Generated Tax Invoice', 14, y + 20);

    doc.save(`${invoice.invoice_number}.pdf`);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 2500, padding: '1rem' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '780px', 
          width: '100%',
          background: '#ffffff', 
          color: '#0f172a',
          borderRadius: '16px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0,0,0,0.05)',
          padding: '1.5rem',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div 
          className="no-print" 
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.25rem', 
            paddingBottom: '0.85rem', 
            borderBottom: '1px solid #e2e8f0' 
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} color="#1d4ed8" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e3a8a' }}>
              Tax Invoice & Dispatch Receipt
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <button 
              onClick={handlePrint} 
              className="btn btn-outline btn-sm" 
              style={{ 
                color: '#0f172a', 
                borderColor: '#cbd5e1',
                background: '#f8fafc',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '8px'
              }}
            >
              <Printer size={15} /> Print
            </button>
            <button 
              onClick={handleDownloadPDF} 
              className="btn btn-primary btn-sm"
              style={{
                background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.82rem',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px'
              }}
            >
              <Download size={15} /> Download PDF
            </button>
            <button 
              onClick={onClose} 
              style={{ 
                background: '#f1f5f9', 
                border: 'none', 
                color: '#64748b', 
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '0.25rem'
              }}
              title="Close Invoice"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div 
          className="printable-invoice" 
          style={{ 
            padding: '0.75rem',
            background: '#ffffff',
            borderRadius: '8px'
          }}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '1.25rem', 
            gap: '1rem', 
            flexWrap: 'wrap',
            paddingBottom: '1.25rem',
            borderBottom: '2px solid #1e3a8a'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <img 
                src="/logo.png" 
                alt="Sri Angalamman Blue Metals" 
                style={{ 
                  width: '68px', 
                  height: '68px', 
                  borderRadius: '12px', 
                  border: '2px solid #cbd5e1', 
                  objectFit: 'cover', 
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.06)'
                }} 
              />
              <div>
                <h2 style={{ fontSize: '1.45rem', color: '#1e3a8a', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
                  {business.business_name || 'Sri Angalamman Blue Metals'}
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, marginTop: '0.15rem' }}>
                  Construction Materials, M-Sand, Blue Metals & Logistics Fleet
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem', maxWidth: '400px', lineHeight: 1.35 }}>
                  {business.address || 'Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 700, marginTop: '0.25rem' }}>
                  📞 Hotline: {business.phone_primary || '9944076675'} / {business.phone_secondary || '9345009337'}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', minWidth: '180px' }}>
              {/* Payment Status Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                background: isPaid ? '#dcfce7' : isPartial ? '#fef3c7' : '#fee2e2',
                color: isPaid ? '#15803d' : isPartial ? '#b45309' : '#b91c1c',
                border: isPaid ? '1.5px solid #86efac' : isPartial ? '1.5px solid #fcd34d' : '1.5px solid #fca5a5'
              }}>
                {isPaid ? <CheckCircle size={14} /> : isPartial ? <Clock size={14} /> : <AlertTriangle size={14} />}
                <span>{statusLabel}</span>
              </div>

              <div style={{ marginTop: '0.65rem', fontSize: '0.85rem', color: '#64748b' }}>
                Invoice No: <strong style={{ color: '#0f172a', fontWeight: 800 }}>{invoice.invoice_number}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>
                Date (DD/MM/YYYY): <strong style={{ color: '#0f172a', fontWeight: 800 }}>{formattedDate}</strong>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Site Info Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '1rem', 
            marginBottom: '1.25rem' 
          }}>
            {/* Box 1: Billed To */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '0.9rem 1rem', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                👤 Customer Details (Billed To)
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '0.3rem' }}>
                {invoice.customer_name}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Phone size={13} color="#2563eb" />
                <span>{invoice.customer_mobile}</span>
              </div>
              {invoice.customer_email && (
                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Mail size={13} color="#2563eb" />
                  <span>{invoice.customer_email}</span>
                </div>
              )}
            </div>

            {/* Box 2: Delivery Destination */}
            <div style={{ 
              background: '#f8fafc', 
              padding: '0.9rem 1rem', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
                📍 Delivery Site Location
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155', marginTop: '0.3rem', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: '0.35rem' }}>
                <MapPin size={15} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{invoice.customer_address || 'Puducherry Site Dispatch'}</span>
              </div>
              {invoice.notes && (
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem', fontStyle: 'italic', background: '#ffffff', padding: '0.3rem 0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  Note: {invoice.notes}
                </div>
              )}
            </div>
          </div>

          {/* Line Items Table */}
          <div style={{ overflowX: 'auto', marginBottom: '1.25rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                  <th style={{ padding: '0.7rem 0.85rem', color: '#334155', fontWeight: 800, width: '40px' }}>#</th>
                  <th style={{ padding: '0.7rem 0.85rem', color: '#334155', fontWeight: 800 }}>Material / Item Description</th>
                  <th style={{ padding: '0.7rem 0.85rem', color: '#334155', fontWeight: 800, textAlign: 'center' }}>Quantity</th>
                  <th style={{ padding: '0.7rem 0.85rem', color: '#334155', fontWeight: 800, textAlign: 'right' }}>Unit Rate (₹)</th>
                  <th style={{ padding: '0.7rem 0.85rem', color: '#334155', fontWeight: 800, textAlign: 'right' }}>Subtotal (₹)</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((it, idx) => (
                  <tr 
                    key={idx} 
                    style={{ 
                      borderBottom: '1px solid #e2e8f0',
                      background: idx % 2 === 1 ? '#f8fafc' : '#ffffff'
                    }}
                  >
                    <td style={{ padding: '0.7rem 0.85rem', color: '#64748b', fontWeight: 600 }}>{idx + 1}</td>
                    <td style={{ padding: '0.7rem 0.85rem', fontWeight: 700, color: '#0f172a' }}>{it.material_name}</td>
                    <td style={{ padding: '0.7rem 0.85rem', textAlign: 'center', color: '#475569', fontWeight: 600 }}>
                      {it.quantity} {it.unit}
                    </td>
                    <td style={{ padding: '0.7rem 0.85rem', textAlign: 'right', color: '#475569' }}>
                      ₹{Number(it.unit_price || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '0.7rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                      ₹{Number(it.subtotal || 0).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Financial Breakdown & Stamp */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            flexWrap: 'wrap', 
            gap: '1.5rem', 
            marginBottom: '1.5rem' 
          }}>
            {/* Left: Official Weighbridge Dispatch Certificate Block */}
            <div style={{ 
              flex: '1 1 280px', 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '10px', 
              border: '1.5px dashed #cbd5e1' 
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e3a8a', fontWeight: 800, fontSize: '0.85rem' }}>
                <ShieldCheck size={18} color="#1e3a8a" />
                <span>OFFICIAL WEIGHBRIDGE DISPATCH CERTIFICATE</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.4rem 0 0.8rem 0', lineHeight: 1.45 }}>
                Electronic weighbridge verification conducted at Sri Angalamman yard prior to site delivery. High tensile aggregates meet IS:383 grading specifications.
              </p>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Verified At:</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{formattedDate}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Authorized Signatory</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e3a8a', fontStyle: 'italic' }}>Sri Angalamman Blue Metals</div>
                </div>
              </div>
            </div>

            {/* Right: Totals Calculation Summary */}
            <div style={{ 
              width: '100%', 
              maxWidth: '320px', 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '10px', 
              border: '1px solid #e2e8f0' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#64748b', fontSize: '0.88rem' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', color: '#16a34a', fontSize: '0.88rem', fontWeight: 700 }}>
                  <span>Discount:</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.65rem 0',
                borderTop: '2px solid #0f172a',
                fontSize: '1.15rem',
                fontWeight: 900,
                color: '#1e3a8a',
                marginTop: '0.4rem'
              }}>
                <span>Grand Total:</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Amount Paid - Accurate display */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.4rem 0', 
                color: '#15803d', 
                fontSize: '0.92rem', 
                fontWeight: 800,
                borderTop: '1px dashed #cbd5e1',
                marginTop: '0.3rem'
              }}>
                <span>Amount Paid:</span>
                <span>₹{paidAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Balance Due - Accurate computation */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.45rem 0.6rem',
                borderRadius: '6px',
                background: balanceDue > 0 ? '#fee2e2' : '#dcfce7',
                color: balanceDue > 0 ? '#b91c1c' : '#15803d',
                fontSize: '0.95rem',
                fontWeight: 900,
                marginTop: '0.35rem'
              }}>
                <span>{balanceDue > 0 ? 'Pending Balance:' : 'Balance Due:'}</span>
                <span>{balanceDue > 0 ? `₹${balanceDue.toLocaleString('en-IN')}` : '₹0 (Fully Paid)'}</span>
              </div>
            </div>
          </div>

          {/* Terms & Footer */}
          <div style={{ 
            fontSize: '0.76rem', 
            color: '#64748b', 
            borderTop: '1px solid #e2e8f0', 
            paddingTop: '0.85rem', 
            lineHeight: 1.5 
          }}>
            <div style={{ fontWeight: 800, color: '#334155', marginBottom: '0.2rem' }}>
              Terms & Dispatch Conditions:
            </div>
            <div>1. Weighbridge receipt issued with delivery truck verifies unloaded bulk aggregate quantity.</div>
            <div>2. Any unloading constraints or site entry permissions must be facilitated by customer supervisor on site.</div>
            <div>3. For bank NEFT/UPI settlement, quote Invoice No: <strong>{invoice.invoice_number}</strong> on transaction slip.</div>
          </div>

        </div>

      </div>
    </div>
  );
}
