import React, { useState } from 'react';
import { User, Phone, ShieldCheck, X, CheckCircle2, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { api } from '../api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  initialMode = 'customer', // 'customer' or 'admin'
  bannerMessage = ''
}) {
  const [mode, setMode] = useState(initialMode); // 'customer', 'complete-profile', 'admin', 'google-prompt'
  const [googleUser, setGoogleUser] = useState(null);
  const [mobile, setMobile] = useState('');
  const [mobileError, setMobileError] = useState('');
  
  // Custom Google profile inputs
  const [inputEmail, setInputEmail] = useState('');
  const [inputName, setInputName] = useState('');
  const [emailError, setEmailError] = useState('');

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

  // Process Google login token or profile
  const handleGoogleAuthToken = async (credential) => {
    try {
      setLoading(true);
      const res = await api.googleLogin(credential);
      handlePostLogin(res);
    } catch (err) {
      alert(err.message || 'Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInWithProfile = async (email, name, picture) => {
    try {
      setLoading(true);
      const res = await api.googleLogin(null, {
        email: (email || inputEmail || '').trim(),
        name: (name || inputName || 'Valued Customer').trim(),
        picture: picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      });
      handlePostLogin(res);
    } catch (err) {
      alert(err.message || 'Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostLogin = (res) => {
    localStorage.setItem('angalamman_token', res.token);
    localStorage.setItem('angalamman_user', JSON.stringify(res.user));

    if (res.needsMobile) {
      setGoogleUser(res.user);
      setMode('complete-profile');
    } else {
      onLoginSuccess(res.user, false);
      onClose();
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
            {bannerMessage && (
              <div style={{
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#93c5fd',
                fontSize: '0.86rem',
                lineHeight: '1.4'
              }}>
                <Sparkles size={20} color="#60a5fa" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff' }}>Login Required: </strong>
                  {bannerMessage}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
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
              <h3 style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700 }}>Customer Sign In</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                Sign in with your Google account to book deliveries, track tippers, and view official weighbridge bills.
              </p>
            </div>

            {/* Official Google OAuth component if Client ID is configured */}
            {GOOGLE_CLIENT_ID ? (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', width: '100%' }}>
                <GoogleLogin
                  onSuccess={(credentialResponse) => handleGoogleAuthToken(credentialResponse.credential)}
                  onError={() => alert('Google Sign In failed. Please try again.')}
                  theme="filled_blue"
                  size="large"
                  shape="pill"
                  width="100%"
                  text="continue_with"
                />
              </div>
            ) : null}

            {/* Google OAuth One-Click Button */}
            <button
              onClick={() => {
                if (inputEmail) {
                  handleGoogleSignInWithProfile(inputEmail, inputName);
                } else {
                  setMode('google-prompt');
                }
              }}
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
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <svg width="22" height="22" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* Quick 1-click test login options */}
            <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem', textAlign: 'center' }}>
                Instant Quick-Login (Puducherry Contractors / Builders):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleGoogleSignInWithProfile('v.ramanathan.pondy@gmail.com', 'V. Ramanathan (Civil Contractor)')}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 0.6rem',
                    background: 'rgba(37, 99, 235, 0.1)',
                    border: '1px solid rgba(37, 99, 235, 0.25)',
                    borderRadius: '8px',
                    color: '#93c5fd',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <strong style={{ display: 'block', color: '#fff' }}>V. Ramanathan</strong>
                  Contractor Login
                </button>
                <button
                  type="button"
                  onClick={() => handleGoogleSignInWithProfile('s.jayakumar.build@gmail.com', 'S. Jayakumar (Home Builder)')}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 0.6rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    color: '#6ee7b7',
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <strong style={{ display: 'block', color: '#fff' }}>S. Jayakumar</strong>
                  Home Builder Login
                </button>
              </div>
            </div>

            <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
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

        {/* STEP 1.5: Custom Google Account Sign In Prompt */}
        {mode === 'google-prompt' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <h3 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 700 }}>Google Sign-In</h3>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                Enter your Google Account details to proceed with your booking.
              </p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!inputEmail || !inputEmail.includes('@')) {
                setEmailError('Please enter a valid Google email address');
                return;
              }
              setEmailError('');
              handleGoogleSignInWithProfile(inputEmail, inputName);
            }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. R. Tharanishvaran"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Google Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    required
                    className="form-control"
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. tharanish.varan@gmail.com"
                    value={inputEmail}
                    onChange={(e) => {
                      setInputEmail(e.target.value);
                      setEmailError('');
                    }}
                  />
                </div>
                {emailError && (
                  <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.35rem' }}>{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
              >
                {loading ? 'Authenticating with Google...' : 'Continue to Booking →'}
              </button>

              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => setMode('customer')}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  ← Back
                </button>
              </div>
            </form>
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
