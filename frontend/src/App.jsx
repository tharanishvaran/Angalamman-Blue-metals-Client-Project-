import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustStats from './components/TrustStats';
import About from './components/About';
import MaterialsCatalog from './components/MaterialsCatalog';
import Services from './components/Services';
import VehiclesFleet from './components/VehiclesFleet';
import WhyChooseUs from './components/WhyChooseUs';
import ReviewsSection from './components/ReviewsSection';
import LocationContact from './components/LocationContact';
import Footer from './components/Footer';
import WhatsAppFloat from './components/WhatsAppFloat';
import { Bell } from 'lucide-react';

// Modals
import QuoteModal from './components/QuoteModal';
import DeliveryModal from './components/DeliveryModal';
import AuthModal from './components/AuthModal';
import InvoiceViewModal from './components/InvoiceViewModal';
import AdminNotificationPanel from './components/AdminNotificationPanel';
import MyOrdersModal from './components/MyOrdersModal';

// Dedicated Pages
import CustomerDashboard from './pages/CustomerDashboard';
import AdminPortal from './pages/AdminPortal';

import { api } from './api';
import { 
  DEFAULT_SETTINGS, 
  DEFAULT_MATERIALS, 
  DEFAULT_SERVICES, 
  DEFAULT_REVIEWS 
} from './defaultData';

export default function App() {
  // Global Data State initialized with instant offline fallbacks
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [materials, setMaterials] = useState(DEFAULT_MATERIALS);
  const [services, setServices] = useState(DEFAULT_SERVICES);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);

  // Auth State
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  // View Navigation: 'home', 'customer-dashboard', 'admin-portal'
  const [activeView, setActiveView] = useState('home');

  // Modals State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [myOrdersModalOpen, setMyOrdersModalOpen] = useState(false);
  const [isVehicleModalMode, setIsVehicleModalMode] = useState(false);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('customer'); // 'customer' or 'admin'
  const [selectedMaterialForModal, setSelectedMaterialForModal] = useState('');
  
  // Invoice Viewer Modal
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Admin Home Page Live Notifications State
  const [adminNotificationsOpen, setAdminNotificationsOpen] = useState(false);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const [adminInitialSection, setAdminInitialSection] = useState('dashboard');

  const ADMIN_EMAILS = [
    'tharanishvaranr@gmail.com',
    'angalammanbluemetalspondy@gmail.com',
    'sriangalammanbluemetalspondy@gmail.com',
    'admin@angalamman.com'
  ];

  // Poll for admin notifications unread count when admin is active
  useEffect(() => {
    if (!admin) return;

    const checkNotifications = async () => {
      try {
        const res = await api.getNotifications();
        if (res && res.notifications) {
          let clearedIds = [];
          try {
            clearedIds = JSON.parse(localStorage.getItem('angalamman_cleared_notif_ids') || '[]');
          } catch (e) {}
          const clearedSet = new Set(Array.isArray(clearedIds) ? clearedIds : []);
          const activeNotifs = res.notifications.filter(n => !clearedSet.has(n.id));

          const lastRead = Number(localStorage.getItem('angalamman_last_read_notif') || 0);
          const unread = activeNotifs.filter(n => {
            const time = new Date(n.created_at).getTime();
            return !isNaN(time) && time > lastRead;
          }).length;
          setAdminUnreadCount(unread > 0 ? unread : 0);
        }
      } catch (err) {
        // quiet ignore in background
      }
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 25000);
    return () => clearInterval(interval);
  }, [admin]);

  const handleResetUnread = () => {
    localStorage.setItem('angalamman_last_read_notif', Date.now().toString());
    setAdminUnreadCount(0);
  };

  const handleOpenAdminSection = (section = 'dashboard') => {
    setAdminInitialSection(section || 'dashboard');
    setActiveView('admin-portal');
    setAdminNotificationsOpen(false);
  };

  useEffect(() => {
    // Check saved session
    const savedUser = localStorage.getItem('angalamman_user');
    const savedAdmin = localStorage.getItem('angalamman_admin');
    let parsedUser = null;
    let parsedAdmin = null;

    if (savedUser) {
      try { parsedUser = JSON.parse(savedUser); } catch (e) {}
    }
    if (savedAdmin) {
      try { parsedAdmin = JSON.parse(savedAdmin); } catch (e) {}
    }

    // Auto-migrate if savedUser belongs to an admin
    if (parsedUser && (
      parsedUser.role === 'SUPER_ADMIN' ||
      parsedUser.role === 'ADMIN' ||
      ADMIN_EMAILS.includes((parsedUser.email || '').toLowerCase().trim())
    )) {
      parsedAdmin = { ...parsedUser, role: parsedUser.role || 'SUPER_ADMIN' };
      parsedUser = null;
      localStorage.setItem('angalamman_admin', JSON.stringify(parsedAdmin));
      localStorage.removeItem('angalamman_user');
    }

    if (parsedAdmin) {
      setAdmin(parsedAdmin);
      setUser(null);
    } else if (parsedUser) {
      setUser(parsedUser);
      setAdmin(null);
    }

    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [sets, mats, srvs, revs] = await Promise.all([
        api.getSettings().catch(() => null),
        api.getMaterials().catch(() => null),
        api.getServices().catch(() => null),
        api.getReviews().catch(() => null)
      ]);
      if (sets && Object.keys(sets).length > 0) {
        setSettings(prev => ({ ...prev, ...sets }));
      }
      if (mats && Array.isArray(mats) && mats.length > 0) {
        setMaterials(mats);
      }
      if (srvs && Array.isArray(srvs) && srvs.length > 0) {
        setServices(srvs);
      }
      if (revs && Array.isArray(revs) && revs.length > 0) {
        setReviews(revs);
      }
    } catch (err) {
      console.warn('API sync warning (using preloaded defaults):', err);
    }
  };

  // Pending action after Google login
  const [pendingAction, setPendingAction] = useState(null); // { type: 'quote' | 'delivery', material: '' }
  const [authBannerMessage, setAuthBannerMessage] = useState('');

  const handleLoginSuccess = (accountData, isAdmin) => {
    const isActuallyAdmin = Boolean(
      isAdmin ||
      accountData?.role === 'SUPER_ADMIN' ||
      accountData?.role === 'ADMIN' ||
      ADMIN_EMAILS.includes((accountData?.email || '').toLowerCase().trim())
    );

    if (isActuallyAdmin) {
      const adminData = {
        ...accountData,
        role: accountData.role || 'SUPER_ADMIN'
      };
      setAdmin(adminData);
      setUser(null);
      localStorage.setItem('angalamman_admin', JSON.stringify(adminData));
      localStorage.removeItem('angalamman_user');
      setActiveView('admin-portal');
    } else {
      setUser(accountData);
      setAdmin(null);
      localStorage.setItem('angalamman_user', JSON.stringify(accountData));
      localStorage.removeItem('angalamman_admin');
      if (pendingAction) {
        const action = pendingAction;
        setPendingAction(null);
        setTimeout(() => {
          if (action.type === 'delivery') {
            setIsVehicleModalMode(false);
            setSelectedMaterialForModal(action.material || '');
            setDeliveryModalOpen(true);
          } else if (action.type === 'vehicle') {
            setIsVehicleModalMode(true);
            setSelectedVehicleForModal(action.vehicle || 'Hydraulic Tractor Trolley');
            setDeliveryModalOpen(true);
          } else if (action.type === 'quote') {
            setSelectedMaterialForModal(action.material || '');
            setQuoteModalOpen(true);
          }
        }, 120);
      } else {
        setActiveView('customer-dashboard');
      }
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setAdmin(null);
    localStorage.removeItem('angalamman_user');
    localStorage.removeItem('angalamman_admin');
    setActiveView('home');
  };

  // Triggers for modals with pre-selected material — QuoteModal is accessible directly for instant PDF downloads
  const handleOpenQuoteWithMaterial = (materialName = '') => {
    setSelectedMaterialForModal(materialName || '');
    setQuoteModalOpen(true);
  };

  const handleOpenDeliveryWithMaterial = (materialName = '') => {
    setIsVehicleModalMode(false);
    setSelectedVehicleForModal('');
    if (!user && !admin) {
      setSelectedMaterialForModal(materialName || '');
      setPendingAction({ type: 'delivery', material: materialName || '' });
      setAuthBannerMessage('Please sign in or register to book site delivery & order materials');
      setAuthInitialMode('customer');
      setAuthModalOpen(true);
      return;
    }
    setSelectedMaterialForModal(materialName || '');
    setDeliveryModalOpen(true);
  };

  const handleOpenVehicleBooking = (vehicleName = 'Hydraulic Tractor Trolley') => {
    if (!user && !admin) {
      setSelectedVehicleForModal(vehicleName || 'Hydraulic Tractor Trolley');
      setIsVehicleModalMode(true);
      setPendingAction({ type: 'vehicle', vehicle: vehicleName || 'Hydraulic Tractor Trolley' });
      setAuthBannerMessage('Please sign in or register to request vehicle & transport service');
      setAuthInitialMode('customer');
      setAuthModalOpen(true);
      return;
    }
    setSelectedVehicleForModal(vehicleName || 'Hydraulic Tractor Trolley');
    setIsVehicleModalMode(true);
    setDeliveryModalOpen(true);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeView]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <div className="ambient-bg" aria-hidden="true" />
      
      {/* View 1: Admin Portal */}
      {activeView === 'admin-portal' && admin ? (
        <AdminPortal
          admin={admin}
          initialSection={adminInitialSection}
          onLogout={handleLogout}
          onClose={() => setActiveView('home')}
          onViewInvoice={(inv) => setViewingInvoice(inv)}
          onDataUpdated={() => loadInitialData()}
        />
      ) : activeView === 'customer-dashboard' && (user || admin) ? (
        /* View 2: Customer Dashboard */
        <CustomerDashboard
          user={user}
          admin={admin}
          onClose={() => setActiveView('home')}
          onOpenAdminPortal={(sec) => handleOpenAdminSection(sec || 'dashboard')}
          onOpenQuote={() => handleOpenQuoteWithMaterial()}
          onOpenDelivery={() => handleOpenDeliveryWithMaterial()}
          onViewInvoice={(inv) => setViewingInvoice(inv)}
          onProfileUpdated={(updated) => setUser(updated)}
          onLogout={handleLogout}
        />
      ) : (
        /* View 3: Public Website */
        <>
          <Navbar
            settings={settings}
            user={user}
            admin={admin}
            onOpenQuote={() => handleOpenQuoteWithMaterial()}
            onOpenDelivery={() => handleOpenDeliveryWithMaterial()}
            onOpenOrders={() => setMyOrdersModalOpen(true)}
            onOpenAuth={() => {
              setAuthInitialMode('customer');
              setAuthModalOpen(true);
            }}
            onOpenAdminAuth={() => {
              setAuthInitialMode('admin');
              setAuthModalOpen(true);
            }}
            onOpenDashboard={() => setActiveView('customer-dashboard')}
            onOpenAdminPortal={() => setActiveView('admin-portal')}
            onOpenAdminNotifications={() => setAdminNotificationsOpen(true)}
            adminUnreadCount={adminUnreadCount}
            onLogout={handleLogout}
          />

          <main style={{ flex: 1 }}>
            <Hero
              settings={settings}
              user={user}
              admin={admin}
              onOpenQuote={() => handleOpenQuoteWithMaterial()}
              onOpenDelivery={() => handleOpenDeliveryWithMaterial()}
              onOpenOrders={() => setMyOrdersModalOpen(true)}
            />

            <TrustStats />

            <About
              settings={settings}
              onOpenDelivery={() => handleOpenDeliveryWithMaterial()}
            />

            <MaterialsCatalog
              materials={materials}
              onSelectQuoteMaterial={(name) => handleOpenQuoteWithMaterial(name)}
              onSelectDeliveryMaterial={(name) => handleOpenDeliveryWithMaterial(name)}
            />

            <Services
              services={services}
              onSelectServiceQuote={(name) => handleOpenQuoteWithMaterial(name)}
            />

            <VehiclesFleet
              settings={settings}
              onOpenDelivery={(opts) => {
                if (opts?.isVehicleRequest) {
                  handleOpenVehicleBooking(opts.vehicleName);
                } else {
                  handleOpenDeliveryWithMaterial();
                }
              }}
              onOpenVehicle={(vName) => handleOpenVehicleBooking(vName)}
              onOpenQuote={() => handleOpenQuoteWithMaterial()}
            />

            <WhyChooseUs />

            <ReviewsSection
              reviews={reviews}
              user={user}
              onReviewSubmitted={() => loadInitialData()}
            />

            <LocationContact
              settings={settings}
              user={user || admin}
              onOpenQuote={() => handleOpenQuoteWithMaterial()}
              onRequireLogin={(mat) => {
                setPendingAction({ type: 'quote', material: mat || 'M-Sand' });
                setAuthBannerMessage('Please sign in or register to request an official quotation');
                setAuthInitialMode('customer');
                setAuthModalOpen(true);
              }}
            />
          </main>

          <Footer
            settings={settings}
            onOpenAuth={() => {
              setAuthBannerMessage('');
              setAuthInitialMode('customer');
              setAuthModalOpen(true);
            }}
            onOpenAdminAuth={() => {
              setAuthBannerMessage('');
              setAuthInitialMode('admin');
              setAuthModalOpen(true);
            }}
          />

          <WhatsAppFloat
            settings={settings}
            onOpenQuote={() => handleOpenQuoteWithMaterial()}
          />

          {/* Floating Admin Notifications Trigger Button (Visible only when admin is logged in) */}
          {admin && (
            <button
              onClick={() => setAdminNotificationsOpen(true)}
              className="admin-floating-notif-btn"
              style={{
                position: 'fixed',
                bottom: '5.5rem',
                left: '1.25rem',
                zIndex: 899,
                background: adminUnreadCount > 0 
                  ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
                  : 'linear-gradient(135deg, #0b172d 0%, #172554 100%)',
                color: '#ffffff',
                border: adminUnreadCount > 0 ? '1.5px solid rgba(239, 68, 68, 0.7)' : '1.5px solid rgba(56, 189, 248, 0.5)',
                borderRadius: '9999px',
                padding: '0.6rem 1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), 0 0 16px rgba(56, 189, 248, 0.25)',
                fontWeight: 700,
                fontSize: '0.82rem',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              title="Open Live Activity Notifications"
            >
              <Bell size={16} className={adminUnreadCount > 0 ? 'animate-bounce' : ''} />
              <span className="admin-floating-notif-label">Live Activity</span>
              {adminUnreadCount > 0 && (
                <span style={{
                  background: '#ffffff',
                  color: '#dc2626',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  minWidth: '18px',
                  height: '18px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 3px',
                  marginLeft: '2px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                }}>
                  {adminUnreadCount > 9 ? '9+' : adminUnreadCount}
                </span>
              )}
            </button>
          )}
        </>
      )}

      {/* Global Modals */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialMaterial={selectedMaterialForModal}
        materials={materials}
        settings={settings}
        user={user || admin}
        onRequireLogin={() => {
          setQuoteModalOpen(false);
          setPendingAction({ type: 'quote', material: selectedMaterialForModal });
          setAuthBannerMessage('Please sign in with Google to save quotation to your account');
          setAuthInitialMode('customer');
          setAuthModalOpen(true);
        }}
      />

      <DeliveryModal
        isOpen={deliveryModalOpen}
        onClose={() => {
          setDeliveryModalOpen(false);
          setIsVehicleModalMode(false);
        }}
        initialMaterial={selectedMaterialForModal}
        initialVehicle={selectedVehicleForModal}
        isVehicleRequest={isVehicleModalMode}
        materials={materials}
        settings={settings}
        user={user || admin}
        onRequireLogin={() => {
          setDeliveryModalOpen(false);
          if (isVehicleModalMode) {
            setPendingAction({ type: 'vehicle', vehicle: selectedVehicleForModal || 'Hydraulic Tractor Trolley' });
            setAuthBannerMessage('Please sign in or register to request vehicle & transport service');
          } else {
            setPendingAction({ type: 'delivery', material: selectedMaterialForModal });
            setAuthBannerMessage('Please sign in or register to book site delivery & order materials');
          }
          setAuthInitialMode('customer');
          setAuthModalOpen(true);
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => {
          setAuthModalOpen(false);
          setPendingAction(null);
        }}
        initialMode={authInitialMode}
        bannerMessage={authBannerMessage}
        onLoginSuccess={handleLoginSuccess}
      />

      <InvoiceViewModal
        invoice={viewingInvoice}
        business={settings}
        onClose={() => setViewingInvoice(null)}
      />

      {/* Customer My Orders Modal (Home Page) */}
      <MyOrdersModal
        isOpen={myOrdersModalOpen}
        onClose={() => setMyOrdersModalOpen(false)}
        user={user}
        admin={admin}
        onOpenDelivery={() => handleOpenDeliveryWithMaterial()}
        onOpenQuote={() => handleOpenQuoteWithMaterial()}
        onOpenDashboard={() => {
          setMyOrdersModalOpen(false);
          setActiveView('customer-dashboard');
        }}
        onViewInvoice={(inv) => {
          setMyOrdersModalOpen(false);
          setViewingInvoice(inv);
        }}
      />

      {/* Admin Home Page Live Notifications Drawer */}
      {admin && (
        <AdminNotificationPanel
          isOpen={adminNotificationsOpen}
          onClose={() => setAdminNotificationsOpen(false)}
          onOpenAdminPortal={(targetSec) => handleOpenAdminSection(targetSec || 'dashboard')}
          unreadCount={adminUnreadCount}
          onResetUnread={handleResetUnread}
        />
      )}

    </div>
  );
}
