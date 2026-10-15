import { jsPDF } from 'jspdf';

// Helper: Format date as DD/MM/YYYY
export const formatDateDDMMYYYY = (dateInput) => {
  if (!dateInput) {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper: Load logo image as Base64 Data URL with fallback
const loadLogoBase64 = () => {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined') {
        resolve(null);
        return;
      }
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      const timer = setTimeout(() => resolve(null), 1000);

      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 140;
          canvas.height = img.naturalHeight || img.height || 140;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(null);
        }
      };

      img.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };

      img.src = '/logo.png';
    } catch (e) {
      resolve(null);
    }
  });
};

/**
 * Generate and download an attractive, official Quotation PDF
 * Note: Transport vehicle fees are NOT added to the quotation total.
 * @param {Object} data - Quotation parameters
 */
export async function downloadQuotationPDF(data = {}) {
  const {
    customer_name = 'Valued Customer',
    customer_mobile = '',
    customer_email = '',
    delivery_location = 'Puducherry Site Dispatch',
    material_name = 'M-Sand (Manufactured Sand)',
    material_category = 'Sand / Aggregate',
    material_description = 'High tensile, certified construction material',
    quantity = 1,
    unit = 'Load',
    unit_price = 4800,
    vehicle_name = 'Mini Tipper Truck (4-Wheeler)',
    vehicle_type = 'Express Urban Delivery',
    vehicle_capacity = '2 - 3 Units / 4.5 Tons',
    notes = '',
    request_number = '',
    created_at = new Date(),
    business = {}
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const businessName = business.business_name || 'SRI ANGALAMMAN BLUE METALS';
  const primaryPhone = business.phone_primary || '9944076675';
  const secondaryPhone = business.phone_secondary || '9345009337';
  const address = business.address || 'Kalathumettu Veedhi, Sathiyamoorthy Nagar, Thilaspettai, Puducherry - 605009';
  const email = business.email || 'contact@sriangalammanbluemetals.com';

  const numQty = parseFloat(quantity) || 1;
  const numUnitPrice = Number(unit_price) || 0;
  // Quotation total is strictly based on the material quantity and unit price (no vehicle fee added)
  const materialSubtotal = Math.round(numQty * numUnitPrice);
  const grandTotal = materialSubtotal;

  const quoteRef = request_number || `QTN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  const formattedDate = formatDateDDMMYYYY(created_at);

  // 1. Top Accent Color Ribbon
  doc.setFillColor(15, 23, 42); // Navy Dark
  doc.rect(0, 0, 210, 8, 'F');
  doc.setFillColor(249, 115, 22); // Vibrant Orange Stripe
  doc.rect(0, 8, 210, 2, 'F');

  // 2. Load and embed Logo
  const logoData = await loadLogoBase64();
  if (logoData) {
    try {
      doc.addImage(logoData, 'PNG', 14, 13, 22, 22);
    } catch (e) {
      // fallback handled below
    }
  } else {
    // Elegant fallback emblem
    doc.setFillColor(30, 58, 138);
    doc.roundedRect(14, 13, 22, 22, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('SABM', 25, 25, { align: 'center' });
    doc.setFontSize(6.5);
    doc.text('PUDUCHERRY', 25, 29, { align: 'center' });
  }

  // 3. Shop Header Info
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138); // Royal Navy
  doc.text(businessName.toUpperCase(), 39, 19);

  doc.setFontSize(8.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Government Approved Weighbridge Dispatch & Construction Logistics', 39, 24);
  doc.text(address, 39, 29);
  doc.text(`Hotline: +91 ${primaryPhone} / +91 ${secondaryPhone} | Email: ${email}`, 39, 34);

  // Document Badge on top right
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(142, 13, 54, 19, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  doc.text('OFFICIAL ESTIMATE', 169, 19, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(quoteRef, 169, 25, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formattedDate}`, 169, 30, { align: 'center' });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.6);
  doc.line(14, 39, 196, 39);

  // 4. Two-Column Meta Boxes (Quotation Details & Customer Details)
  // Left Box: Quotation Meta
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 43, 88, 30, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('DISPATCH & QUOTATION SPECIFICATIONS:', 18, 49);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Quotation Ref:`, 18, 55);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(quoteRef, 46, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Validity:`, 18, 60);
  doc.setTextColor(22, 163, 74);
  doc.setFont('helvetica', 'bold');
  doc.text(`7 Days from Issue (Price Guaranteed)`, 46, 60);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Depot Origin:`, 18, 65);
  doc.setTextColor(15, 23, 42);
  doc.text(`Thilaspettai Main Yard, Puducherry`, 46, 65);

  doc.setTextColor(71, 85, 105);
  doc.text(`Assigned Vehicle:`, 18, 70);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  const shortVeh = (vehicle_name || 'Tipper Truck').split('(')[0].trim();
  doc.text(shortVeh, 46, 70);

  // Right Box: Customer Billed / Prepared For
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, 43, 88, 30, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('PREPARED FOR VALUED CUSTOMER:', 112, 49);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(customer_name, 112, 55);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Mobile:`, 112, 60);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(customer_mobile ? `+91 ${customer_mobile}` : 'Provided on request', 130, 60);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Site Area:`, 112, 65);
  doc.setTextColor(15, 23, 42);
  const cleanLoc = delivery_location.replace(/\n📍.*$/, '').trim();
  doc.text(cleanLoc.length > 36 ? `${cleanLoc.substring(0, 34)}...` : (cleanLoc || 'Puducherry Site'), 130, 65);

  doc.setTextColor(71, 85, 105);
  doc.text(`Customer Email:`, 112, 70);
  doc.setTextColor(15, 23, 42);
  doc.text(customer_email || 'Direct Counter Billing', 135, 70);

  // 5. Section Title: Items & Pricing Table
  let y = 80;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('CHOSEN MATERIALS & SPECIFICATIONS', 14, y);

  // Table Header with Perfectly Calibrated Columns (NO OVERLAPPING!)
  // Total table width: 182mm (from x=14 to x=196)
  // Col 1 (#): x=18
  // Col 2 (Material Description): x=26
  // Col 3 (Category): x=104
  // Col 4 (Quantity): center at x=138
  // Col 5 (Rate): right aligned at x=166
  // Col 6 (Amount): right aligned at x=192
  y += 4;
  doc.setFillColor(30, 58, 138); // Deep Navy Header
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('#', 18, y + 5.5);
  doc.text('Material / Description', 26, y + 5.5);
  doc.text('Category', 104, y + 5.5);
  doc.text('Quantity', 138, y + 5.5, { align: 'center' });
  doc.text('Rate (INR)', 166, y + 5.5, { align: 'right' });
  doc.text('Amount (INR)', 192, y + 5.5, { align: 'right' });

  // ROW 1: Chosen Material Item
  y += 8;
  doc.setFillColor(255, 255, 255);
  doc.rect(14, y, 182, 13, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.line(14, y + 13, 196, y + 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('1', 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text(material_name, 26, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const descSnippet = (material_description || 'High compressive strength aggregate').substring(0, 52);
  doc.text(descSnippet, 26, y + 9.5);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(material_category || 'Aggregate', 104, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${numQty} ${unit}`, 138, y + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Rs. ${numUnitPrice.toLocaleString('en-IN')}`, 166, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${materialSubtotal.toLocaleString('en-IN')}`, 192, y + 6, { align: 'right' });

  // ROW 2: Chosen Delivery Logistics (Zero Transport Fee in Quotation)
  y += 13;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 13, 'F');
  doc.setDrawColor(241, 245, 249);
  doc.line(14, y + 13, 196, y + 13);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text('2', 18, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(249, 115, 22);
  doc.text(`Preferred Vehicle: ${vehicle_name}`, 26, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const vehDesc = vehicle_capacity ? `Capacity: ${vehicle_capacity} • Site Dispatch Logistics` : 'Site dispatch vehicle';
  doc.text(vehDesc, 26, y + 9.5);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Logistics', 104, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1 Trip', 138, y + 6, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(22, 163, 74);
  doc.text('Included', 166, y + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('Rs. 0 (Free)', 192, y + 6, { align: 'right' });

  y += 13;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, y, 196, y);

  // 6. Financial Summary Box (Right) & Quality Assurance Seal (Left)
  y += 6;

  // Left Block: Official Weighbridge Dispatch & Quality Seal representation
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, 92, 42, 2, 2, 'FD');

  doc.setFontSize(8.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('SRI ANGALAMMAN QUALITY GUARANTEE', 18, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('• Electronic weighbridge net weight slip issued at dispatch depot.', 18, y + 12);
  doc.text('• Crushed granite aggregate conforms strictly to IS:383 gradings.', 18, y + 17);
  doc.text('• Hydraulic tipping mechanism ensures fast, clean unloading at site.', 18, y + 22);

  doc.setDrawColor(226, 232, 240);
  doc.line(18, y + 26, 102, y + 26);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory & Depot Dispatcher', 18, y + 32);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 58, 138);
  doc.text('Sri Angalamman Blue Metals — Puducherry', 18, y + 38);

  // Right Block: Financial Calculation Breakdown (NO VEHICLE FEE ADDED)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(114, y, 82, 42, 2, 2, 'FD');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Material Charges:', 118, y + 8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${materialSubtotal.toLocaleString('en-IN')}`, 190, y + 8, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Vehicle Transport:', 118, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(22, 163, 74);
  doc.text('No Fee Added in Quote', 190, y + 15, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Loading & Weighment:', 118, y + 22);
  doc.setTextColor(22, 163, 74);
  doc.setFont('helvetica', 'bold');
  doc.text('INCLUDED (FREE)', 190, y + 22, { align: 'right' });

  // Grand Total Highlight Ribbon (Equal strictly to Material Subtotal)
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(117, y + 27, 76, 11, 2, 2, 'F');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND TOTAL:', 121, y + 34.5);
  doc.setFontSize(11);
  doc.setTextColor(251, 191, 36); // Bright Amber
  doc.text(`Rs. ${grandTotal.toLocaleString('en-IN')}`, 190, y + 34.5, { align: 'right' });

  // 7. Site & Delivery Notes (if provided)
  y += 48;
  if (notes) {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 12, 1.5, 1.5, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('Special Unloading / Site Note:', 18, y + 4.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const cleanNote = notes.substring(0, 95);
    doc.text(cleanNote, 18, y + 8.5);
    y += 16;
  }

  // 8. Terms & Conditions
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);
  y += 5;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Quotation Terms & Delivery Guidelines:', 14, y);

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('1. Price validity: This quotation is valid for 7 calendar days from issuance. Subject to quarry revision thereafter.', 14, y + 4.5);
  doc.text('2. Calibrated dispatch: Net volume and tonnage are certified at our computerized electronic weighbridge prior to departure.', 14, y + 8.5);
  doc.text('3. Site accessibility: Customer is requested to ensure overhead electrical clearance and adequate road width for the vehicle.', 14, y + 12.5);
  doc.text('4. Instant order confirmation: Call +91 9944076675 or present this quotation reference at our Thilaspettai office for dispatch.', 14, y + 16.5);

  // 9. Document Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 287, 210, 10, 'F');

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Sri Angalamman Blue Metals • Quality Aggregates for Everlasting Structures • Computer-Generated Official Estimate', 105, 293, { align: 'center' });

  // 10. Trigger Download
  const cleanCustomer = (customer_name || 'Customer').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanMat = (material_name || 'Material').split(' ')[0].replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Quotation_${cleanMat}_${cleanCustomer}.pdf`);
  return true;
}
