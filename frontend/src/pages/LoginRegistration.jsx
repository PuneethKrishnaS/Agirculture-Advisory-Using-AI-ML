import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const LoginRegistration = () => {
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
    <div className="bg-background min-h-screen flex flex-col md:flex-row overflow-hidden w-full">
      {/* Left Side: Visual Anchor & Branding */}
      <div className="hidden md:flex w-1/2 relative bg-primary/10 overflow-hidden items-center justify-center">
        {/* Background Animation Effect */}
        <div className="relative z-10 text-center px-12 max-w-lg">
          <span 
            translate="no" className="material-symbols-outlined notranslate text-[80px] text-primary mb-8" 
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
          <h1 className="text-4xl font-extrabold text-primary mb-4 tracking-tight">AgriSmart</h1>
          <p className="text-lg text-primary/80">
            Bridging advanced AI precision with grounded agricultural wisdom. Securely manage your yields, advisory, and system health in one unified interface.
          </p>
        </div>
        {/* Decorative Pattern */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/20 to-transparent"></div>
      </div>

      {/* Right Side: Authentication Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        {/* TopAppBar (Simulated for Branding on Mobile) */}
        <div className="md:hidden w-full flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <span 
              translate="no" className="material-symbols-outlined notranslate text-primary" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              eco
            </span>
            <span className="text-xl font-bold text-primary">AgriSmart</span>
          </div>
        </div>

        {/* Auth Container */}
        <div className="w-full max-w-md">
          <header className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome Back
            </h2>
            <p className="text-sm text-muted-foreground">Access your agricultural intelligence dashboard</p>
          </header>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground" htmlFor="identity">
                Email
              </label>
              <div className="relative">
                <span 
                  translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: identityFocus ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                >
                  alternate_email
                </span>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-background text-foreground border-2 border-border focus:border-primary rounded-lg text-sm transition-all outline-none" 
                  id="identity" 
                  name="identity" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. farmer@agrismart.io"
                  required 
                  type="email"
                  onFocus={() => setIdentityFocus(true)}
                  onBlur={() => setIdentityFocus(false)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <Link className="text-sm font-semibold text-primary hover:underline" to="#">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span 
                  translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: passwordFocus ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                >
                  lock
                </span>
                <input 
                  className="w-full h-14 pl-12 pr-12 bg-background text-foreground border-2 border-border focus:border-primary rounded-lg text-sm transition-all outline-none" 
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span translate="no" className="material-symbols-outlined notranslate">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary" 
                id="remember" 
                name="remember" 
                type="checkbox"
              />
              <label className="text-sm text-foreground" htmlFor="remember">
                Keep me logged in for 30 days
              </label>
            </div>

            <button 
              className="w-full h-14 bg-primary text-primary-foreground font-bold text-lg rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group" 
              type="submit"
            >
              <span>Secure Sign In</span>
              <span translate="no" className="material-symbols-outlined notranslate transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Social/Alt Sign In */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="w-full flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-border"></div>
              <span className="text-sm font-semibold text-muted-foreground">OR</span>
              <div className="h-[1px] flex-1 bg-border"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link className="text-primary font-bold hover:underline" to="/register">
                Register New Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Background Decoration (Ambient Atmosphere) */}
      <div className="fixed top-0 right-0 -z-10 pointer-events-none opacity-20">
        <div className="w-96 h-96 bg-primary/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default LoginRegistration;
