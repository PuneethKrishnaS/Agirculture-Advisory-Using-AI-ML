import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import { useToast } from '../contexts/ToastContext';

const RegisterFarmer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [farmNameFocus, setFarmNameFocus] = useState(false);
  
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, farmName })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        addToast(data.error, 'error');
      } else {
        addToast("Farmer Registration successful! Please sign in.", 'success');
        navigate('/login');
      }
    })
    .catch(err => {
      console.error("Auth error:", err);
      addToast("Registration failed.", 'error');
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
            agriculture
          </span>
          <h1 className="text-4xl font-extrabold text-primary mb-4 tracking-tight">Join AgriSmart</h1>
          <p className="text-lg text-primary/80">
            Create your profile to access precise AI insights, weather predictions, and tailored advisory for your unique fields.
          </p>
        </div>
        {/* Decorative Pattern */}
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/20 to-transparent"></div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
        {/* TopAppBar (Simulated for Branding on Mobile) */}
        <div className="md:hidden w-full flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <span 
              translate="no" className="material-symbols-outlined notranslate text-primary" 
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              agriculture
            </span>
            <span className="text-xl font-bold text-primary">Join AgriSmart</span>
          </div>
        </div>

        <div className="w-full max-w-md my-auto">
          <header className="mb-10 text-center md:text-left mt-8 md:mt-0">
            <h2 className="text-3xl font-bold text-foreground mb-2">Register</h2>
            <p className="text-sm text-muted-foreground">Fill in your details to create an account.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground">Email</label>
              <div className="relative">
                <span 
                  translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: emailFocus ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                >
                  alternate_email
                </span>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-background text-foreground border-2 border-border focus:border-primary rounded-lg text-sm transition-all outline-none" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  placeholder="farmer@agrismart.io" 
                  required 
                  type="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground">Password</label>
              <div className="relative">
                <span 
                  translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: passwordFocus ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                >
                  lock
                </span>
                <input 
                  className="w-full h-14 pl-12 pr-12 bg-background text-foreground border-2 border-border focus:border-primary rounded-lg text-sm transition-all outline-none" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  placeholder="••••••••" 
                  required 
                  type={showPassword ? "text" : "password"}
                />
                <button 
                  type="button" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span translate="no" className="material-symbols-outlined notranslate">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-muted-foreground">Farm Name</label>
              <div className="relative">
                <span 
                  translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: farmNameFocus ? 'var(--color-primary)' : 'var(--color-muted-foreground)' }}
                >
                  home_work
                </span>
                <input 
                  className="w-full h-14 pl-12 pr-4 bg-background text-foreground border-2 border-border focus:border-primary rounded-lg text-sm transition-all outline-none" 
                  value={farmName} 
                  onChange={(e) => setFarmName(e.target.value)} 
                  onFocus={() => setFarmNameFocus(true)}
                  onBlur={() => setFarmNameFocus(false)}
                  placeholder="e.g. Sunny Vale Farm" 
                  required 
                  type="text"
                />
              </div>
            </div>

            <button 
              className="w-full h-14 mt-8 bg-primary text-primary-foreground font-bold text-lg rounded-lg shadow-sm hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group" 
              type="submit"
            >
              <span>Complete Registration</span>
              <span translate="no" className="material-symbols-outlined notranslate transition-transform group-hover:translate-x-1">check_circle</span>
            </button>
          </form>

          <div className="mt-10 flex flex-col items-center gap-6 pb-8">
            <div className="w-full flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-border"></div>
              <span className="text-sm font-semibold text-muted-foreground">OR</span>
              <div className="h-[1px] flex-1 bg-border"></div>
            </div>
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link className="text-primary font-bold hover:underline" to="/login">Sign In Here</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed top-0 right-0 -z-10 pointer-events-none opacity-20">
        <div className="w-96 h-96 bg-primary/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default RegisterFarmer;
