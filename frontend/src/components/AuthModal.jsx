import React, { useState, useCallback } from 'react';
import { User, Phone, X, CheckCircle2, Lock, Mail, Eye, EyeOff, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import BrandLogo from './BrandLogo';
import { api } from '../api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '547111778244-o780h96i0cvr63k5ubhuasmk53k13a40.apps.googleusercontent.com';

// Isolated and memoized so typing in form inputs never re-renders Google's OAuth iframe
const MemoizedGoogleButton = React.memo(function MemoizedGoogleButton({ onAuth, onError }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', maxWidth: '340px' }}>
      <GoogleLogin
        onSuccess={(credentialResponse) => onAuth(credentialResponse.credential)}
        onError={onError}
        theme="outline"
        size="large"
        shape="pill"
        text="continue_with"
        width="300"
        logo_alignment="left"
      />
    </div>
  );
});

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess, 
  bannerMessage = ''
}) {
  const [tab, setTab] = useState('signin'); // 'signin' or 'signup'
  const [mode, setMode] = useState('auth'); // 'auth' or 'complete-profile'
  const [googleUser, setGoogleUser] = useState(null);

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Sign Up Form
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpMobile, setSignUpMobile] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showSignUpConfirm, setShowSignUpConfirm] = useState(false);

  // Profile Mobile Form (Google users without phone)
  const [profileMobile, setProfileMobile] = useState('');

  // Errors & UI
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [loading, setLoading] = useState(false);

  // Indian mobile validation helper
  const isValidMobile = (num) => {
    const cleaned = (num || '').replace(/[\s\-\+]/g, '');
    const digits = cleaned.startsWith('91') && cleaned.length === 12 ? cleaned.slice(2) : cleaned;
    return /^[6-9]\d{9}$/.test(digits);
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim());
  };

  const handlePostLogin = useCallback((res) => {
    localStorage.setItem('angalamman_token', res.token);

    if (res.is_admin) {
      localStorage.setItem('angalamman_admin', JSON.stringify(res.user));
      onLoginSuccess(res.user, true);
      onClose();
      return;
    }

    localStorage.setItem('angalamman_user', JSON.stringify(res.user));

    if (res.needsMobile) {
      setGoogleUser(res.user);
      setMode('complete-profile');
    } else {
      onLoginSuccess(res.user, false);
      onClose();
    }
  }, [onLoginSuccess, onClose]);

  // 1. Google OAuth Token Handler (Instant)
  const handleGoogleAuthToken = useCallback(async (credential) => {
    try {
      setLoading(true);
      setGeneralError('');
      const res = await api.googleLogin(credential);
      handlePostLogin(res);
    } catch (err) {
      setGeneralError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [handlePostLogin]);

  // 2. Sign In Handler
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const newErrors = {};

    if (!isValidEmail(signInEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!signInPassword) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      const res = await api.login(signInEmail, signInPassword);
      handlePostLogin(res);
    } catch (err) {
      setGeneralError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // 3. Sign Up Handler
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    const newErrors = {};

    if (!signUpName || signUpName.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }
    if (!isValidEmail(signUpEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!isValidMobile(signUpMobile)) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number (e.g., 9944076675)';
    }
    if (!signUpPassword || signUpPassword.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (signUpPassword !== signUpConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      const res = await api.register({
        name: signUpName.trim(),
        email: signUpEmail.trim(),
        mobile: signUpMobile.trim(),
        password: signUpPassword
      });
      handlePostLogin(res);
    } catch (err) {
      setGeneralError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 4. Save Mobile for Google User
  const handleSaveMobile = async (e) => {
    e.preventDefault();
    if (!isValidMobile(profileMobile)) {
      setErrors({ profileMobile: 'Please enter a valid 10-digit Indian mobile number' });
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      const res = await api.updateProfile({ mobile: profileMobile });
      localStorage.setItem('angalamman_user', JSON.stringify(res.user));
      onLoginSuccess(res.user, false);
      onClose();
    } catch (err) {
      setGeneralError(err.message || 'Failed to update phone number');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999, padding: '0.75rem' }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '460px', 
          width: '100%', 
          maxHeight: '92vh', 
          overflowY: 'auto', 
          padding: '1.75rem 1.25rem',
          boxSizing: 'border-box'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', zIndex: 10 }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* STEP 1: Main Auth (Sign In / Sign Up / Google) */}
        {mode === 'auth' && (
          <div>
            {bannerMessage && (
              <div style={{
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: '#93c5fd',
                fontSize: '0.85rem',
                lineHeight: '1.4'
              }}>
                <Sparkles size={18} color="#60a5fa" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#fff' }}>Login Required: </strong>
                  {bannerMessage}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.85rem' }}>
                <BrandLogo size={58} showRing={true} showAura={true} showShine={true} showSparkles={true} />
              </div>
              <h3 style={{ fontSize: '1.45rem', color: '#fff', fontWeight: 700 }}>
                {tab === 'signin' ? 'Welcome Back' : 'Create Customer Account'}
              </h3>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                {tab === 'signin' 
                  ? 'Sign in to access your quotations, site deliveries, and invoices.' 
                  : 'Register to book trucks, request quotations, and track orders.'}
              </p>
            </div>

            {/* Error Banner */}
            {generalError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '10px',
                padding: '0.75rem',
                marginBottom: '1.25rem',
                color: '#f87171',
                fontSize: '0.85rem',
                textAlign: 'center'
              }}>
                {generalError}
              </div>
            )}

            {/* OPTION 1: Continue with Google (Original Google OAuth - Memoized for zero typing lag) */}
            <div style={{ marginBottom: '1.25rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
              <MemoizedGoogleButton
                onAuth={handleGoogleAuthToken}
                onError={() => setGeneralError('Google Sign-In was cancelled or failed.')}
              />
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
              <span style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Or with email
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            {/* Tab Switcher: Sign In vs Create Account */}
            <div style={{
              display: 'flex',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              padding: '0.3rem',
              marginBottom: '1.25rem',
              gap: '0.3rem'
            }}>
              <button
                type="button"
                onClick={() => { setTab('signin'); setErrors({}); setGeneralError(''); }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: tab === 'signin' ? '#2563eb' : 'transparent',
                  color: tab === 'signin' ? '#ffffff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => { setTab('signup'); setErrors({}); setGeneralError(''); }}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: tab === 'signup' ? '#2563eb' : 'transparent',
                  color: tab === 'signup' ? '#ffffff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.2s'
                }}
              >
                <UserPlus size={15} />
                <span>Create Account</span>
              </button>
            </div>

            {/* TAB A: SIGN IN FORM */}
            {tab === 'signin' && (
              <form onSubmit={handleSignInSubmit}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="form-control"
                      style={{ paddingLeft: '38px' }}
                      value={signInEmail}
                      onChange={(e) => {
                        setSignInEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                    />
                  </div>
                  {errors.email && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.email}</p>}
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type={showSignInPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter password"
                      className="form-control"
                      style={{ paddingLeft: '38px', paddingRight: '40px' }}
                      value={signInPassword}
                      onChange={(e) => {
                        setSignInPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPassword(!showSignInPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      aria-label={showSignInPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignInPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* TAB B: CREATE ACCOUNT (SIGN UP) FORM */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUpSubmit}>
                <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="text"
                      required
                      placeholder="Enter full name"
                      className="form-control"
                      style={{ paddingLeft: '38px' }}
                      value={signUpName}
                      onChange={(e) => {
                        setSignUpName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                      }}
                    />
                  </div>
                  {errors.name && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.name}</p>}
                </div>

                <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      className="form-control"
                      style={{ paddingLeft: '38px' }}
                      value={signUpEmail}
                      onChange={(e) => {
                        setSignUpEmail(e.target.value);
                        if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                      }}
                    />
                  </div>
                  {errors.email && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.email}</p>}
                </div>

                <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                  <label className="form-label">Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.88rem', fontWeight: 600 }}>
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      placeholder="Enter 10-digit number"
                      className="form-control"
                      style={{ paddingLeft: '45px' }}
                      value={signUpMobile}
                      onChange={(e) => {
                        setSignUpMobile(e.target.value.replace(/\D/g, ''));
                        if (errors.mobile) setErrors(prev => ({ ...prev, mobile: '' }));
                      }}
                    />
                  </div>
                  {errors.mobile && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.mobile}</p>}
                </div>

                <div className="form-group" style={{ marginBottom: '0.9rem' }}>
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type={showSignUpPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      className="form-control"
                      style={{ paddingLeft: '38px', paddingRight: '40px' }}
                      value={signUpPassword}
                      onChange={(e) => {
                        setSignUpPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      aria-label={showSignUpPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.password}</p>}
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    <input
                      type={showSignUpConfirm ? 'text' : 'password'}
                      required
                      placeholder="Re-enter password"
                      className="form-control"
                      style={{ paddingLeft: '38px', paddingRight: '40px' }}
                      value={signUpConfirmPassword}
                      onChange={(e) => {
                        setSignUpConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignUpConfirm(!showSignUpConfirm)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: 0
                      }}
                      aria-label={showSignUpConfirm ? 'Hide password' : 'Show password'}
                    >
                      {showSignUpConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.3rem' }}>{errors.confirmPassword}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem', fontWeight: 700 }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 2: Complete Profile (Mobile Number for Google login only) */}
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
              <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Add Your Mobile Number</h3>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                Required for vehicle dispatch coordination and weighbridge SMS receipts.
              </p>
            </div>

            <form onSubmit={handleSaveMobile}>
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label">10-Digit Indian Mobile Number *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    placeholder="Enter 10-digit number"
                    className="form-control"
                    style={{ paddingLeft: '45px', fontSize: '1.1rem', letterSpacing: '0.05em' }}
                    value={profileMobile}
                    onChange={(e) => {
                      setProfileMobile(e.target.value.replace(/\D/g, ''));
                      setErrors({});
                    }}
                  />
                </div>
                {errors.profileMobile && (
                  <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                    {errors.profileMobile}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-orange"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem', fontWeight: 700 }}
              >
                {loading ? 'Saving...' : 'Confirm & Continue'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
