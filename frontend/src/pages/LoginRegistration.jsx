import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const LoginRegistration = () => {
  const [role, setRole] = useState('farmer'); // 'farmer' or 'admin'
  const [showPassword, setShowPassword] = useState(false);
  const [identityFocus, setIdentityFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = '/api/auth/login';
    
    fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        addToast(data.error, 'error');
      } else {
        addToast("Login successful!", 'success');
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    })
    .catch(err => {
      console.error("Auth error:", err);
      addToast("Authentication failed.", 'error');
    });
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col md:flex-row overflow-hidden w-full">
      {/* Left Side: Visual Anchor & Branding */}
      <div className="hidden md:flex w-1/2 relative bg-primary-container overflow-hidden items-center justify-center">
        {/* Background Animation Effect */}
        <div className="relative z-10 text-center px-xl max-w-lg">
          <span 
            translate="no" className="material-symbols-outlined notranslate text-[80px] text-on-primary-container mb-lg" 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-primary-container mb-md">AgriSmart</h1>
          <p className="font-body-lg text-body-lg text-on-primary-container/90">
            Bridging advanced AI precision with grounded agricultural wisdom. Securely manage your yields, advisory, and system health in one unified interface.
          </p>
        </div>
        {/* Decorative Pattern */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/20 to-transparent"></div>
      </div>

      {/* Right Side: Authentication Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop overflow-y-auto">
        {/* TopAppBar (Simulated for Branding on Mobile) */}
        <div className="md:hidden w-full flex justify-between items-center mb-xl">
          <div className="flex items-center gap-xs">
            <span 
              translate="no" className="material-symbols-outlined notranslate text-primary" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary">AgriSmart</span>
          </div>
        </div>

        {/* Auth Container */}
        <div className="w-full max-w-md">
          <header className="mb-xl text-center md:text-left">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">
              Welcome Back
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Access your agricultural intelligence dashboard</p>
          </header>

          {/* Role Selection Segmented Control */}
          <div className="bg-surface-container p-xs rounded-xl flex mb-xl">
            <button 
              className={`flex-1 py-3 px-md rounded-lg font-label-lg text-label-lg transition-all duration-300 ${role === 'farmer' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}
              onClick={() => setRole('farmer')}
            >
              Farmer / User
            </button>
            <button 
              className={`flex-1 py-3 px-md rounded-lg font-label-lg text-label-lg transition-all duration-300 ${role === 'admin' ? 'bg-primary text-white' : 'text-on-surface-variant'}`}
              onClick={() => setRole('admin')}
            >
              System Admin
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-lg">
            <div className="space-y-sm">
              <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="identity">
                Email
              </label>
              <div className="relative">
                <span 
                  translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: identityFocus ? '#00629e' : '#717a6d' }}
                >
                  alternate_email
                </span>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-surface text-on-surface border-2 border-outline-variant focus:border-secondary rounded-lg font-body-md transition-all outline-none" 
                  id="identity" 
                  name="identity" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'farmer' ? "e.g. farmer@agrismart.io" : "e.g. admin_01@agrismart.io"}
                  required 
                  type="email"
                  onFocus={() => setIdentityFocus(true)}
                  onBlur={() => setIdentityFocus(false)}
                />
              </div>
            </div>

            <div className="space-y-sm">
              <div className="flex justify-between items-center">
                <label className="block font-label-lg text-label-lg text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <Link className="font-label-md text-label-md text-secondary hover:underline" to="#">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span 
                  translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: passwordFocus ? '#00629e' : '#717a6d' }}
                >
                  lock
                </span>
                <input 
                  className="w-full h-14 pl-12 pr-12 bg-surface text-on-surface border-2 border-outline-variant focus:border-secondary rounded-lg font-body-md transition-all outline-none" 
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                />
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span translate="no" className="material-symbols-outlined notranslate">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-sm">
              <input 
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary-container" 
                id="remember" 
                name="remember" 
                type="checkbox"
              />
              <label className="font-body-md text-body-md text-on-surface" htmlFor="remember">
                Keep me logged in for 30 days
              </label>
            </div>

            <button 
              className="w-full h-14 bg-primary text-on-primary font-headline-md text-headline-md rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-sm group" 
              type="submit"
            >
              <span>Secure Sign In</span>
              <span translate="no" className="material-symbols-outlined notranslate transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Social/Alt Sign In */}
          <div className="mt-xl flex flex-col items-center gap-lg">
            <div className="w-full flex items-center gap-md">
              <div className="h-[1px] flex-1 bg-outline-variant"></div>
              <span className="font-label-md text-label-md text-outline">OR REGISTER</span>
              <div className="h-[1px] flex-1 bg-outline-variant"></div>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?{' '}
              <Link className="text-secondary font-bold hover:underline" to="/register">
                Register New Account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer / Support Link */}
        <footer className="mt-xxl w-full max-w-md flex justify-between items-center opacity-60">
          <span className="font-label-md text-label-md text-on-surface-variant">v1.0.4 - Secure Protocol</span>
          <div className="flex gap-md">
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface" to="#">Help</Link>
            <Link className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface" to="#">Privacy</Link>
          </div>
        </footer>
      </div>

      {/* Background Decoration (Ambient Atmosphere) */}
      <div className="fixed top-0 right-0 -z-10 pointer-events-none opacity-20">
        <div className="w-96 h-96 bg-primary-container rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default LoginRegistration;
