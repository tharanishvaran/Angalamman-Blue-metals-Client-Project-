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

// Modals
import QuoteModal from './components/QuoteModal';
import DeliveryModal from './components/DeliveryModal';
import AuthModal from './components/AuthModal';
import InvoiceViewModal from './components/InvoiceViewModal';

// Dedicated Pages
import CustomerDashboard from './pages/CustomerDashboard';
import AdminPortal from './pages/AdminPortal';

import { api } from './api';

export default function App() {
  // Global Data State
  const [settings, setSettings] = useState({});
  const [materials, setMaterials] = useState([]);
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Auth State
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  // View Navigation: 'home', 'customer-dashboard', 'admin-portal'
  const [activeView, setActiveView] = useState('home');

  // Modals State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState('customer'); // 'customer' or 'admin'
  const [selectedMaterialForModal, setSelectedMaterialForModal] = useState('');
  
  // Invoice Viewer Modal
  const [viewingInvoice, setViewingInvoice] = useState(null);

  useEffect(() => {
    // Check saved session
    const savedUser = localStorage.getItem('angalamman_user');
    const savedAdmin = localStorage.getItem('angalamman_admin');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) {}
    }
    if (savedAdmin) {
      try { setAdmin(JSON.parse(savedAdmin)); } catch (e) {}
    }

    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [sets, mats, srvs, revs] = await Promise.all([
        api.getSettings().catch(() => ({})),
        api.getMaterials().catch(() => []),
        api.getServices().catch(() => []),
        api.getReviews().catch(() => [])
      ]);
      setSettings(sets);
      setMaterials(mats);
      setServices(srvs);
      setReviews(revs);
    } catch (err) {
      console.error('Initialization error:', err);
    }
  };

  const handleLoginSuccess = (accountData, isAdmin) => {
    if (isAdmin) {
      setAdmin(accountData);
      setActiveView('admin-portal');
    } else {
      setUser(accountData);
      // If customer was on home, stay on home or switch to dashboard
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setAdmin(null);
    setActiveView('home');
  };

  // Triggers for modals with pre-selected material
  const handleOpenQuoteWithMaterial = (materialName = '') => {
    setSelectedMaterialForModal(materialName);
    setQuoteModalOpen(true);
  };

  const handleOpenDeliveryWithMaterial = (materialName = '') => {
    setSelectedMaterialForModal(materialName);
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
          onLogout={handleLogout}
          onClose={() => setActiveView('home')}
          onViewInvoice={(inv) => setViewingInvoice(inv)}
          onDataUpdated={() => loadInitialData()}
        />
      ) : activeView === 'customer-dashboard' && user ? (
        /* View 2: Customer Dashboard */
        <CustomerDashboard
          user={user}
          onClose={() => setActiveView('home')}
          onOpenQuote={() => handleOpenQuoteWithMaterial()}
          onOpenDelivery={() => handleOpenDeliveryWithMaterial()}
          onViewInvoice={(inv) => setViewingInvoice(inv)}
          onProfileUpdated={(updated) => setUser(updated)}
        />
      ) : (
        /* View 3: Public Website */
        <>
          <Navbar
            settings={settings}
            user={user}
            admin={admin}
            onOpenQuote={() => handleOpenQuoteWithMaterial()}
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
            onLogout={handleLogout}
          />

          <main style={{ flex: 1 }}>
            <Hero
              settings={settings}
              onOpenQuote={() => handleOpenQuoteWithMaterial()}
              onOpenDelivery={() => handleOpenDeliveryWithMaterial()}
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
              onOpenDelivery={() => handleOpenDeliveryWithMaterial()}
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
              onOpenQuote={() => handleOpenQuoteWithMaterial()}
            />
          </main>

          <Footer
            settings={settings}
            onOpenAuth={() => {
              setAuthInitialMode('customer');
              setAuthModalOpen(true);
            }}
            onOpenAdminAuth={() => {
              setAuthInitialMode('admin');
              setAuthModalOpen(true);
            }}
          />

          <WhatsAppFloat
            settings={settings}
            onOpenQuote={() => handleOpenQuoteWithMaterial()}
          />
        </>
      )}

      {/* Global Modals */}
      <QuoteModal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        initialMaterial={selectedMaterialForModal}
        user={user}
      />

      <DeliveryModal
        isOpen={deliveryModalOpen}
        onClose={() => setDeliveryModalOpen(false)}
        initialMaterial={selectedMaterialForModal}
        user={user}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authInitialMode}
        onLoginSuccess={handleLoginSuccess}
      />

      <InvoiceViewModal
        invoice={viewingInvoice}
        business={settings}
        onClose={() => setViewingInvoice(null)}
      />

    </div>
  );
}
