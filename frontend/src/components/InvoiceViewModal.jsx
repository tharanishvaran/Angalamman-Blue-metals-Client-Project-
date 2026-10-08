import React from 'react';
import { Printer, Download, X, CheckCircle, Clock } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function InvoiceViewModal({ invoice, business = {}, onClose }) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const primaryPhone = business.phone_primary || '9944076675';
    const address = business.address || 'Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry';

    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 64, 175);
    doc.text('SRI ANGALAMMAN BLUE METALS', 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Construction Materials & Material Transportation Services', 14, 26);
    doc.text(address, 14, 31);
    doc.text(`Contact: ${primaryPhone} / ${business.phone_secondary || '9345009337'} / ${business.phone_additional || '9629657833'}`, 14, 36);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 40, 196, 40);

    // Invoice Meta
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`TAX INVOICE: ${invoice.invoice_number}`, 14, 48);
    doc.setFontSize(9);
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 14, 54);
    doc.text(`Payment Status: ${invoice.payment_status.toUpperCase()}`, 14, 60);

    // Customer
    doc.text('Billed To:', 120, 48);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.customer_name, 120, 54);
    doc.setFont('helvetica', 'normal');
    doc.text(`Mobile: ${invoice.customer_mobile}`, 120, 60);
    if (invoice.customer_address) {
      doc.text(`Site: ${invoice.customer_address}`, 120, 66);
    }

    doc.line(14, 72, 196, 72);

    // Table Header
    doc.setFont('helvetica', 'bold');
    doc.text('Item / Material', 14, 78);
    doc.text('Qty', 95, 78);
    doc.text('Rate', 125, 78);
    doc.text('Amount (INR)', 165, 78);
    doc.line(14, 82, 196, 82);

    // Table Rows
    doc.setFont('helvetica', 'normal');
    let y = 90;
    (invoice.items || []).forEach((item) => {
      doc.text(item.material_name, 14, y);
      doc.text(`${item.quantity} ${item.unit}`, 95, y);
      doc.text(`Rs. ${item.unit_price.toLocaleString('en-IN')}`, 125, y);
      doc.text(`Rs. ${item.subtotal.toLocaleString('en-IN')}`, 165, y);
      y += 8;
    });

    doc.line(14, y + 2, 196, y + 2);
    y += 10;

    // Totals
    doc.text(`Subtotal: Rs. ${invoice.subtotal.toLocaleString('en-IN')}`, 130, y);
    y += 7;
    doc.text(`Discount: Rs. ${invoice.discount.toLocaleString('en-IN')}`, 130, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 64, 175);
    doc.text(`Grand Total: Rs. ${invoice.grand_total.toLocaleString('en-IN')}`, 130, y);

    // Footer
    y += 25;
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Sri Angalamman Blue Metals • Quality Materials for a Stronger Tomorrow', 14, y);
    doc.text('This is a computer-generated tax invoice for weighbridge material dispatch.', 14, y + 5);

    doc.save(`${invoice.invoice_number}.pdf`);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '750px', background: '#ffffff', color: '#1f2937' }}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handlePrint} className="btn btn-outline btn-sm" style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
              <Printer size={15} /> Print Invoice
            </button>
            <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm">
              <Download size={15} /> Download PDF
            </button>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Printable Invoice Container */}
        <div className="printable-invoice" style={{ padding: '0.5rem' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', color: '#1e3a8a', fontWeight: 800, margin: 0 }}>
                {business.business_name || 'Sri Angalamman Blue Metals'}
              </h2>
              <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                Blue Metals, Sand & Construction Material Logistics
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem', maxWidth: '350px' }}>
                {business.address || 'Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '0.2rem' }}>
                Hotline: {business.phone_primary || '9944076675'} / {business.phone_secondary || '9345009337'}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{
                display: 'inline-block',
                padding: '0.35rem 0.8rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: invoice.payment_status === 'Paid' ? '#dcfce7' : '#fee2e2',
                color: invoice.payment_status === 'Paid' ? '#15803d' : '#b91c1c'
              }}>
                {invoice.payment_status}
              </span>
              <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' }}>
                Invoice No: <strong style={{ color: '#0f172a' }}>{invoice.invoice_number}</strong>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Date: <strong style={{ color: '#0f172a' }}>{new Date(invoice.created_at).toLocaleDateString()}</strong>
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '1.5rem 0' }} />

          {/* Customer Details Box */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Billed To Customer
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '0.2rem' }}>
                {invoice.customer_name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Phone: {invoice.customer_mobile}
              </div>
              {invoice.customer_email && (
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Email: {invoice.customer_email}
                </div>
              )}
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                Delivery Site Location
              </div>
              <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.2rem', lineHeight: 1.4 }}>
                {invoice.customer_address || 'Puducherry Site Dispatch'}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #cbd5e1' }}>
                <th style={{ padding: '0.75rem', color: '#334155' }}>Material / Item</th>
                <th style={{ padding: '0.75rem', color: '#334155', textAlign: 'center' }}>Quantity</th>
                <th style={{ padding: '0.75rem', color: '#334155', textAlign: 'right' }}>Unit Price (₹)</th>
                <th style={{ padding: '0.75rem', color: '#334155', textAlign: 'right' }}>Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((it, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{it.material_name}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', color: '#475569' }}>{it.quantity} {it.unit}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#475569' }}>₹{it.unit_price.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>₹{it.subtotal.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Calculation */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
            <div style={{ width: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: '#64748b', fontSize: '0.9rem' }}>
                <span>Subtotal:</span>
                <span style={{ color: '#0f172a' }}>₹{invoice.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {invoice.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: '#16a34a', fontSize: '0.9rem' }}>
                  <span>Discount:</span>
                  <span>- ₹{invoice.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.75rem 0',
                borderTop: '2px solid #0f172a',
                fontSize: '1.2rem',
                fontWeight: 800,
                color: '#1e3a8a',
                marginTop: '0.5rem'
              }}>
                <span>Grand Total:</span>
                <span>₹{invoice.grand_total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Notes & Terms */}
          <div style={{ fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 700, color: '#334155', marginBottom: '0.2rem' }}>Terms & Conditions:</div>
            <div>1. Weighbridge receipt attached during dispatch verifies unloaded bulk volume.</div>
            <div>2. Any site transit delays or road entry permissions are subject to local traffic guidelines.</div>
            <div>3. For bank transfers or cash settlement, verify receipt with Sri Angalamman dispatch office.</div>
          </div>

        </div>

      </div>
    </div>
  );
}
