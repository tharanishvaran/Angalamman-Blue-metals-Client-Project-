import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Layers, 
  Truck, 
  FileText, 
  Receipt, 
  Star, 
  ShieldCheck, 
  Settings as SettingsIcon, 
  LogOut, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Printer, 
  ExternalLink, 
  ArrowLeft,
  DollarSign,
  Image as ImageIcon,
  Upload,
  UserCheck,
  UserX,
  Globe,
  Mail,
  PhoneCall,
  MessageCircle,
  Eye,
  RefreshCw,
  Lock,
  Key,
  Shield,
  Smartphone,
  MapPin,
  Calendar,
  Menu,
  X as CloseIcon
} from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { api } from '../api';

export default function AdminPortal({ admin, onLogout, onClose, onViewInvoice, onDataUpdated }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [services, setServices] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(false);

  // Material Modal Edit/Add State
  const [matModalOpen, setMatModalOpen] = useState(false);
  const [matForm, setMatForm] = useState({ id: null, name: '', category: 'Sand', price: '', unit: 'Load', description: '', available: 1, image_url: '/images/hero.jpg' });

  // Billing / Invoice Creation State (Requirement 14 & 41)
  const [billingForm, setBillingForm] = useState({
    user_id: '',
    customer_name: '',
    customer_mobile: '',
    customer_email: '',
    customer_address: '',
    discount: 0,
    paid_amount: 0,
    payment_status: 'Unpaid',
    notes: '',
    items: [] // No default item: admin chooses dynamically
  });
  const [billingSuccess, setBillingSuccess] = useState('');
  const [invoiceSubTab, setInvoiceSubTab] = useState('all'); // 'all', 'partial', 'paid'
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState(null);
  const [paymentModalPaidAmount, setPaymentModalPaidAmount] = useState('');

  // Admin User Creation & Edit Modals State
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '', role: 'ADMIN' });
  const [editAdminModalOpen, setEditAdminModalOpen] = useState(false);
  const [editAdminForm, setEditAdminForm] = useState({ id: null, name: '', email: '', role: 'ADMIN', status: 'ACTIVE', password: '' });
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('All');

  // Customer Directory & Logged-in Customer Tracker State
  const [customerFilterTab, setCustomerFilterTab] = useState('all'); // Default to 'all' so every user is visible
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [customerModalLoading, setCustomerModalLoading] = useState(false);

  // Settings form
  const [settingsForm, setSettingsForm] = useState({});
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [uploadingImageKey, setUploadingImageKey] = useState('');

  // Scroll to top on portal mount and tab changes to avoid blank/hidden view bug
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    loadAllAdminData();
  }, [activeSection]);

  // Real-time automatic polling and delivery_booked event listener
  useEffect(() => {
    const handleDeliveryBooked = () => {
      loadAllAdminData(false);
    };
    window.addEventListener('delivery_booked', handleDeliveryBooked);

    const timer = setInterval(() => {
      loadAllAdminData(false);
    }, 12000);
    return () => {
      clearInterval(timer);
      window.removeEventListener('delivery_booked', handleDeliveryBooked);
    };
  }, [activeSection]);

  const loadAllAdminData = async (showLoadingSpinner = true) => {
    try {
      if (showLoadingSpinner) setLoading(true);
      if (activeSection === 'dashboard') {
        const data = await api.getDashboardStats();
        setDashboardData(data);
      } else if (activeSection === 'materials') {
        const mats = await api.getMaterials({ all: 'true' });
        setMaterials(Array.isArray(mats) ? mats : []);
      } else if (activeSection === 'services') {
        const srvs = await api.getServices({ all: 'true' });
        setServices(Array.isArray(srvs) ? srvs : []);
      } else if (activeSection === 'deliveries') {
        const dels = await api.getAdminDeliveries();
        setDeliveries(Array.isArray(dels) ? dels : []);
      } else if (activeSection === 'quotes') {
        const qts = await api.getAdminQuotes();
        setQuotes(Array.isArray(qts) ? qts : []);
      } else if (activeSection === 'invoices') {
        const [invs, custs, mats] = await Promise.all([
          api.getAdminInvoices(),
          api.getCustomers().catch(() => []),
          api.getMaterials({ all: 'true' }).catch(() => [])
        ]);
        setInvoices(Array.isArray(invs) ? invs : []);
        setCustomers(Array.isArray(custs) ? custs : []);
        setMaterials(Array.isArray(mats) ? mats : []);
      } else if (activeSection === 'customers') {
        const custs = await api.getCustomers();
        setCustomers(Array.isArray(custs) ? custs : []);
      } else if (activeSection === 'admins') {
        const admins = await api.getAdmins();
        setAdminUsers(Array.isArray(admins) ? admins : []);
      } else if (activeSection === 'reviews') {
        const revs = await api.getAdminReviews();
        setReviews(Array.isArray(revs) ? revs : []);
      } else if (activeSection === 'settings' || activeSection === 'media') {
        const sets = await api.getSettings();
        setSiteSettings(sets || {});
        setSettingsForm(sets || {});
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      if (showLoadingSpinner) setLoading(false);
    }
  };

  // Image Upload Handlers
  const handleUploadSettingImage = async (key, file) => {
    if (!file) return;
    try {
      setUploadingImageKey(key);
      const res = await api.uploadImage(file);
      const updated = { ...settingsForm, [key]: res.imageUrl };
      setSettingsForm(updated);
      await api.updateSettings({ [key]: res.imageUrl });
      setSiteSettings(prev => ({ ...prev, [key]: res.imageUrl }));
      setSettingsSavedMsg(`Image updated and saved successfully!`);
      if (onDataUpdated) onDataUpdated();
      setTimeout(() => setSettingsSavedMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploadingImageKey('');
    }
  };

  const handleUploadMaterialImage = async (file) => {
    if (!file) return;
    try {
      setUploadingImageKey('material');
      const res = await api.uploadImage(file);
      setMatForm(prev => ({ ...prev, image_url: res.imageUrl }));
    } catch (err) {
      alert(err.message || 'Material photo upload failed');
    } finally {
      setUploadingImageKey('');
    }
  };

  const handleDirectMaterialImageUpload = async (materialId, file) => {
    if (!file) return;
    try {
      setUploadingImageKey(`mat-${materialId}`);
      const res = await api.uploadImage(file);
      await api.updateMaterial(materialId, { image_url: res.imageUrl });
      await loadAllAdminData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update material picture');
    } finally {
      setUploadingImageKey('');
    }
  };

  // Robust Material Matcher (matches exact, partial, or measurement fractions like 3/4, 20mm, M-Sand)
  const findMaterialMatch = (matName, matList = []) => {
    if (!matName || !matList || !matList.length) return null;
    const clean = matName.trim().toLowerCase();
    
    // 1. Exact match
    let found = matList.find(m => m.name.toLowerCase() === clean);
    if (found) return found;

    // 2. Mutual inclusion
    found = matList.find(m => {
      const mLow = m.name.toLowerCase();
      return clean.includes(mLow) || mLow.includes(clean);
    });
    if (found) return found;

    // 3. Size fraction / type token matching
    const fractions = ['3/4', '1/4', '1/2', '1 1/2', '20mm', '6mm', '12mm', '40mm', 'm-sand', 'p-sand', 'river', 'gravel', 'kraval', 'crusher', 'sengal', 'brick'];
    for (const frac of fractions) {
      if (clean.includes(frac)) {
        found = matList.find(m => m.name.toLowerCase().includes(frac));
        if (found) return found;
      }
    }
    return null;
  };

  // Compute price & amount for a delivery item (supports both materials and transport vehicles)
  const getDeliveryPricing = (del) => {
    const matchedMat = findMaterialMatch(del.material_name, materials);
    if (matchedMat) {
      const unitPrice = matchedMat.price || 0;
      const qty = parseFloat(del.quantity) || 1;
      return {
        isVehicle: false,
        unitPrice,
        estAmount: qty * unitPrice,
        unitLabel: matchedMat.unit || del.unit || 'Unit',
        matName: matchedMat.name
      };
    }

    const low = (del.material_name || '').toLowerCase();
    let vRate = 0;
    let isVehicle = false;
    if (low.includes('tractor')) {
      vRate = parseFloat(siteSettings.vehicle_tractor_rate) || 1200;
      isVehicle = true;
    } else if (low.includes('tipper') || low.includes('mini')) {
      vRate = parseFloat(siteSettings.vehicle_tipper_rate) || 1800;
      isVehicle = true;
    } else if (low.includes('lorry') || low.includes('heavy')) {
      vRate = parseFloat(siteSettings.vehicle_lorry_rate) || 3500;
      isVehicle = true;
    } else if (del.unit === 'Trip' || (del.additional_notes && del.additional_notes.includes('Vehicle Transport'))) {
      isVehicle = true;
      vRate = parseFloat(del.price) || 1500;
    }

    const unitPrice = vRate || (parseFloat(del.price) || 0);
    const qty = parseFloat(del.quantity) || 1;
    return {
      isVehicle,
      unitPrice,
      estAmount: qty * unitPrice,
      unitLabel: del.unit || (isVehicle ? 'Trip' : 'Unit'),
      matName: del.material_name || 'Vehicle Transport'
    };
  };

  // One-click conversion from Site Delivery to Invoice
  const handleBillDelivery = (del) => {
    const pricing = getDeliveryPricing(del);
    const qty = parseFloat(del.quantity) || 1;

    setBillingForm({
      user_id: del.user_id || '',
      customer_name: del.customer_name || '',
      customer_mobile: del.customer_mobile || '',
      customer_email: del.customer_email || '',
      customer_address: del.delivery_address?.split('\n')[0] || del.delivery_address || '',
      discount: 0,
      paid_amount: 0,
      payment_status: 'Unpaid',
      notes: pricing.isVehicle ? `Vehicle Transport Booking #${del.request_number}` : `Site Delivery Order #${del.request_number}`,
      items: [{
        material_name: pricing.matName,
        quantity: qty,
        unit: pricing.unitLabel,
        unit_price: pricing.unitPrice
      }]
    });
    setActiveSection('invoices');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // One-click conversion from Quotation to Invoice
  const handleBillQuote = (q) => {
    const matchedMat = findMaterialMatch(q.material_name, materials);
    const unitPrice = matchedMat ? matchedMat.price : (parseFloat(q.price) || 0);
    const qty = parseFloat(q.quantity) || 1;
    const matName = matchedMat ? matchedMat.name : (q.material_name || '');
    const unitName = q.unit || (matchedMat ? matchedMat.unit : 'Unit');

    setBillingForm({
      user_id: q.user_id || '',
      customer_name: q.customer_name || '',
      customer_mobile: q.customer_mobile || '',
      customer_email: q.customer_email || '',
      customer_address: q.delivery_location?.split('\n')[0] || q.delivery_location || '',
      discount: 0,
      paid_amount: 0,
      payment_status: 'Unpaid',
      notes: `Quotation Request #${q.request_number}`,
      items: [{
        material_name: matName,
        quantity: qty,
        unit: unitName,
        unit_price: unitPrice
      }]
    });
    setActiveSection('invoices');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Section 41: Auto-fill customer details when selected in Billing
  const handleSelectCustomerForBilling = (userId) => {
    const cust = customers.find(c => c.id.toString() === userId.toString());
    if (cust) {
      setBillingForm(prev => ({
        ...prev,
        user_id: cust.id,
        customer_name: cust.name || '',
        customer_mobile: cust.mobile || '',
        customer_email: cust.email || '',
        customer_address: cust.address || ''
      }));
    } else {
      setBillingForm(prev => ({ ...prev, user_id: '' }));
    }
  };

  // Billing Line Items Helpers
  const handleAddBillingItem = () => {
    setBillingForm(prev => ({
      ...prev,
      items: [...prev.items, { material_name: '', quantity: 1, unit: 'Unit', unit_price: '' }]
    }));
  };

  const handleRemoveBillingItem = (idx) => {
    setBillingForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  const handleBillingItemChange = (idx, field, value) => {
    setBillingForm(prev => {
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], [field]: value };

      // When material changed, auto populate unit and price if matched from catalog
      if (field === 'material_name' && value && value !== '__custom__') {
        const matched = materials.find(m => m.name === value);
        if (matched) {
          newItems[idx].unit_price = matched.price;
          newItems[idx].unit = matched.unit || 'Unit';
        }
      }
      return { ...prev, items: newItems };
    });
  };

  // Calculations
  const calculateBillingSubtotal = () => {
    return billingForm.items.reduce((sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0);
  };
  const billingSubtotal = calculateBillingSubtotal();
  const billingGrandTotal = Math.max(0, billingSubtotal - (parseFloat(billingForm.discount) || 0));
  const billingPaidAmount = Math.max(0, parseFloat(billingForm.paid_amount) || 0);
  const billingBalanceDue = Math.max(0, billingGrandTotal - billingPaidAmount);

  // Invoices filtered by payment status (Partially Paid includes 0 paid, Fully Paid)
  const partiallyPaidInvoices = invoices.filter(inv => {
    const paid = inv.paid_amount != null ? Number(inv.paid_amount) : (inv.payment_status === 'Paid' ? inv.grand_total : 0);
    return paid < inv.grand_total || inv.payment_status === 'Partial' || inv.payment_status === 'Unpaid';
  });

  const fullyPaidInvoices = invoices.filter(inv => {
    const paid = inv.paid_amount != null ? Number(inv.paid_amount) : (inv.payment_status === 'Paid' ? inv.grand_total : 0);
    return (paid >= inv.grand_total && inv.grand_total > 0) || (inv.payment_status === 'Paid' && paid >= inv.grand_total);
  });

  const filteredInvoices = invoiceSubTab === 'partial'
    ? partiallyPaidInvoices
    : invoiceSubTab === 'paid'
      ? fullyPaidInvoices
      : invoices;

  const totalOutstandingBalance = partiallyPaidInvoices.reduce((sum, inv) => {
    const paid = inv.paid_amount != null ? Number(inv.paid_amount) : (inv.payment_status === 'Paid' ? inv.grand_total : 0);
    return sum + Math.max(0, inv.grand_total - paid);
  }, 0);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!billingForm.items.length) {
      alert('Please add at least one material to the invoice.');
      return;
    }
    const hasEmptyItem = billingForm.items.some(it => !it.material_name || !it.material_name.trim());
    if (hasEmptyItem) {
      alert('Please select or enter a material name for all items.');
      return;
    }
    try {
      const paidVal = Math.max(0, parseFloat(billingForm.paid_amount) || 0);
      const res = await api.createInvoice({
        ...billingForm,
        discount: parseFloat(billingForm.discount) || 0,
        paid_amount: paidVal,
        payment_status: paidVal >= billingGrandTotal && billingGrandTotal > 0 ? 'Paid' : 'Partial'
      });
      setBillingSuccess(`Invoice ${res.invoice.invoice_number} generated successfully!`);
      loadAllAdminData();
      if (onViewInvoice) onViewInvoice(res.invoice);
      setTimeout(() => setBillingSuccess(''), 4000);
      setBillingForm({
        user_id: '',
        customer_name: '',
        customer_mobile: '',
        customer_email: '',
        customer_address: '',
        discount: 0,
        paid_amount: 0,
        payment_status: 'Unpaid',
        notes: '',
        items: []
      });
    } catch (err) {
      alert(err.message || 'Invoice generation failed');
    }
  };

  const handleOpenPaymentModal = (inv) => {
    setPaymentModalInvoice(inv);
    setPaymentModalPaidAmount(inv.paid_amount != null ? inv.paid_amount : (inv.payment_status === 'Paid' ? inv.grand_total : 0));
    setPaymentModalOpen(true);
  };

  const handleSavePaymentModal = async (e) => {
    e.preventDefault();
    if (!paymentModalInvoice) return;
    try {
      const paidVal = Math.max(0, parseFloat(paymentModalPaidAmount) || 0);
      const newStatus = paidVal >= paymentModalInvoice.grand_total && paymentModalInvoice.grand_total > 0 ? 'Paid' : 'Partial';
      await api.updateInvoicePaymentStatus(paymentModalInvoice.id, newStatus, paidVal);
      setPaymentModalOpen(false);
      setPaymentModalInvoice(null);
      loadAllAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update payment');
    }
  };

  // Material CRUD handlers
  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    try {
      if (matForm.id) {
        await api.updateMaterial(matForm.id, matForm);
      } else {
        await api.addMaterial(matForm);
      }
      setMatModalOpen(false);
      await loadAllAdminData();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      alert(err.message || 'Failed to save material');
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      await api.deleteMaterial(id);
      await loadAllAdminData();
      if (onDataUpdated) onDataUpdated();
    }
  };

  // Status updates
  const handleUpdateDeliveryStatus = async (id, status) => {
    await api.updateDeliveryStatus(id, status);
    loadAllAdminData();
  };

  const handleUpdateQuoteStatus = async (id, status) => {
    await api.updateQuote(id, { status });
    loadAllAdminData();
  };

  const handleUpdateInvoicePayment = async (id, payment_status, paid_amount) => {
    await api.updateInvoicePaymentStatus(id, payment_status, paid_amount);
    loadAllAdminData();
  };

  // Settings Save
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settingsForm);
      setSettingsSavedMsg('Business settings updated successfully!');
      if (onDataUpdated) onDataUpdated();
      setTimeout(() => setSettingsSavedMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: '#070e1b', color: '#f8fafc', position: 'relative', zIndex: 10 }}>
      
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 1100
          }}
          className="admin-backdrop"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`admin-portal-sidebar ${mobileSidebarOpen ? 'mobile-open' : ''}`}
      >
        {/* Sidebar Brand */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BrandLogo size={38} showRing={true} showAura={true} showShine={true} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#fff' }}>Sri Angalamman</div>
              <div style={{ fontSize: '0.68rem', color: '#fb923c', fontWeight: 800, letterSpacing: '0.06em' }}>ADMIN PORTAL</div>
            </div>
          </div>
          {mobileSidebarOpen && (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
              aria-label="Close Sidebar"
            >
              <CloseIcon size={20} />
            </button>
          )}
        </div>

        {/* Sidebar Nav Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {[
            { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'deliveries', label: 'Site Deliveries', icon: <Truck size={18} /> },
            { id: 'materials', label: 'Materials Catalog', icon: <Layers size={18} /> },
            { id: 'quotes', label: 'Quotation Requests', icon: <FileText size={18} /> },
            { id: 'invoices', label: 'Billing & Invoices', icon: <Receipt size={18} /> },
            { id: 'customers', label: 'Customer Directory & Logins', icon: <Users size={18} /> },
            { id: 'admins', label: 'Admin Users & Staff', icon: <ShieldCheck size={18} /> },
            { id: 'media', label: 'Website Pictures', icon: <ImageIcon size={18} /> },
            { id: 'reviews', label: 'Reviews & Feedback', icon: <Star size={18} /> },
            { id: 'settings', label: 'Business Settings', icon: <SettingsIcon size={18} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setMobileSidebarOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                border: 'none',
                background: activeSection === item.id ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' : 'transparent',
                color: activeSection === item.id ? '#ffffff' : '#94a3b8',
                fontWeight: activeSection === item.id ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s'
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            {admin?.profile_image ? (
              <img
                src={admin.profile_image}
                alt={admin.name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>
                {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{admin?.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>{admin?.role}</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#f87171',
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', minWidth: 0 }}>
        
        {/* Top Header */}
        <header className="admin-header" style={{
          height: '65px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(10, 18, 36, 0.95)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1.25rem',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="btn btn-outline btn-sm admin-mobile-toggle"
              style={{ padding: '0.4rem 0.65rem' }}
              aria-label="Toggle Navigation Menu"
            >
              {mobileSidebarOpen ? <CloseIcon size={18} /> : <Menu size={18} />}
            </button>
            <h2 style={{ fontSize: '1.15rem', color: '#fff', textTransform: 'capitalize', margin: 0 }}>
              {activeSection.replace('-', ' ')}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => loadAllAdminData(true)}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              title="Refresh all admin data"
            >
              <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              <span className="hidden-mobile-sm">{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
            >
              <ExternalLink size={13} /> <span className="hidden-mobile-sm">View Website</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="admin-content-body" style={{ padding: '1.5rem' }}>
          
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeSection === 'dashboard' && dashboardData && (
            <div>
              {/* Metric Cards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
              }}>
                {[
                  { label: 'Total Customers', val: dashboardData.metrics.totalCustomers, icon: <Users size={22} color="#38bdf8" /> },
                  { label: 'Pending Dispatches', val: dashboardData.metrics.pendingDeliveries, icon: <Truck size={22} color="#f97316" /> },
                  { label: 'Pending Quotes', val: dashboardData.metrics.pendingQuotes, icon: <FileText size={22} color="#eab308" /> },
                  { label: 'Total Revenue', val: `₹${dashboardData.metrics.totalRevenue.toLocaleString('en-IN')}`, icon: <DollarSign size={22} color="#10b981" /> },
                  { label: 'Available Materials', val: dashboardData.metrics.activeMaterials, icon: <Layers size={22} color="#a855f7" /> },
                ].map((m, i) => (
                  <div key={i} className="glass-card" style={{ padding: '1.25rem', borderRadius: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{m.label}</span>
                      <div style={{ padding: '0.35rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px' }}>{m.icon}</div>
                    </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff' }}>{m.val}</div>
                  </div>
                ))}
              </div>

              {/* Recent Dispatches & Quotes Table */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Recent Site Orders & Dispatches</h3>
                    <button 
                      onClick={() => setActiveSection('deliveries')} 
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
                    >
                      View All
                    </button>
                  </div>
                  {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {dashboardData.recentOrders.map(ord => (
                        <div key={`${ord.order_type || 'ord'}-${ord.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', fontSize: '0.85rem' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <strong style={{ color: '#38bdf8' }}>{ord.order_number}</strong>
                              <span style={{ fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px', background: ord.order_type === 'DELIVERY' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)', color: ord.order_type === 'DELIVERY' ? '#38bdf8' : '#34d399', fontWeight: 600 }}>
                                {ord.order_type === 'DELIVERY' ? 'Site Delivery' : 'Invoice'}
                              </span>
                            </div>
                            <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                              {ord.customer_name} ({ord.customer_mobile})
                            </div>
                            {ord.material_name && (
                              <div style={{ color: '#cbd5e1', fontSize: '0.78rem', marginTop: '2px' }}>
                                📦 {ord.quantity} {ord.unit || 'Ton'} of {ord.material_name}
                              </div>
                            )}
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            {ord.final_amount != null ? (
                              <div style={{ fontWeight: 700, color: '#fb923c', marginBottom: '2px' }}>₹{ord.final_amount.toLocaleString('en-IN')}</div>
                            ) : null}
                            <span className={`badge ${ord.status === 'Delivered' ? 'badge-green' : ord.status === 'Cancelled' ? 'badge-red' : 'badge-blue'}`}>
                              {ord.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No recent orders.</div>
                  )}
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Recent Quotation Inquiries</h3>
                    <button 
                      onClick={() => setActiveSection('quotes')} 
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem' }}
                    >
                      View All
                    </button>
                  </div>
                  {dashboardData.recentQuotes && dashboardData.recentQuotes.length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {dashboardData.recentQuotes.map(q => (
                        <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem 0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', fontSize: '0.85rem' }}>
                          <div>
                            <strong style={{ color: '#fb923c' }}>{q.request_number}</strong>
                            <div style={{ color: '#94a3b8', marginTop: '2px' }}>
                              {q.customer_name} ({q.customer_mobile})
                            </div>
                            <div style={{ color: '#cbd5e1', fontSize: '0.78rem', marginTop: '2px' }}>
                              💬 {q.quantity} {q.unit} of {q.material_name}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className={`badge ${q.status === 'Converted' ? 'badge-green' : 'badge-orange'}`}>{q.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No pending quote requests.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MATERIALS CATALOG MANAGEMENT (Section 21) */}
          {activeSection === 'materials' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Configure materials, dynamic prices, availability, and units.</p>
                <button
                  onClick={() => {
                    setMatForm({ id: null, name: '', category: 'Aggregates', price: '', unit: 'Load', description: '', available: 1, image_url: '/images/hero.jpg' });
                    setMatModalOpen(true);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Plus size={15} /> Add Material
                </button>
              </div>

              {/* Desktop Table View */}
              <div className="glass-card table-responsive-wrapper admin-desktop-table" style={{ borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Material</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Price (₹)</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Unit</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map((m) => (
                      <tr key={m.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#091122', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                            <img src={m.image_url || '/images/hero.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/images/hero.jpg'; }} />
                          </div>
                          <div>
                            <div>{m.name}</div>
                            <label style={{ fontSize: '0.72rem', color: '#38bdf8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '2px' }}>
                              <Upload size={11} />
                              <span>{uploadingImageKey === `mat-${m.id}` ? 'Uploading...' : 'Change Picture'}</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                style={{ display: 'none' }} 
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    handleDirectMaterialImageUpload(m.id, e.target.files[0]);
                                  }
                                }} 
                              />
                            </label>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{m.category}</td>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#38bdf8' }}>₹{m.price.toLocaleString('en-IN')}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>{m.unit}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {m.available ? <span className="badge badge-green">Available</span> : <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Temporarily Not Available</span>}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setMatForm(m);
                              setMatModalOpen(true);
                            }}
                            style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', marginRight: '0.75rem' }}
                            title="Edit"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMaterial(m.id)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View for Materials */}
              <div className="admin-mobile-cards">
                {materials.map((m) => (
                  <div key={m.id} className="glass-card" style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div style={{ position: 'relative', width: '54px', height: '54px', borderRadius: '10px', overflow: 'hidden', background: '#091122', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={m.image_url || '/images/hero.jpg'} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/images/hero.jpg'; }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.4rem' }}>
                          <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#fff', wordBreak: 'break-word' }}>{m.name}</h4>
                          {m.available ? <span className="badge badge-green" style={{ flexShrink: 0 }}>Available</span> : <span className="badge" style={{ flexShrink: 0, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Temporarily Not Available</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>Category: {m.category}</div>
                        <label style={{ fontSize: '0.72rem', color: '#38bdf8', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '4px' }}>
                          <Upload size={11} />
                          <span>{uploadingImageKey === `mat-${m.id}` ? 'Uploading...' : 'Change Picture'}</span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleDirectMaterialImageUpload(m.id, e.target.files[0]);
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Unit Rate: </span>
                        <strong style={{ fontSize: '1.05rem', color: '#38bdf8' }}>₹{m.price.toLocaleString('en-IN')}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}> / {m.unit}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.65rem' }}>
                      <button
                        onClick={() => {
                          setMatForm(m);
                          setMatModalOpen(true);
                        }}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(m.id)}
                        className="btn btn-sm"
                        style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: WEBSITE PICTURES & MEDIA MANAGEMENT */}
          {activeSection === 'media' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ImageIcon size={22} color="#38bdf8" />
                  Website Pictures & Media Management
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
                  Upload and manage pictures across Home, About, Vehicles, and Materials sections. All images are rendered with <code>object-fit: cover</code> to cleanly fill website containers with zero distortion.
                </p>
              </div>

              {settingsSavedMsg && (
                <div style={{ padding: '0.85rem 1.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#34d399', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  <span>{settingsSavedMsg}</span>
                </div>
              )}

              {/* 1. Home & About Picture Section */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '1.75rem' }}>
                
                {/* Home Hero Picture Card */}
                <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>Home Section (Hero Showcase)</h4>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Main visual frame on the top right of the homepage.</p>
                    </div>
                    <span className="badge badge-blue">Home Page</span>
                  </div>

                  {/* Image Preview Container */}
                  <div style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: '#091122',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    marginBottom: '1.25rem'
                  }}>
                    <img
                      src={settingsForm.hero_image || siteSettings.hero_image || '/images/hero.jpg'}
                      alt="Home Hero"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/images/hero.jpg'; }}
                    />
                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(7, 14, 27, 0.85)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
                      Auto-fitting (16:9)
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <label 
                      className="btn btn-primary btn-sm btn-shimmer" 
                      style={{ cursor: 'pointer', flex: 1, justifyContent: 'center' }}
                    >
                      <Upload size={15} />
                      <span>{uploadingImageKey === 'hero_image' ? 'Uploading...' : 'Upload Home Picture'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadSettingImage('hero_image', e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Image URL / Path e.g. /images/hero.jpg"
                      value={settingsForm.hero_image || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_image: e.target.value })}
                      onBlur={() => api.updateSettings({ hero_image: settingsForm.hero_image })}
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

                {/* About Us Picture Card */}
                <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: 700 }}>About Us Section Picture</h4>
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Fleet & facility showcase image in the About section.</p>
                    </div>
                    <span className="badge badge-orange">About Page</span>
                  </div>

                  {/* Image Preview Container */}
                  <div style={{
                    width: '100%',
                    height: '220px',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    background: '#091122',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    marginBottom: '1.25rem'
                  }}>
                    <img
                      src={settingsForm.about_image || siteSettings.about_image || '/images/about.jpg'}
                      alt="About Us"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/images/about.jpg'; }}
                    />
                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(7, 14, 27, 0.85)', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
                      Auto-fitting (16:9)
                    </div>
                  </div>

                  {/* Upload Controls */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <label 
                      className="btn btn-primary btn-sm btn-shimmer" 
                      style={{ cursor: 'pointer', flex: 1, justifyContent: 'center' }}
                    >
                      <Upload size={15} />
                      <span>{uploadingImageKey === 'about_image' ? 'Uploading...' : 'Upload About Picture'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadSettingImage('about_image', e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div style={{ marginTop: '0.75rem' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Image URL / Path e.g. /images/about.jpg"
                      value={settingsForm.about_image || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, about_image: e.target.value })}
                      onBlur={() => api.updateSettings({ about_image: settingsForm.about_image })}
                      style={{ fontSize: '0.82rem' }}
                    />
                  </div>
                </div>

              </div>

              {/* 2. Vehicles & Fleet Section Pictures */}
              <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '18px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>Vehicles & Fleet Section Pictures</h4>
                  <p style={{ fontSize: '0.84rem', color: '#94a3b8' }}>
                    Customize photos for each vehicle type in the fleet dispatch catalog.
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>
                  
                  {/* Vehicle 1: Tractor */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>
                      Hydraulic Tractor Trolley
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#fb923c', marginBottom: '0.85rem' }}>Narrow Street & Residential (1-2 Units)</div>
                    
                    <div style={{ width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', background: '#091122', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1rem' }}>
                      <img
                        src={settingsForm.vehicle_tractor_image || siteSettings.vehicle_tractor_image || '/images/tractor_trolley.jpg'}
                        alt="Tractor"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/images/tractor_trolley.jpg'; }}
                      />
                    </div>

                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                      <Upload size={14} />
                      <span>{uploadingImageKey === 'vehicle_tractor_image' ? 'Uploading...' : 'Upload Tractor Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadSettingImage('vehicle_tractor_image', e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Vehicle 2: Mini Tipper */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>
                      Mini Tipper Truck (4-Wheeler)
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '0.85rem' }}>Express Urban Delivery (2-3 Units)</div>
                    
                    <div style={{ width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', background: '#091122', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1rem' }}>
                      <img
                        src={settingsForm.vehicle_tipper_image || siteSettings.vehicle_tipper_image || '/images/fleet.jpg'}
                        alt="Mini Tipper"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/images/fleet.jpg'; }}
                      />
                    </div>

                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                      <Upload size={14} />
                      <span>{uploadingImageKey === 'vehicle_tipper_image' ? 'Uploading...' : 'Upload Tipper Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadSettingImage('vehicle_tipper_image', e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                  {/* Vehicle 3: Heavy Tipper */}
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', padding: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: '0.25rem' }}>
                      Multi-Axle Heavy Tipper Lorry
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', marginBottom: '0.85rem' }}>Bulk Commercial Supply (5-10 Units)</div>
                    
                    <div style={{ width: '100%', height: '160px', borderRadius: '10px', overflow: 'hidden', background: '#091122', border: '1px solid rgba(255, 255, 255, 0.1)', marginBottom: '1rem' }}>
                      <img
                        src={settingsForm.vehicle_lorry_image || siteSettings.vehicle_lorry_image || '/images/heavy_tipper.jpg'}
                        alt="Heavy Tipper"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = '/images/heavy_tipper.jpg'; }}
                      />
                    </div>

                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
                      <Upload size={14} />
                      <span>{uploadingImageKey === 'vehicle_lorry_image' ? 'Uploading...' : 'Upload Heavy Tipper Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadSettingImage('vehicle_lorry_image', e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>

                </div>
              </div>

              {/* 3. Materials Photos Management Shortcut */}
              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700 }}>Materials Catalog Pictures</h4>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                    Each material has individual photos (M-Sand, P-Sand, Aggregates, Bricks, etc.) that can be uploaded in the catalog.
                  </p>
                </div>
                <button
                  onClick={() => setActiveSection('materials')}
                  className="btn btn-primary btn-sm"
                >
                  <Layers size={16} /> Manage Materials Pictures
                </button>
              </div>

            </div>
          )}

          {/* TAB 3: SITE DELIVERIES MANAGEMENT */}
          {activeSection === 'deliveries' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                  Track, update, and dispatch tipper vehicle orders across Puducherry ({deliveries?.length || 0} total).
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setActiveSection('settings')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.78rem', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.4)' }}
                  >
                    <Truck size={13} /> Manage Vehicle Rates
                  </button>
                  <button
                    onClick={() => loadAllAdminData(true)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <RefreshCw size={12} /> Refresh Dispatches
                  </button>
                </div>
              </div>

              <div className="glass-card table-responsive-wrapper admin-desktop-table" style={{ borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Tracking ID</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Customer & Contact</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Material & Qty</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Booked Amount</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Site Delivery Address</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveries && deliveries.length > 0 ? (
                      deliveries.map((del) => {
                        const pricing = getDeliveryPricing(del);

                        return (
                          <tr key={del.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            {/* Column 1: Tracking ID */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 800, color: '#38bdf8' }}>{del.request_number}</div>
                              <div style={{ color: '#64748b', fontSize: '0.74rem', marginTop: '3px' }}>
                                {del.created_at ? new Date(del.created_at).toLocaleDateString('en-IN') : 'Recent'}
                              </div>
                            </td>

                            {/* Column 2: Customer & Contact */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ color: '#fff', fontWeight: 600 }}>{del.customer_name}</div>
                              <a 
                                href={`tel:${del.customer_mobile}`} 
                                style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                              >
                                <PhoneCall size={11} /> {del.customer_mobile}
                              </a>
                              {del.customer_email && (
                                <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '1px' }}>{del.customer_email}</div>
                              )}
                            </td>

                            {/* Column 3: Material / Vehicle & Qty */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ color: '#fff', fontWeight: 600 }}>
                                {pricing.isVehicle ? '🚛' : '📦'} {del.quantity} {pricing.unitLabel} of {del.material_name}
                              </div>
                              {del.preferred_date && (
                                <div style={{ color: '#60a5fa', fontSize: '0.75rem', marginTop: '3px', display: 'inline-flex', alignItems: 'center', gap: '3px', background: 'rgba(96, 165, 250, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                                  <Calendar size={11} /> {del.preferred_date}
                                </div>
                              )}
                              {del.additional_notes && (
                                <div 
                                  style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '3px', fontStyle: 'italic', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} 
                                  title={del.additional_notes}
                                >
                                  {del.additional_notes}
                                </div>
                              )}
                            </td>

                            {/* Column 4: Booked Amount */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ fontWeight: 800, color: pricing.estAmount > 0 ? '#fb923c' : '#94a3b8', fontSize: '1rem' }}>
                                {pricing.estAmount > 0 ? `₹${pricing.estAmount.toLocaleString('en-IN')}` : 'Rate TBD'}
                              </div>
                              {pricing.unitPrice > 0 && (
                                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                                  @ ₹{pricing.unitPrice.toLocaleString('en-IN')}/{pricing.unitLabel}
                                </div>
                              )}
                            </td>

                            {/* Column 5: Site Delivery Address */}
                            <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', maxWidth: '260px' }}>
                              <div style={{ wordBreak: 'break-word', fontSize: '0.83rem', lineHeight: 1.4 }}>
                                {del.delivery_address?.split('\n')[0] || del.delivery_address}
                              </div>
                              {del.delivery_address && del.delivery_address.match(/https?:\/\/[^\s\)]+/) && (
                                <a
                                  href={del.delivery_address.match(/https?:\/\/[^\s\)]+/)[0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '4px', 
                                    color: '#38bdf8', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 700, 
                                    marginTop: '5px', 
                                    textDecoration: 'none',
                                    background: 'rgba(56, 189, 248, 0.12)',
                                    padding: '2px 7px',
                                    borderRadius: '5px',
                                    border: '1px solid rgba(56, 189, 248, 0.25)'
                                  }}
                                >
                                  <MapPin size={11} /> Open Map <ExternalLink size={10} />
                                </a>
                              )}
                            </td>

                            {/* Column 6: Status */}
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className={`badge ${del.status === 'Delivered' ? 'badge-green' : del.status === 'Cancelled' ? 'badge-red' : del.status === 'Out for Delivery' ? 'badge-blue' : 'badge-orange'}`}>
                                {del.status}
                              </span>
                            </td>

                            {/* Column 7: Actions */}
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'flex-end' }}>
                                <select
                                  value={del.status}
                                  onChange={(e) => handleUpdateDeliveryStatus(del.id, e.target.value)}
                                  style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                                <button
                                  onClick={() => handleBillDelivery(del)}
                                  className="btn btn-outline btn-sm"
                                  style={{ fontSize: '0.74rem', padding: '0.32rem 0.6rem', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.4)' }}
                                  title="Auto-fill details and create invoice for this delivery"
                                >
                                  <Receipt size={13} /> Bill
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                          <Truck size={36} color="#38bdf8" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                          <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>No site delivery orders found</div>
                          <div style={{ fontSize: '0.82rem' }}>When customers book a delivery on the website, it will show here immediately.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View for Deliveries */}
              <div className="admin-mobile-cards">
                {deliveries && deliveries.length > 0 ? (
                  deliveries.map((del) => {
                    const pricing = getDeliveryPricing(del);

                    return (
                      <div key={del.id} className="glass-card" style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', gap: '0.5rem' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.92rem' }}>{del.request_number}</div>
                            <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>
                              {del.created_at ? new Date(del.created_at).toLocaleDateString('en-IN') : 'Recent'}
                            </div>
                          </div>
                          <span className={`badge ${del.status === 'Delivered' ? 'badge-green' : del.status === 'Cancelled' ? 'badge-red' : del.status === 'Out for Delivery' ? 'badge-blue' : 'badge-orange'}`} style={{ flexShrink: 0 }}>
                            {del.status}
                          </span>
                        </div>

                        <div style={{ padding: '0.65rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', marginBottom: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{del.customer_name}</span>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              {del.customer_mobile && (
                                <>
                                  <a
                                    href={`tel:${del.customer_mobile}`}
                                    style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    <PhoneCall size={11} /> Call
                                  </a>
                                  <a
                                    href={`https://wa.me/91${del.customer_mobile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                  >
                                    <MessageCircle size={11} /> WhatsApp
                                  </a>
                                </>
                              )}
                            </div>
                          </div>
                          {del.customer_email && (
                            <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>{del.customer_email}</div>
                          )}
                        </div>

                        {/* Material & Booked Amount Section */}
                        <div style={{ padding: '0.75rem', background: 'rgba(251, 146, 60, 0.08)', borderRadius: '10px', border: '1px solid rgba(251, 146, 60, 0.2)', marginBottom: '0.65rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                              {pricing.isVehicle ? '🚛' : '📦'} {del.quantity} {pricing.unitLabel} of {del.material_name}
                            </div>
                            <div style={{ fontWeight: 800, color: '#fb923c', fontSize: '1.05rem' }}>
                              {pricing.estAmount > 0 ? `₹${pricing.estAmount.toLocaleString('en-IN')}` : 'Rate TBD'}
                            </div>
                          </div>
                          {pricing.unitPrice > 0 && (
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{pricing.isVehicle ? 'Trip Rate:' : 'Catalog Rate:'}</span>
                              <span>₹{pricing.unitPrice.toLocaleString('en-IN')} / {pricing.unitLabel}</span>
                            </div>
                          )}
                          {del.preferred_date && (
                            <div style={{ color: '#60a5fa', fontSize: '0.74rem', marginTop: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={11} /> Preferred: {del.preferred_date}
                            </div>
                          )}
                          {del.additional_notes && (
                            <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '3px', fontStyle: 'italic' }}>
                              Note: {del.additional_notes}
                            </div>
                          )}
                        </div>

                        {del.delivery_address && (
                          <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '0.75rem' }}>
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Site Address:</div>
                            <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                              {del.delivery_address.split('\n')[0]}
                            </div>
                            {del.delivery_address.match(/https?:\/\/[^\s\)]+/) && (
                              <a
                                href={del.delivery_address.match(/https?:\/\/[^\s\)]+/)[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  color: '#38bdf8', 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700, 
                                  marginTop: '6px', 
                                  textDecoration: 'none',
                                  background: 'rgba(56, 189, 248, 0.12)',
                                  padding: '3px 8px',
                                  borderRadius: '5px',
                                  border: '1px solid rgba(56, 189, 248, 0.25)'
                                }}
                              >
                                <MapPin size={11} /> Open Location in Google Maps <ExternalLink size={10} />
                              </a>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem' }}>
                          <select
                            value={del.status}
                            onChange={(e) => handleUpdateDeliveryStatus(del.id, e.target.value)}
                            style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', flex: 1 }}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Processing">Processing</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button
                            onClick={() => handleBillDelivery(del)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.4)' }}
                          >
                            <Receipt size={13} /> Bill
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="glass-card" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8', borderRadius: '14px' }}>
                    <Truck size={36} color="#38bdf8" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>No site delivery orders found</div>
                    <div style={{ fontSize: '0.82rem' }}>When customers book a delivery on the website, it will show here immediately.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QUOTES MANAGEMENT */}
          {activeSection === 'quotes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                  Customer quotation requests and direct pricing inquiries ({quotes?.length || 0} total).
                </p>
                <button
                  onClick={() => loadAllAdminData(true)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.78rem' }}
                >
                  <RefreshCw size={12} /> Refresh Quotes
                </button>
              </div>

              <div className="glass-card table-responsive-wrapper admin-desktop-table" style={{ borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Ref #</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Customer & Contact</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Material & Qty</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Delivery Location</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes && quotes.length > 0 ? (
                      quotes.map((q) => (
                        <tr key={q.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          {/* Column 1: Ref # */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ fontWeight: 800, color: '#fb923c' }}>{q.request_number}</div>
                            <div style={{ color: '#64748b', fontSize: '0.74rem', marginTop: '3px' }}>
                              {q.created_at ? new Date(q.created_at).toLocaleDateString('en-IN') : 'Recent'}
                            </div>
                          </td>

                          {/* Column 2: Customer & Contact */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ color: '#fff', fontWeight: 600 }}>{q.customer_name}</div>
                            <a 
                              href={`tel:${q.customer_mobile}`} 
                              style={{ color: '#38bdf8', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}
                            >
                              <PhoneCall size={11} /> {q.customer_mobile}
                            </a>
                            {q.customer_email && (
                              <div style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '1px' }}>{q.customer_email}</div>
                            )}
                          </td>

                          {/* Column 3: Material & Qty */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ color: '#fff', fontWeight: 600 }}>
                              {q.quantity} {q.unit || 'Load'} of {q.material_name}
                            </div>
                            {q.message && (
                              <div 
                                style={{ color: '#94a3b8', fontSize: '0.74rem', marginTop: '3px', fontStyle: 'italic', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} 
                                title={q.message}
                              >
                                {q.message}
                              </div>
                            )}
                          </td>

                          {/* Column 4: Delivery Location */}
                          <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', maxWidth: '260px' }}>
                            <div style={{ wordBreak: 'break-word', fontSize: '0.83rem', lineHeight: 1.4 }}>
                              {q.delivery_location?.split('\n')[0] || q.delivery_location}
                            </div>
                            {q.delivery_location && q.delivery_location.match(/https?:\/\/[^\s\)]+/) && (
                              <a
                                href={q.delivery_location.match(/https?:\/\/[^\s\)]+/)[0]}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '4px', 
                                  color: '#38bdf8', 
                                  fontSize: '0.75rem', 
                                  fontWeight: 700, 
                                  marginTop: '5px', 
                                  textDecoration: 'none',
                                  background: 'rgba(56, 189, 248, 0.12)',
                                  padding: '2px 7px',
                                  borderRadius: '5px',
                                  border: '1px solid rgba(56, 189, 248, 0.25)'
                                }}
                              >
                                <MapPin size={11} /> Open Map <ExternalLink size={10} />
                              </a>
                            )}
                          </td>

                          {/* Column 5: Status */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className={`badge ${q.status === 'Converted' ? 'badge-green' : q.status === 'Closed' ? 'badge-red' : 'badge-orange'}`}>
                              {q.status}
                            </span>
                          </td>

                          {/* Column 6: Actions */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'flex-end' }}>
                              <select
                                value={q.status}
                                onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                                style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.35rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Contacted">Contacted</option>
                                <option value="Quoted">Quoted</option>
                                <option value="Converted">Converted</option>
                                <option value="Closed">Closed</option>
                              </select>
                              <button
                                onClick={() => handleBillQuote(q)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.74rem', padding: '0.32rem 0.6rem', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.4)' }}
                                title="Convert Quotation to Invoice"
                              >
                                <Receipt size={13} /> Bill
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8' }}>
                          <FileText size={36} color="#fb923c" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                          <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>No quotation inquiries found</div>
                          <div style={{ fontSize: '0.82rem' }}>When customers submit quote inquiries on the website, they will appear here immediately.</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View for Quotes */}
              <div className="admin-mobile-cards">
                {quotes && quotes.length > 0 ? (
                  quotes.map((q) => (
                    <div key={q.id} className="glass-card" style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 800, color: '#fb923c', fontSize: '0.92rem' }}>{q.request_number}</div>
                          <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>
                            {q.created_at ? new Date(q.created_at).toLocaleDateString('en-IN') : 'Recent'}
                          </div>
                        </div>
                        <span className={`badge ${q.status === 'Converted' ? 'badge-green' : q.status === 'Closed' ? 'badge-red' : 'badge-orange'}`} style={{ flexShrink: 0 }}>
                          {q.status}
                        </span>
                      </div>

                      <div style={{ padding: '0.65rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', marginBottom: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{q.customer_name}</span>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            {q.customer_mobile && (
                              <>
                                <a
                                  href={`tel:${q.customer_mobile}`}
                                  style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)', padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                >
                                  <PhoneCall size={11} /> Call
                                </a>
                                <a
                                  href={`https://wa.me/91${q.customer_mobile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.15)', padding: '0.3rem 0.5rem', borderRadius: '6px', fontSize: '0.74rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                >
                                  <MessageCircle size={11} /> WhatsApp
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                        {q.customer_email && (
                          <div style={{ color: '#94a3b8', fontSize: '0.74rem' }}>{q.customer_email}</div>
                        )}
                      </div>

                      <div style={{ marginBottom: '0.65rem' }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                          📋 {q.quantity} {q.unit || 'Load'} of {q.material_name}
                        </div>
                        {q.message && (
                          <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px', fontStyle: 'italic', wordBreak: 'break-word' }}>
                            "{q.message}"
                          </div>
                        )}
                      </div>

                      {q.delivery_location && (
                        <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '0.75rem' }}>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '2px' }}>Site Location:</div>
                          <div style={{ color: '#cbd5e1', fontSize: '0.8rem', lineHeight: 1.4, wordBreak: 'break-word' }}>
                            {q.delivery_location.split('\n')[0]}
                          </div>
                          {q.delivery_location.match(/https?:\/\/[^\s\)]+/) && (
                            <a
                              href={q.delivery_location.match(/https?:\/\/[^\s\)]+/)[0]}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                gap: '4px', 
                                color: '#38bdf8', 
                                fontSize: '0.75rem', 
                                fontWeight: 700, 
                                marginTop: '6px', 
                                textDecoration: 'none',
                                background: 'rgba(56, 189, 248, 0.12)',
                                padding: '3px 8px',
                                borderRadius: '5px',
                                border: '1px solid rgba(56, 189, 248, 0.25)'
                              }}
                            >
                              <MapPin size={11} /> Open Location in Google Maps <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem' }}>
                        <select
                          value={q.status}
                          onChange={(e) => handleUpdateQuoteStatus(q.id, e.target.value)}
                          style={{ background: '#0f172a', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '0.4rem 0.5rem', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer', flex: 1 }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <button
                          onClick={() => handleBillQuote(q)}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.4)' }}
                        >
                          <Receipt size={13} /> Bill
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-card" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8', borderRadius: '14px' }}>
                    <FileText size={36} color="#fb923c" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>No quotation inquiries found</div>
                    <div style={{ fontSize: '0.82rem' }}>When customers submit quote inquiries on the website, they will appear here immediately.</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: BILLING & INVOICE GENERATOR (Section 14 & 41) */}
          {activeSection === 'invoices' && (
            <div>
              {billingSuccess && (
                <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '10px', color: '#34d399', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  <span>{billingSuccess}</span>
                </div>
              )}

              {/* Invoice Generator Card with Customer Auto-Fill */}
              <div className="glass-card" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>
                  Generate New Tax Invoice
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                  Select an existing customer to auto-fill their contact & site location, or enter manually.
                </p>

                <form onSubmit={handleCreateInvoice}>
                  {/* Customer Selection Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Auto-Fill from Registered Customer</label>
                      <select
                        className="form-control"
                        value={billingForm.user_id}
                        onChange={(e) => handleSelectCustomerForBilling(e.target.value)}
                      >
                        <option value="">-- Manual / Site Delivery Customer Entry --</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.mobile || c.email})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Customer Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="Enter full customer name"
                        value={billingForm.customer_name}
                        onChange={(e) => setBillingForm({ ...billingForm, customer_name: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Customer Mobile *</label>
                      <input
                        type="tel"
                        required
                        className="form-control"
                        placeholder="e.g. 9876543210"
                        value={billingForm.customer_mobile}
                        onChange={(e) => setBillingForm({ ...billingForm, customer_mobile: e.target.value })}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Customer Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="e.g. client@example.com"
                        value={billingForm.customer_email || ''}
                        onChange={(e) => setBillingForm({ ...billingForm, customer_email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Site Delivery Address / Location</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Plot 42, Thilaspettai or Google Maps Location"
                      value={billingForm.customer_address}
                      onChange={(e) => setBillingForm({ ...billingForm, customer_address: e.target.value })}
                    />
                  </div>

                  {/* Multi-material items table */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <label className="form-label" style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                          Materials & Quantities
                        </label>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                          (Select material, edit rate/price freely, or add multiple items)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddBillingItem}
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                      >
                        <Plus size={14} /> Add Another Material
                      </button>
                    </div>

                    {billingForm.items.length === 0 ? (
                      <div style={{
                        padding: '2rem 1rem',
                        textAlign: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px dashed rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        color: '#94a3b8'
                      }}>
                        <Layers size={32} color="#38bdf8" style={{ margin: '0 auto 0.5rem auto', opacity: 0.6 }} />
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem', marginBottom: '0.3rem' }}>
                          No materials chosen yet
                        </div>
                        <div style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                          Click below to select materials from the catalog or enter a custom rate.
                        </div>
                        <button
                          type="button"
                          onClick={handleAddBillingItem}
                          className="btn btn-primary btn-sm"
                        >
                          <Plus size={14} /> Add Material to Invoice
                        </button>
                      </div>
                    ) : (
                      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
                        <div style={{ minWidth: '650px' }}>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '2.5fr 1fr 1fr 1.3fr 1.2fr 36px',
                            gap: '0.6rem',
                            padding: '0.4rem 0.6rem',
                            color: '#94a3b8',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            textTransform: 'uppercase'
                          }}>
                            <div>Material Item</div>
                            <div>Quantity</div>
                            <div>Unit</div>
                            <div>Rate / Unit Price (₹)</div>
                            <div style={{ textAlign: 'right' }}>Total (₹)</div>
                            <div></div>
                          </div>

                          {billingForm.items.map((it, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '2.5fr 1fr 1fr 1.3fr 1.2fr 36px',
                                gap: '0.6rem',
                                alignItems: 'center',
                                marginBottom: '0.5rem',
                                background: 'rgba(255,255,255,0.03)',
                                padding: '0.6rem',
                                borderRadius: '10px',
                                border: '1px solid rgba(255,255,255,0.06)'
                              }}
                            >
                              <div>
                                <select
                                  className="form-control"
                                  value={materials.some(m => m.name === it.material_name) ? it.material_name : (it.material_name ? '__custom__' : '')}
                                  onChange={(e) => {
                                    if (e.target.value === '__custom__') {
                                      handleBillingItemChange(idx, 'material_name', 'Custom Item');
                                    } else {
                                      handleBillingItemChange(idx, 'material_name', e.target.value);
                                    }
                                  }}
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  <option value="">-- Choose Material --</option>
                                  {materials.map(m => (
                                    <option key={m.id} value={m.name}>{m.name} (₹{m.price}/{m.unit})</option>
                                  ))}
                                  <option value="__custom__">Manual / Custom Material</option>
                                </select>
                                {(!materials.some(m => m.name === it.material_name) || it.material_name === 'Custom Item') && (
                                  <input
                                    type="text"
                                    placeholder="Enter material description"
                                    className="form-control"
                                    style={{ fontSize: '0.78rem', marginTop: '0.35rem', padding: '0.3rem 0.6rem' }}
                                    value={it.material_name === '__custom__' ? '' : it.material_name}
                                    onChange={(e) => handleBillingItemChange(idx, 'material_name', e.target.value)}
                                  />
                                )}
                              </div>

                              <div>
                                <input
                                  type="number"
                                  min="0.1"
                                  step="any"
                                  required
                                  className="form-control"
                                  placeholder="Qty"
                                  style={{ fontSize: '0.82rem' }}
                                  value={it.quantity}
                                  onChange={(e) => handleBillingItemChange(idx, 'quantity', e.target.value)}
                                />
                              </div>

                              <div>
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="e.g. Load"
                                  style={{ fontSize: '0.82rem' }}
                                  value={it.unit}
                                  onChange={(e) => handleBillingItemChange(idx, 'unit', e.target.value)}
                                />
                              </div>

                              <div>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  required
                                  className="form-control"
                                  placeholder="Price (₹)"
                                  style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38bdf8' }}
                                  value={it.unit_price}
                                  onChange={(e) => handleBillingItemChange(idx, 'unit_price', e.target.value)}
                                />
                              </div>

                              <div style={{ fontWeight: 800, color: '#38bdf8', textAlign: 'right', fontSize: '0.9rem' }}>
                                ₹{((parseFloat(it.quantity) || 0) * (parseFloat(it.unit_price) || 0)).toLocaleString('en-IN')}
                              </div>

                              <div style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBillingItem(idx)}
                                  style={{
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#f87171',
                                    borderRadius: '6px',
                                    width: '28px',
                                    height: '28px',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1rem',
                                    lineHeight: 1
                                  }}
                                  title="Remove item"
                                >
                                  &times;
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calculations and Finalize */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0, width: '150px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Discount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="form-control"
                          placeholder="0"
                          value={billingForm.discount}
                          onChange={(e) => setBillingForm({ ...billingForm, discount: e.target.value })}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: 0, width: '180px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>
                          Paid Amount (₹) *
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          className="form-control"
                          placeholder="Amount paid"
                          style={{ borderColor: 'rgba(52, 211, 153, 0.4)', fontWeight: 700, color: '#34d399' }}
                          value={billingForm.paid_amount}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = parseFloat(val) || 0;
                            const st = (num >= billingGrandTotal && billingGrandTotal > 0) ? 'Paid' : (num > 0 ? 'Partial' : 'Unpaid');
                            setBillingForm({ ...billingForm, paid_amount: val, payment_status: st });
                          }}
                        />
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '3px' }}>
                          Enter ₹0 if not paid yet
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0, width: '140px' }}>
                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Payment Status</label>
                        <select
                          className="form-control"
                          value={billingForm.payment_status}
                          onChange={(e) => setBillingForm({ ...billingForm, payment_status: e.target.value })}
                        >
                          <option value="Paid">Paid</option>
                          <option value="Partial">Partial</option>
                          <option value="Unpaid">Unpaid</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '220px' }}>
                      <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '2px' }}>
                        Subtotal: ₹{billingSubtotal.toLocaleString('en-IN')}
                      </div>
                      {parseFloat(billingForm.discount) > 0 && (
                        <div style={{ fontSize: '0.82rem', color: '#f87171', marginBottom: '2px' }}>
                          Discount: -₹{parseFloat(billingForm.discount).toLocaleString('en-IN')}
                        </div>
                      )}
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb923c', marginBottom: '4px' }}>
                        Grand Total: ₹{billingGrandTotal.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399', marginBottom: '2px' }}>
                        Paid by Customer: ₹{billingPaidAmount.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 800, color: billingBalanceDue > 0 ? '#f87171' : '#10b981', marginBottom: '0.75rem' }}>
                        Pending Balance: ₹{billingBalanceDue.toLocaleString('en-IN')}
                      </div>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <Receipt size={16} /> Generate & Save Invoice
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Invoices List Header & Sub-sections */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: '#fff', margin: '0 0 0.25rem 0' }}>Issued Invoices & Payments</h3>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: 0 }}>
                      Filter by payment completion, track pending balances, or edit customer payments.
                    </p>
                  </div>
                  <button
                    onClick={() => loadAllAdminData(true)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <RefreshCw size={12} /> Refresh Invoices
                  </button>
                </div>

                {/* Sub-section Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                  <button
                    onClick={() => setInvoiceSubTab('all')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: invoiceSubTab === 'all' ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : 'rgba(255,255,255,0.04)',
                      color: invoiceSubTab === 'all' ? '#fff' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Receipt size={14} />
                    All Invoices ({invoices.length})
                  </button>

                  <button
                    onClick={() => setInvoiceSubTab('partial')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: invoiceSubTab === 'partial' ? 'linear-gradient(135deg, #d97706, #f59e0b)' : 'rgba(255,255,255,0.04)',
                      color: invoiceSubTab === 'partial' ? '#fff' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Clock size={14} />
                    Partially Paid / Pending ({partiallyPaidInvoices.length})
                  </button>

                  <button
                    onClick={() => setInvoiceSubTab('paid')}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: invoiceSubTab === 'paid' ? 'linear-gradient(135deg, #059669, #10b981)' : 'rgba(255,255,255,0.04)',
                      color: invoiceSubTab === 'paid' ? '#fff' : '#94a3b8',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Fully Paid ({fullyPaidInvoices.length})
                  </button>
                </div>
              </div>

              {/* Outstanding balance banner if viewing partially paid */}
              {invoiceSubTab === 'partial' && partiallyPaidInvoices.length > 0 && (
                <div style={{
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  <div>
                    <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.92rem' }}>
                      Pending Balances Across {partiallyPaidInvoices.length} Customer Invoices
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '2px' }}>
                      Includes customers with ₹0 paid and customers with remaining dues. Click "Edit Payment" to record payments.
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Due: </span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fb923c' }}>
                      ₹{totalOutstandingBalance.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              )}

              {/* Desktop Table View for Invoices */}
              <div className="glass-card table-responsive-wrapper admin-desktop-table" style={{ borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Invoice #</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Date</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Amount Paid</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Balance Due</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Payment Status</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.length > 0 ? (
                      filteredInvoices.map((inv) => {
                        const paid = inv.paid_amount != null ? Number(inv.paid_amount) : (inv.payment_status === 'Paid' ? inv.grand_total : 0);
                        const balanceDue = Math.max(0, inv.grand_total - paid);
                        return (
                          <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#38bdf8' }}>{inv.invoice_number}</td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <div style={{ color: '#fff', fontWeight: 600 }}>{inv.customer_name}</div>
                              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{inv.customer_mobile}</div>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{new Date(inv.created_at).toLocaleDateString()}</td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fb923c' }}>
                              ₹{inv.grand_total.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#34d399' }}>
                              ₹{paid.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: balanceDue > 0 ? '#f87171' : '#10b981' }}>
                              ₹{balanceDue.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '0.85rem 1rem' }}>
                              <span className={`badge ${inv.payment_status === 'Paid' ? 'badge-green' : inv.payment_status === 'Partial' ? 'badge-orange' : 'badge-red'}`}>
                                {inv.payment_status}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleOpenPaymentModal(inv)}
                                  className="btn btn-outline btn-sm"
                                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                                  title="Edit amount paid by customer"
                                >
                                  <DollarSign size={13} /> Edit Payment
                                </button>
                                <button
                                  onClick={() => onViewInvoice(inv)}
                                  className="btn btn-outline btn-sm"
                                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                                >
                                  <Printer size={13} /> Print / PDF
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#94a3b8' }}>
                          No invoices match the current filter ({invoiceSubTab === 'partial' ? 'Partially Paid / Pending' : invoiceSubTab === 'paid' ? 'Fully Paid' : 'All'}).
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View for Invoices */}
              <div className="admin-mobile-cards">
                {filteredInvoices && filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv) => {
                    const paid = inv.paid_amount != null ? Number(inv.paid_amount) : (inv.payment_status === 'Paid' ? inv.grand_total : 0);
                    const balanceDue = Math.max(0, inv.grand_total - paid);
                    return (
                      <div key={inv.id} className="glass-card" style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                          <div>
                            <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.92rem' }}>{inv.invoice_number}</div>
                            <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '2px' }}>
                              {new Date(inv.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </div>
                          </div>
                          <span className={`badge ${inv.payment_status === 'Paid' ? 'badge-green' : inv.payment_status === 'Partial' ? 'badge-orange' : 'badge-red'}`}>
                            {inv.payment_status}
                          </span>
                        </div>

                        <div style={{ padding: '0.65rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', marginBottom: '0.65rem' }}>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem' }}>{inv.customer_name}</div>
                          {inv.customer_mobile && (
                            <div style={{ color: '#94a3b8', fontSize: '0.78rem', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <PhoneCall size={11} color="#38bdf8" /> {inv.customer_mobile}
                            </div>
                          )}
                        </div>

                        {/* Amount breakdown */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.6rem', borderRadius: '8px', marginBottom: '0.75rem', textAlign: 'center' }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Total Bill</div>
                            <div style={{ fontWeight: 800, color: '#fb923c', fontSize: '0.88rem' }}>
                              ₹{inv.grand_total.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Paid</div>
                            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.88rem' }}>
                              ₹{paid.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Balance Due</div>
                            <div style={{ fontWeight: 800, color: balanceDue > 0 ? '#f87171' : '#10b981', fontSize: '0.88rem' }}>
                              ₹{balanceDue.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem' }}>
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="btn btn-outline btn-sm"
                            style={{ flex: 1, fontSize: '0.76rem', padding: '0.4rem 0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)' }}
                          >
                            <DollarSign size={13} /> Edit Payment
                          </button>
                          <button
                            onClick={() => onViewInvoice(inv)}
                            className="btn btn-outline btn-sm"
                            style={{ flex: 1, fontSize: '0.76rem', padding: '0.4rem 0.5rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                          >
                            <Printer size={13} /> Print / PDF
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="glass-card" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8', borderRadius: '14px' }}>
                    <Receipt size={36} color="#38bdf8" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                    <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.25rem' }}>
                      No invoices found in this view
                    </div>
                    <div style={{ fontSize: '0.82rem' }}>
                      {invoiceSubTab === 'partial' ? 'No partially paid or pending invoices.' : invoiceSubTab === 'paid' ? 'No fully paid invoices yet.' : 'Generate an invoice using the form above.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: CUSTOMER DIRECTORY & LOGIN TRACKER */}
          {activeSection === 'customers' && (
            <div>
              {/* Top Metrics Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Logged-In Customers</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCheck size={24} />
                    {customers.filter(c => (c.login_count > 0 || c.last_login)).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Customers with active web logins</div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Registered Accounts</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={24} />
                    {customers.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>All customer profiles in database</div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #f97316' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Google Verified Logins</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fb923c', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Globe size={24} />
                    {customers.filter(c => c.is_google_user).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>OAuth 1-click Google users</div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Active in Last 7 Days</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#c4b5fd', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={24} />
                    {customers.filter(c => c.last_login && (new Date() - new Date(c.last_login)) < 7 * 86400000).length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Recent site sessions</div>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {[
                    { id: 'all', label: `All Accounts (${customers.length})`, icon: <Users size={14} /> },
                    { id: 'customers', label: `Customers (${customers.filter(c => !c.role || c.role === 'CUSTOMER').length})`, icon: <UserCheck size={14} /> },
                    { id: 'admins', label: `Staff & Admins (${customers.filter(c => c.role === 'ADMIN' || c.role === 'SUPER_ADMIN').length})`, icon: <ShieldCheck size={14} /> },
                    { id: 'logged_in', label: `Logged-In (${customers.filter(c => (c.login_count > 0 || c.last_login)).length})`, icon: <UserCheck size={14} /> },
                    { id: 'google', label: `Google (${customers.filter(c => c.is_google_user).length})`, icon: <Globe size={14} /> },
                    { id: 'email', label: `Email Accounts (${customers.filter(c => !c.is_google_user).length})`, icon: <Mail size={14} /> },
                    { id: 'recent', label: `Active (7 Days) (${customers.filter(c => c.last_login && (new Date() - new Date(c.last_login)) < 7 * 86400000).length})`, icon: <Clock size={14} /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setCustomerFilterTab(tab.id)}
                      style={{
                        padding: '0.45rem 0.9rem',
                        borderRadius: '9999px',
                        border: '1px solid',
                        borderColor: customerFilterTab === tab.id ? '#2563eb' : 'rgba(255, 255, 255, 0.12)',
                        background: customerFilterTab === tab.id ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                        color: customerFilterTab === tab.id ? '#60a5fa' : '#94a3b8',
                        fontWeight: customerFilterTab === tab.id ? 700 : 500,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.15s'
                      }}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: '240px', flex: '1 1 240px', maxWidth: '400px' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search name, mobile, email..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      style={{ paddingLeft: '2.25rem', fontSize: '0.84rem', padding: '0.55rem 0.75rem 0.55rem 2.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Customer Directory Table */}
              <div className="glass-card table-responsive-wrapper admin-desktop-table" style={{ borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.9rem 1rem' }}>User / Customer Profile</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Login Method</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Mobile / Phone</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Login Count</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Last Login Timestamp</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter((c) => {
                        // Tab filters
                        if (customerFilterTab === 'customers' && (c.role === 'ADMIN' || c.role === 'SUPER_ADMIN')) return false;
                        if (customerFilterTab === 'admins' && !(c.role === 'ADMIN' || c.role === 'SUPER_ADMIN')) return false;
                        if (customerFilterTab === 'logged_in' && !(c.login_count > 0 || c.last_login)) return false;
                        if (customerFilterTab === 'google' && !c.is_google_user) return false;
                        if (customerFilterTab === 'email' && c.is_google_user) return false;
                        if (customerFilterTab === 'recent') {
                          if (!c.last_login) return false;
                          const diff = new Date() - new Date(c.last_login);
                          if (diff > 7 * 86400000) return false;
                        }
                        // Search query
                        if (customerSearch) {
                          const q = customerSearch.toLowerCase();
                          const matchName = c.name && c.name.toLowerCase().includes(q);
                          const matchEmail = c.email && c.email.toLowerCase().includes(q);
                          const matchMobile = c.mobile && c.mobile.toLowerCase().includes(q);
                          const matchAddr = c.address && c.address.toLowerCase().includes(q);
                          return matchName || matchEmail || matchMobile || matchAddr;
                        }
                        return true;
                      })
                      .map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          {/* Customer Profile */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              {c.profile_image ? (
                                <img
                                  src={c.profile_image}
                                  alt={c.name}
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(59, 130, 246, 0.5)' }}
                                />
                              ) : (
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: c.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                  color: '#fff',
                                  flexShrink: 0
                                }}>
                                  {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                              )}
                              <div>
                                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                                  <span>{c.name || 'Anonymous User'}</span>
                                  {c.role && c.role !== 'CUSTOMER' && (
                                    <span style={{ fontSize: '0.62rem', background: '#dc2626', color: '#fff', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 800 }}>
                                      {c.role}
                                    </span>
                                  )}
                                </div>
                                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{c.email}</div>
                              </div>
                            </div>
                          </td>

                          {/* Login Method */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {c.is_google_user ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.28rem 0.65rem',
                                borderRadius: '9999px',
                                background: 'rgba(234, 67, 53, 0.12)',
                                border: '1px solid rgba(234, 67, 53, 0.3)',
                                color: '#f87171',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <Globe size={12} /> Google Account
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                padding: '0.28rem 0.65rem',
                                borderRadius: '9999px',
                                background: 'rgba(56, 189, 248, 0.12)',
                                border: '1px solid rgba(56, 189, 248, 0.3)',
                                color: '#38bdf8',
                                fontSize: '0.75rem',
                                fontWeight: 700
                              }}>
                                <Mail size={12} /> Email & Password
                              </span>
                            )}
                          </td>

                          {/* Mobile */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {c.mobile ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.86rem' }}>+91 {c.mobile}</span>
                                <a
                                  href={`tel:${c.mobile}`}
                                  title="Call Customer"
                                  style={{ color: '#38bdf8', padding: '2px', display: 'inline-flex' }}
                                >
                                  <PhoneCall size={13} />
                                </a>
                                <a
                                  href={`https://wa.me/91${c.mobile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="WhatsApp Customer"
                                  style={{ color: '#10b981', padding: '2px', display: 'inline-flex' }}
                                >
                                  <MessageCircle size={13} />
                                </a>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.76rem', color: '#f87171', fontStyle: 'italic' }}>Pending Verification</span>
                            )}
                          </td>

                          {/* Login Frequency Count */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.25rem 0.6rem',
                              borderRadius: '6px',
                              background: (c.login_count || 0) > 3 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: (c.login_count || 0) > 3 ? '#34d399' : '#e2e8f0',
                              fontWeight: 700,
                              fontSize: '0.8rem'
                            }}>
                              <Clock size={12} />
                              {(c.login_count || 1)} {c.login_count === 1 ? 'Login' : 'Logins'}
                            </span>
                          </td>

                          {/* Last Login Timestamp */}
                          <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', fontSize: '0.82rem' }}>
                            {c.last_login ? (
                              <div>
                                <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                                  {new Date(c.last_login).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                                  {new Date(c.last_login).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#64748b' }}>No session recorded</span>
                            )}
                          </td>

                          {/* Status */}
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <button
                              onClick={async () => {
                                const newStatus = c.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                                if (window.confirm(`Set status of ${c.name} to ${newStatus}?`)) {
                                  await api.toggleCustomerStatus(c.id, newStatus);
                                  loadAllAdminData();
                                }
                              }}
                              style={{
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                padding: 0
                              }}
                              title="Click to toggle status"
                            >
                              <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer' }}>
                                {c.status}
                              </span>
                            </button>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={async () => {
                                  try {
                                    setCustomerModalLoading(true);
                                    setCustomerModalOpen(true);
                                    const details = await api.getCustomerDetails(c.id);
                                    setSelectedCustomerDetail(details);
                                  } catch (err) {
                                    alert(err.message || 'Failed to load customer profile');
                                  } finally {
                                    setCustomerModalLoading(false);
                                  }
                                }}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
                                title="View Login Sessions & Orders"
                              >
                                <Eye size={13} /> Activity
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {customers.length === 0 && (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          No customer accounts found yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View for Customers */}
              <div className="admin-mobile-cards">
                {customers
                  .filter((c) => {
                    if (customerFilterTab === 'customers' && (c.role === 'ADMIN' || c.role === 'SUPER_ADMIN')) return false;
                    if (customerFilterTab === 'admins' && !(c.role === 'ADMIN' || c.role === 'SUPER_ADMIN')) return false;
                    if (customerFilterTab === 'logged_in' && !(c.login_count > 0 || c.last_login)) return false;
                    if (customerFilterTab === 'google' && !c.is_google_user) return false;
                    if (customerFilterTab === 'email' && c.is_google_user) return false;
                    if (customerFilterTab === 'recent') {
                      if (!c.last_login) return false;
                      const diff = new Date() - new Date(c.last_login);
                      if (diff > 7 * 86400000) return false;
                    }
                    if (customerSearch) {
                      const q = customerSearch.toLowerCase();
                      const matchName = c.name && c.name.toLowerCase().includes(q);
                      const matchEmail = c.email && c.email.toLowerCase().includes(q);
                      const matchMobile = c.mobile && c.mobile.toLowerCase().includes(q);
                      const matchAddr = c.address && c.address.toLowerCase().includes(q);
                      return matchName || matchEmail || matchMobile || matchAddr;
                    }
                    return true;
                  })
                  .map((c) => (
                    <div key={c.id} className="glass-card" style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                        {c.profile_image ? (
                          <img
                            src={c.profile_image}
                            alt={c.name}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid rgba(59, 130, 246, 0.5)', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: c.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            color: '#fff',
                            flexShrink: 0
                          }}>
                            {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.35rem' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', wordBreak: 'break-word' }}>
                                {c.name || 'Anonymous User'}
                              </div>
                              {c.role && c.role !== 'CUSTOMER' && (
                                <span style={{ fontSize: '0.65rem', background: '#dc2626', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 800 }}>
                                  {c.role}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={async () => {
                                const newStatus = c.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                                if (window.confirm(`Set status of ${c.name} to ${newStatus}?`)) {
                                  await api.toggleCustomerStatus(c.id, newStatus);
                                  loadAllAdminData();
                                }
                              }}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                              title="Click to toggle status"
                            >
                              <span className={`badge ${c.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer' }}>
                                {c.status}
                              </span>
                            </button>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px', wordBreak: 'break-all' }}>{c.email}</div>
                        </div>
                      </div>

                      <div style={{ padding: '0.6rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', marginBottom: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            {c.mobile ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.84rem' }}>+91 {c.mobile}</span>
                                <a
                                  href={`tel:${c.mobile}`}
                                  style={{ color: '#38bdf8', padding: '2px', display: 'inline-flex' }}
                                  title="Call"
                                >
                                  <PhoneCall size={12} />
                                </a>
                                <a
                                  href={`https://wa.me/91${c.mobile}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{ color: '#10b981', padding: '2px', display: 'inline-flex' }}
                                  title="WhatsApp"
                                >
                                  <MessageCircle size={12} />
                                </a>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.74rem', color: '#f87171', fontStyle: 'italic' }}>Pending Verification</span>
                            )}
                          </div>
                          <div>
                            {c.is_google_user ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(234, 67, 53, 0.12)', border: '1px solid rgba(234, 67, 53, 0.3)', color: '#f87171', fontSize: '0.7rem', fontWeight: 700 }}>
                                <Globe size={10} /> Google
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '0.7rem', fontWeight: 700 }}>
                                <Mail size={10} /> Email
                              </span>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '0.35rem' }}>
                          <span>Logins: <strong style={{ color: (c.login_count || 0) > 3 ? '#34d399' : '#e2e8f0' }}>{c.login_count || 1}</strong></span>
                          <span>Last: <strong style={{ color: '#f8fafc' }}>{c.last_login ? new Date(c.last_login).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Never'}</strong></span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem' }}>
                        <button
                          onClick={async () => {
                            try {
                              setCustomerModalLoading(true);
                              setCustomerModalOpen(true);
                              const details = await api.getCustomerDetails(c.id);
                              setSelectedCustomerDetail(details);
                            } catch (err) {
                              alert(err.message || 'Failed to load customer profile');
                            } finally {
                              setCustomerModalLoading(false);
                            }
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Eye size={12} /> Activity
                        </button>
                      </div>
                    </div>
                  ))}
                {customers.length === 0 && (
                  <div className="glass-card" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8', borderRadius: '14px' }}>
                    <Users size={36} color="#38bdf8" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                    <div style={{ color: '#fff', fontWeight: 600 }}>No customer accounts found yet</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: REVIEWS MODERATION */}
          {activeSection === 'reviews' && (
            <div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Approve testimonials for public display on the homepage.
              </p>

              <div className="glass-card table-responsive-wrapper" style={{ borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Rating</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Feedback</th>
                      <th style={{ padding: '0.85rem 1rem' }}>Visibility</th>
                      <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: '#fff' }}>{r.customer_name}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#f59e0b', fontWeight: 700 }}>★ {r.rating}/5</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1', maxWidth: '350px' }}>"{r.comment}"</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {r.is_approved ? <span className="badge badge-green">Public</span> : <span className="badge badge-orange">Pending</span>}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <button
                            onClick={() => api.approveReview(r.id, !r.is_approved).then(loadAllAdminData)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.78rem', marginRight: '0.5rem' }}
                          >
                            {r.is_approved ? 'Hide' : 'Approve'}
                          </button>
                          <button
                            onClick={() => api.deleteReview(r.id).then(loadAllAdminData)}
                            style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: ADMIN USERS & STAFF MANAGEMENT */}
          {activeSection === 'admins' && (
            <div>
              {/* Top Metrics Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Total Administrators</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <ShieldCheck size={24} />
                    {adminUsers.length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>All staff & admin accounts</div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Active Admins</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserCheck size={24} />
                    {adminUsers.filter(a => a.status === 'ACTIVE').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Enabled credentials</div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Super Admins</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Shield size={24} />
                    {adminUsers.filter(a => a.role === 'SUPER_ADMIN').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Full management privilege</div>
                </div>

                <div className="glass-card" style={{ padding: '1.25rem', borderRadius: '12px', borderLeft: '4px solid #f97316' }}>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Your Current Role</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb923c', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Key size={20} />
                    {admin.role}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{admin.email}</div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: '1 1 300px', maxWidth: '420px' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search admin name or email..."
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      style={{ paddingLeft: '2.25rem', fontSize: '0.84rem' }}
                    />
                  </div>

                  <select
                    className="form-control"
                    value={adminRoleFilter}
                    onChange={(e) => setAdminRoleFilter(e.target.value)}
                    style={{ width: '140px', fontSize: '0.84rem' }}
                  >
                    <option value="All">All Roles</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff</option>
                  </select>
                </div>

                <button onClick={() => setAdminModalOpen(true)} className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
                  <Plus size={16} /> Add New Administrator
                </button>
              </div>

              {/* Admins Table */}
              <div className="glass-card table-responsive-wrapper admin-desktop-table" style={{ borderRadius: '14px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <th style={{ padding: '0.9rem 1rem' }}>Administrator</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Email Address</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Role Permission</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Status</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Last Login</th>
                      <th style={{ padding: '0.9rem 1rem' }}>Date Created</th>
                      <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers
                      .filter((a) => {
                        if (adminRoleFilter !== 'All' && a.role !== adminRoleFilter) return false;
                        if (adminSearch) {
                          const q = adminSearch.toLowerCase();
                          return (a.name && a.name.toLowerCase().includes(q)) || (a.email && a.email.toLowerCase().includes(q));
                        }
                        return true;
                      })
                      .map((a) => (
                        <tr key={a.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '50%',
                                background: a.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                border: '1.5px solid rgba(255, 255, 255, 0.15)'
                              }}>
                                {a.name ? a.name.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#fff' }}>{a.name}</div>
                                {a.id === admin.id && <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>(You)</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{a.email}</td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <span className={`badge ${a.role === 'SUPER_ADMIN' ? 'badge-red' : a.role === 'ADMIN' ? 'badge-blue' : 'badge-green'}`}>
                              {a.role}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <button
                              onClick={async () => {
                                if (a.id === admin.id) {
                                  alert('You cannot deactivate your own account.');
                                  return;
                                }
                                const newStatus = a.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                                if (window.confirm(`Set status of ${a.name} to ${newStatus}?`)) {
                                  await api.updateAdmin(a.id, { status: newStatus });
                                  loadAllAdminData();
                                }
                              }}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                              title="Click to toggle status"
                            >
                              <span className={`badge ${a.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer' }}>
                                {a.status}
                              </span>
                            </button>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#94a3b8', fontSize: '0.82rem' }}>
                            {a.last_login ? new Date(a.last_login).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : 'Never'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                            {a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN') : '-'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                              <button
                                onClick={() => {
                                  setEditAdminForm({
                                    id: a.id,
                                    name: a.name,
                                    email: a.email,
                                    role: a.role,
                                    status: a.status,
                                    password: ''
                                  });
                                  setEditAdminModalOpen(true);
                                }}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.78rem' }}
                                title="Edit Admin & Reset Password"
                              >
                                <Edit3 size={14} /> Edit
                              </button>
                              {a.id !== admin.id && (
                                <button
                                  onClick={async () => {
                                    if (window.confirm(`Are you sure you want to permanently delete admin account for ${a.name} (${a.email})?`)) {
                                      try {
                                        await api.deleteAdmin(a.id);
                                        loadAllAdminData();
                                      } catch (err) {
                                        alert(err.message || 'Failed to delete admin');
                                      }
                                    }
                                  }}
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '0.35rem 0.6rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171' }}
                                  title="Delete Admin"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View for Admin Users & Staff */}
              <div className="admin-mobile-cards">
                {adminUsers
                  .filter((a) => {
                    if (adminRoleFilter !== 'All' && a.role !== adminRoleFilter) return false;
                    if (adminSearch) {
                      const q = adminSearch.toLowerCase();
                      return (a.name && a.name.toLowerCase().includes(q)) || (a.email && a.email.toLowerCase().includes(q));
                    }
                    return true;
                  })
                  .map((a) => (
                    <div key={a.id} className="glass-card" style={{ padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: '0.65rem' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: a.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg, #dc2626, #991b1b)' : 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          border: '1.5px solid rgba(255, 255, 255, 0.15)',
                          flexShrink: 0
                        }}>
                          {a.name ? a.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.35rem' }}>
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem', wordBreak: 'break-word' }}>
                                {a.name} {a.id === admin.id && <span style={{ fontSize: '0.7rem', color: '#38bdf8' }}>(You)</span>}
                              </div>
                              <div style={{ marginTop: '2px', display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                                <span className={`badge ${a.role === 'SUPER_ADMIN' ? 'badge-red' : a.role === 'ADMIN' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.68rem', padding: '0.1rem 0.4rem' }}>
                                  {a.role}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                if (a.id === admin.id) {
                                  alert('You cannot deactivate your own account.');
                                  return;
                                }
                                const newStatus = a.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
                                if (window.confirm(`Set status of ${a.name} to ${newStatus}?`)) {
                                  await api.updateAdmin(a.id, { status: newStatus });
                                  loadAllAdminData();
                                }
                              }}
                              style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
                              title="Click to toggle status"
                            >
                              <span className={`badge ${a.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`} style={{ cursor: 'pointer' }}>
                                {a.status}
                              </span>
                            </button>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '3px', wordBreak: 'break-all' }}>{a.email}</div>
                        </div>
                      </div>

                      <div style={{ padding: '0.55rem 0.75rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', marginBottom: '0.65rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                        <span>Last Login: <strong style={{ color: '#e2e8f0' }}>{a.last_login ? new Date(a.last_login).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Never'}</strong></span>
                        <span>Created: <strong style={{ color: '#cbd5e1' }}>{a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN') : '-'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.65rem' }}>
                        <button
                          onClick={() => {
                            setEditAdminForm({
                              id: a.id,
                              name: a.name,
                              email: a.email,
                              role: a.role,
                              status: a.status,
                              password: ''
                            });
                            setEditAdminModalOpen(true);
                          }}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit3 size={13} /> Edit
                        </button>
                        {a.id !== admin.id && (
                          <button
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to permanently delete admin account for ${a.name} (${a.email})?`)) {
                                try {
                                  await api.deleteAdmin(a.id);
                                  loadAllAdminData();
                                } catch (err) {
                                  alert(err.message || 'Failed to delete admin');
                                }
                              }
                            }}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '0.35rem 0.65rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                {adminUsers.length === 0 && (
                  <div className="glass-card" style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94a3b8', borderRadius: '14px' }}>
                    <ShieldCheck size={36} color="#38bdf8" style={{ margin: '0 auto 0.75rem auto', opacity: 0.7 }} />
                    <div style={{ color: '#fff', fontWeight: 600 }}>No administrator accounts found</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 9: BUSINESS SETTINGS (Section 33) */}
          {activeSection === 'settings' && (
            <div className="glass-card" style={{ maxWidth: '750px', padding: '2rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem' }}>Company Settings</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                All values saved here dynamically update throughout the website and invoice headers.
              </p>

              {settingsSavedMsg && (
                <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                  {settingsSavedMsg}
                </div>
              )}

              <form onSubmit={handleSaveSettings}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Business Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.business_name || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, business_name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tagline / Slogan</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.tagline || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Depot Physical Address</label>
                  <textarea
                    rows="2"
                    className="form-control"
                    value={settingsForm.address || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Primary Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.phone_primary || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone_primary: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Secondary Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.phone_secondary || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone_secondary: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Additional Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.phone_additional || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone_additional: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">WhatsApp Number</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.whatsapp_number || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operating Hours</label>
                    <input
                      type="text"
                      className="form-control"
                      value={settingsForm.operating_hours || ''}
                      onChange={(e) => setSettingsForm({ ...settingsForm, operating_hours: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Google Maps URL</label>
                  <input
                    type="text"
                    className="form-control"
                    value={settingsForm.maps_url || ''}
                    onChange={(e) => setSettingsForm({ ...settingsForm, maps_url: e.target.value })}
                  />
                </div>

                {/* Dedicated Fleet & Vehicle Transport Pricing Section */}
                <div style={{
                  marginTop: '1.25rem',
                  marginBottom: '1.25rem',
                  padding: '1.25rem',
                  background: 'rgba(251, 146, 60, 0.05)',
                  border: '1px solid rgba(251, 146, 60, 0.25)',
                  borderRadius: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                    <Truck size={20} color="#fb923c" />
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      Fleet & Transport Vehicle Pricing (₹ / Trip)
                    </h4>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.1rem', lineHeight: 1.45 }}>
                    Manage standard trip amounts charged for each transport vehicle. These rates are automatically displayed on website fleet cards, used when customers book vehicle transport, and populated on invoices.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#38bdf8' }}>
                        🚜 Tractor Trolley (₹ / Trip)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="form-control"
                        placeholder="1200"
                        value={settingsForm.vehicle_tractor_rate || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, vehicle_tractor_rate: e.target.value })}
                        style={{ fontWeight: 700, color: '#38bdf8' }}
                      />
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                        1 - 2 Units / 3 Tons (Narrow streets)
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#fb923c' }}>
                        🚚 Mini Tipper Truck (₹ / Trip)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="form-control"
                        placeholder="1800"
                        value={settingsForm.vehicle_tipper_rate || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, vehicle_tipper_rate: e.target.value })}
                        style={{ fontWeight: 700, color: '#fb923c' }}
                      />
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                        2 - 3 Units / 4.5 Tons (Town & Express)
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" style={{ fontWeight: 700, color: '#34d399' }}>
                        🚛 Heavy Tipper Lorry (₹ / Trip)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        className="form-control"
                        placeholder="3500"
                        value={settingsForm.vehicle_lorry_rate || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, vehicle_lorry_rate: e.target.value })}
                        style={{ fontWeight: 700, color: '#34d399' }}
                      />
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
                        5 - 10 Units / 16 - 25 Tons (Bulk Supply)
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  Save Company Settings
                </button>

                <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <ImageIcon size={16} color="#38bdf8" /> Website Section Pictures
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Upload and fit photos for Home, About, Vehicles, and Materials</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveSection('media')}
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                  >
                    <ImageIcon size={15} /> Manage Website Pictures
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Material Add/Edit Modal */}
      {matModalOpen && (
        <div className="modal-overlay" onClick={() => setMatModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1.25rem' }}>
              {matForm.id ? 'Edit Material' : 'Add New Material'}
            </h3>
            <form onSubmit={handleSaveMaterial}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Material Name *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={matForm.name}
                    onChange={(e) => setMatForm({ ...matForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={matForm.category}
                    onChange={(e) => setMatForm({ ...matForm, category: e.target.value })}
                  >
                    <option value="Sand">Sand</option>
                    <option value="Aggregates">Aggregates</option>
                    <option value="Bricks">Bricks</option>
                    <option value="Base Material">Base Material</option>
                    <option value="Powder">Powder</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-control"
                    value={matForm.price}
                    onChange={(e) => setMatForm({ ...matForm, price: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="Load / Unit / Ton"
                    value={matForm.unit}
                    onChange={(e) => setMatForm({ ...matForm, unit: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select
                    className="form-control"
                    value={matForm.available}
                    onChange={(e) => setMatForm({ ...matForm, available: parseInt(e.target.value) })}
                  >
                    <option value={1}>Available</option>
                    <option value={0}>Temporarily Not Available</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Material Photo</span>
                  {uploadingImageKey === 'material' && <span style={{ color: '#38bdf8', fontSize: '0.8rem' }}>Uploading...</span>}
                </label>
                
                {/* Photo Preview & Upload Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.85rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{ width: '84px', height: '64px', borderRadius: '8px', overflow: 'hidden', background: '#091122', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img
                      src={matForm.image_url || '/images/hero.jpg'}
                      alt="Material preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = '/images/hero.jpg'; }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label 
                      className="btn btn-outline btn-sm" 
                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}
                    >
                      <Upload size={14} />
                      <span>{uploadingImageKey === 'material' ? 'Uploading...' : 'Upload Material Picture'}</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }} 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleUploadMaterialImage(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '4px' }}>
                      Automatically fits website cards with object-fit: cover (no distortion)
                    </div>
                  </div>
                </div>

                <input
                  type="text"
                  className="form-control"
                  placeholder="Or enter image URL / path e.g. /images/msand.jpg"
                  value={matForm.image_url || ''}
                  onChange={(e) => setMatForm({ ...matForm, image_url: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  rows="2"
                  className="form-control"
                  value={matForm.description}
                  onChange={(e) => setMatForm({ ...matForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
                <button type="button" onClick={() => setMatModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Add Modal */}
      {adminModalOpen && (
        <div className="modal-overlay" onClick={() => setAdminModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '1.25rem' }}>Create Administrator</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.addAdmin(adminForm);
                setAdminModalOpen(false);
                loadAllAdminData();
              } catch (err) {
                alert(err.message || 'Failed to add admin');
              }
            }}>
              <div className="form-group">
                <label className="form-label">Staff Name</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  className="form-control"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="form-control"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-control"
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                >
                  <option value="ADMIN">Admin</option>
                  <option value="STAFF">Staff</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Create Administrator
                </button>
                <button type="button" onClick={() => setAdminModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {editAdminModalOpen && (
        <div className="modal-overlay" onClick={() => setEditAdminModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <h3 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={20} color="#38bdf8" /> Edit Administrator
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Update permissions, account status, or reset credentials for {editAdminForm.email}.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const payload = {
                  name: editAdminForm.name,
                  role: editAdminForm.role,
                  status: editAdminForm.status
                };
                if (editAdminForm.password && editAdminForm.password.trim().length >= 6) {
                  payload.password = editAdminForm.password.trim();
                }
                await api.updateAdmin(editAdminForm.id, payload);
                setEditAdminModalOpen(false);
                loadAllAdminData();
              } catch (err) {
                alert(err.message || 'Failed to update administrator');
              }
            }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  value={editAdminForm.name || ''}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  disabled
                  className="form-control"
                  value={editAdminForm.email || ''}
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Role Level *</label>
                  <select
                    className="form-control"
                    value={editAdminForm.role}
                    onChange={(e) => setEditAdminForm({ ...editAdminForm, role: e.target.value })}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="STAFF">Staff / Dispatcher</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Account Status *</label>
                  <select
                    className="form-control"
                    value={editAdminForm.status}
                    onChange={(e) => setEditAdminForm({ ...editAdminForm, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE (Enabled)</option>
                    <option value="DISABLED">DISABLED (Suspended)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Reset Password <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>(Leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  placeholder="Enter 6+ chars to reset password"
                  className="form-control"
                  value={editAdminForm.password || ''}
                  onChange={(e) => setEditAdminForm({ ...editAdminForm, password: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Changes
                </button>
                <button type="button" onClick={() => setEditAdminModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Activity & Session History Modal */}
      {customerModalOpen && (
        <div className="modal-overlay" onClick={() => setCustomerModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
            {customerModalLoading || !selectedCustomerDetail ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                <RefreshCw size={24} className="animate-spin-slow" style={{ margin: '0 auto 1rem auto' }} />
                Loading customer activity & session logs...
              </div>
            ) : (
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: '#fff'
                    }}>
                      {selectedCustomerDetail.customer.name ? selectedCustomerDetail.customer.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.2rem' }}>
                        {selectedCustomerDetail.customer.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{selectedCustomerDetail.customer.email}</span>
                        <span className={`badge ${selectedCustomerDetail.customer.status === 'ACTIVE' ? 'badge-green' : 'badge-red'}`}>
                          {selectedCustomerDetail.customer.status}
                        </span>
                        {selectedCustomerDetail.customer.is_google_user ? (
                          <span className="badge badge-orange">Google Account</span>
                        ) : (
                          <span className="badge badge-blue">Email Verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCustomerModalOpen(false)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '0.4rem 0.7rem' }}
                  >
                    Close
                  </button>
                </div>

                {/* Profile Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '0.9rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Phone Contact</div>
                    <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.92rem', marginTop: '0.2rem' }}>
                      {selectedCustomerDetail.customer.mobile ? `+91 ${selectedCustomerDetail.customer.mobile}` : 'Not provided'}
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '0.9rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Site Logins</div>
                    <div style={{ fontWeight: 800, color: '#38bdf8', fontSize: '1.1rem', marginTop: '0.2rem' }}>
                      {selectedCustomerDetail.customer.login_count || 1} Times
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '0.9rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>First Login / Registered</div>
                    <div style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                      {selectedCustomerDetail.customer.first_login ? new Date(selectedCustomerDetail.customer.first_login).toLocaleDateString('en-IN') : 'N/A'}
                    </div>
                  </div>

                  <div className="glass-card" style={{ padding: '0.9rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Last Logged In</div>
                    <div style={{ fontWeight: 600, color: '#cbd5e1', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                      {selectedCustomerDetail.customer.last_login ? new Date(selectedCustomerDetail.customer.last_login).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                {selectedCustomerDetail.customer.address && (
                  <div className="glass-card" style={{ padding: '1rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Site / Delivery Address</div>
                    <div style={{ color: '#f1f5f9', fontSize: '0.88rem' }}>{selectedCustomerDetail.customer.address}</div>
                  </div>
                )}

                {/* Login Session History Table */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={16} color="#38bdf8" /> Logged In Session History (Recent Logins)
                  </h4>

                  <div className="glass-card table-responsive-wrapper" style={{ borderRadius: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                    <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                          <th style={{ padding: '0.65rem 0.85rem' }}>Login Time</th>
                          <th style={{ padding: '0.65rem 0.85rem' }}>IP Address</th>
                          <th style={{ padding: '0.65rem 0.85rem' }}>Device / Browser</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCustomerDetail.loginHistory && selectedCustomerDetail.loginHistory.length > 0 ? (
                          selectedCustomerDetail.loginHistory.map((sess, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                              <td style={{ padding: '0.65rem 0.85rem', color: '#fff', fontWeight: 600 }}>
                                {sess.login_time ? new Date(sess.login_time).toLocaleString('en-IN') : 'Recent'}
                              </td>
                              <td style={{ padding: '0.65rem 0.85rem', color: '#94a3b8' }}>
                                {sess.ip_address || '127.0.0.1'}
                              </td>
                              <td style={{ padding: '0.65rem 0.85rem', color: '#cbd5e1', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {sess.user_agent || 'Web Browser'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                              User logged in {selectedCustomerDetail.customer.login_count || 1} time(s). Last active: {selectedCustomerDetail.customer.last_login ? new Date(selectedCustomerDetail.customer.last_login).toLocaleString('en-IN') : 'N/A'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Orders, Deliveries & Quotes Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  <div className="glass-card" style={{ padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.88rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={14} /> Deliveries Booked ({selectedCustomerDetail.deliveries?.length || 0})
                    </div>
                    {selectedCustomerDetail.deliveries?.length > 0 ? (
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        <div><strong>#{selectedCustomerDetail.deliveries[0].request_number}</strong>: {selectedCustomerDetail.deliveries[0].quantity} {selectedCustomerDetail.deliveries[0].unit} {selectedCustomerDetail.deliveries[0].material_name}</div>
                        <span className="badge badge-blue" style={{ marginTop: '4px' }}>{selectedCustomerDetail.deliveries[0].status}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No deliveries booked yet</div>
                    )}
                  </div>

                  <div className="glass-card" style={{ padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.88rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Receipt size={14} /> Bills & Invoices ({selectedCustomerDetail.invoices?.length || selectedCustomerDetail.orders?.length || 0})
                    </div>
                    {selectedCustomerDetail.invoices?.length > 0 ? (
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        <div><strong>#{selectedCustomerDetail.invoices[0].invoice_number}</strong>: ₹{selectedCustomerDetail.invoices[0].grand_total.toLocaleString('en-IN')}</div>
                        <span className={`badge ${selectedCustomerDetail.invoices[0].payment_status === 'Paid' ? 'badge-green' : 'badge-orange'}`} style={{ marginTop: '4px' }}>
                          {selectedCustomerDetail.invoices[0].payment_status}
                        </span>
                      </div>
                    ) : selectedCustomerDetail.orders?.length > 0 ? (
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        Latest Order: #{selectedCustomerDetail.orders[0].order_number} (₹{selectedCustomerDetail.orders[0].final_amount})
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No invoices yet</div>
                    )}
                  </div>

                  <div className="glass-card" style={{ padding: '1rem', borderRadius: '10px' }}>
                    <div style={{ fontWeight: 700, color: '#fb923c', fontSize: '0.88rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FileText size={14} /> Quotation Requests ({selectedCustomerDetail.quotes?.length || 0})
                    </div>
                    {selectedCustomerDetail.quotes?.length > 0 ? (
                      <div style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>
                        <div><strong>#{selectedCustomerDetail.quotes[0].request_number}</strong>: {selectedCustomerDetail.quotes[0].material_name} ({selectedCustomerDetail.quotes[0].quantity} {selectedCustomerDetail.quotes[0].unit})</div>
                        <span className="badge badge-orange" style={{ marginTop: '4px' }}>{selectedCustomerDetail.quotes[0].status}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>No quotes requested yet</div>
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      handleSelectCustomerForBilling(selectedCustomerDetail.customer.id);
                      setCustomerModalOpen(false);
                      setActiveSection('invoices');
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    Create Bill For This Customer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Payment Amount Modal */}
      {paymentModalOpen && paymentModalInvoice && (
        <div className="modal-overlay" onClick={() => setPaymentModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', color: '#fff', margin: 0, fontWeight: 700 }}>
                  Edit Customer Payment
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '2px', fontWeight: 700 }}>
                  Invoice #{paymentModalInvoice.invoice_number}
                </div>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePaymentModal}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.25rem', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.92rem' }}>
                  {paymentModalInvoice.customer_name}
                </div>
                {paymentModalInvoice.customer_mobile && (
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                    {paymentModalInvoice.customer_mobile}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Total Bill:</div>
                    <div style={{ fontWeight: 800, color: '#fb923c', fontSize: '1rem' }}>
                      ₹{paymentModalInvoice.grand_total?.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Currently Paid:</div>
                    <div style={{ fontWeight: 700, color: '#34d399', fontSize: '1rem' }}>
                      ₹{(paymentModalInvoice.paid_amount != null ? Number(paymentModalInvoice.paid_amount) : (paymentModalInvoice.payment_status === 'Paid' ? paymentModalInvoice.grand_total : 0)).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, color: '#34d399' }}>
                  Amount Paid by Customer (₹) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  autoFocus
                  className="form-control"
                  placeholder="Enter amount customer paid"
                  style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.4)' }}
                  value={paymentModalPaidAmount}
                  onChange={(e) => setPaymentModalPaidAmount(e.target.value)}
                />
              </div>

              {/* Quick shortcut buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentModalPaidAmount(paymentModalInvoice.grand_total)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}
                >
                  Mark Fully Paid (₹{paymentModalInvoice.grand_total})
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentModalPaidAmount(0)}
                  className="btn btn-outline btn-sm"
                  style={{ flex: 1, fontSize: '0.75rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  Mark Unpaid (₹0)
                </button>
              </div>

              {/* Balance preview */}
              <div style={{
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem'
              }}>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Remaining Balance Due:</span>
                <span style={{
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  color: (paymentModalInvoice.grand_total - (parseFloat(paymentModalPaidAmount) || 0)) > 0 ? '#fb923c' : '#34d399'
                }}>
                  ₹{Math.max(0, paymentModalInvoice.grand_total - (parseFloat(paymentModalPaidAmount) || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Payment Status
                </button>
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
