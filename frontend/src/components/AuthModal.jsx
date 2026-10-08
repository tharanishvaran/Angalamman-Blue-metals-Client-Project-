import React, { useState } from 'react';
import { User, Phone, ShieldCheck, X, CheckCircle2, Lock, Mail } from 'lucide-react';
import { api } from '../api';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  initialMode = 'customer' // 'customer' or 'admin'
}) {
  const [mode, setMode] = useState(initialMode); // 'customer', 'complete-profile', 'admin'
  const [googleUser, setGoogleUser] = useState(null);
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  
  // Quick Mock Google profile options for instant testing or custom input
  const [mockEmail, setMockEmail] = useState('');
  const [mockName, setMockName] = useState('');
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('admin@angalamman.com');
  const [adminPassword, setAdminPassword] = useState('Admin@1234');
  const [adminError, setAdminError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Indian mobile validation helper
  const isValidMobile = (num) => {
    const cleaned = num.replace(/[\s\-\+]/g, '');
    const digits = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
    return /^[6-9]\d{9}$/.test(digits);
  };

  // Google Login simulation / execution
  const handleGoogleSignIn = async (email, name, picture) => {
    try {
      setLoading(true);
      const res = await api.googleLogin(null, {
        email: email || mockEmail || 'customer.pondy@gmail.com',
        name: name || mockName || 'K. Rajesh',
        picture: picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      });

      localStorage.setItem('angalamman_token', res.token);
      localStorage.setItem('angalamman_user', JSON.stringify(res.user));

      if (res.needsMobile) {
        setGoogleUser(res.user);
        setMode('complete-profile');
      } else {
        onLoginSuccess(res.user, false);
        onClose();
      }
    } catch (err) {
      alert(err.message || 'Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete profile with mobile number
  const handleSaveMobile = async (e) => {
    e.preventDefault();
    if (!isValidMobile(mobile)) {
      setMobileError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)');
      return;
    }
    setMobileError('');

    try {
      setLoading(true);
      const res = await api.updateProfile({ mobile });
      localStorage.setItem('angalamman_user', JSON.stringify(res.user));
      onLoginSuccess(res.user, false);
      onClose();
    } catch (err) {
      setMobileError(err.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  // Admin login submission
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminError('');
    try {
      setLoading(true);
      const res = await api.adminLogin(adminEmail, adminPassword);
      localStorage.setItem('angalamman_token', res.token);
      localStorage.setItem('angalamman_admin', JSON.stringify(res.admin));
      onLoginSuccess(res.admin, true);
      onClose();
    } catch (err) {
      setAdminError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        {/* STEP 1: Customer Google Login */}
        {mode === 'customer' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: 'rgba(37, 99, 235, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: '#38bdf8'
              }}>
                <User size={26} />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#fff' }}>Customer Login</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Access your delivery requests, quotations, and official invoices.
              </p>
            </div>

            {/* Google OAuth One-Click Button */}
            <button
              onClick={() => handleGoogleSignIn('tharanish.customer@gmail.com', 'Tharanish Customer')}
              disabled={loading}
              className="btn btn-outline"
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '1rem',
                background: '#ffffff',
                color: '#1f2937',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Custom Google account toggle */}
            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowCustomGoogle(!showCustomGoogle)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {showCustomGoogle ? 'Hide custom Google test' : 'Sign in with custom Google email'}
              </button>
            </div>

            {showCustomGoogle && (
              <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Google Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. S. Jayakumar"
                    value={mockName}
                    onChange={(e) => setMockName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Google Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="e.g. jaya.build@gmail.com"
                    value={mockEmail}
                    onChange={(e) => setMockEmail(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(mockEmail, mockName)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                >
                  Sign In as {mockEmail || 'User'}
                </button>
              </div>
            )}

            <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <button
                onClick={() => setMode('admin')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ShieldCheck size={14} color="#fb923c" />
                <span>Administrative Staff Login</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Complete Profile (Mobile Number Collection - Requirement 15 & 39) */}
        {mode === 'complete-profile' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: 'rgba(249, 115, 22, 0.2)',
                color: '#fb923c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <Phone size={24} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Complete Your Profile</h3>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                Please enter your mobile number to complete your customer account.
              </p>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Required for site dispatch coordination and weighbridge SMS receipts.
              </div>
            </div>

            <form onSubmit={handleSaveMobile}>
              <div className="form-group">
                <label className="form-label">10-Digit Indian Mobile Number *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="9944076675"
                    className="form-control"
                    style={{ paddingLeft: '45px', fontSize: '1.1rem', letterSpacing: '0.05em' }}
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value.replace(/\D/g, ''));
                      setMobileError('');
                    }}
                  />
                </div>
                {mobileError && (
                  <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                    {mobileError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-orange"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Saving...' : 'Verify & Continue'}
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Admin Login */}
        {mode === 'admin' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '14px',
                background: 'rgba(37, 99, 235, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <ShieldCheck size={26} />
              </div>
              <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Administrator Login</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Authorized Sri Angalamman dispatch & billing portal.
              </p>
            </div>

            {adminError && (
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {adminError}
              </div>
            )}

            <form onSubmit={handleAdminLogin}>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    required
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="password"
                    required
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                  />
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem' }}>
                  Default Super Admin: admin@angalamman.com / Admin@1234
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                {loading ? 'Authenticating...' : 'Sign In as Administrator'}
              </button>

              <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setMode('customer')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ← Return to Customer Login
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
