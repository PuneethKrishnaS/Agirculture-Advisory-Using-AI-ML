import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const RegisterFarmer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [farmName, setFarmName] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/auth/register', {
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
    <div className="bg-surface min-h-screen flex flex-col md:flex-row overflow-hidden w-full">
      {/* Left Side: Visual Anchor */}
      <div className="hidden md:flex w-1/2 relative bg-primary-container overflow-hidden items-center justify-center">
        <div className="relative z-10 text-center px-xl max-w-lg">
          <span translate="no" className="material-symbols-outlined notranslate text-[80px] text-on-primary-container mb-lg" style={{ fontVariationSettings: "'FILL' 1" }}>agriculture</span>
          <h1 className="font-headline-lg text-headline-lg text-on-primary-container mb-md">Join AgriSmart</h1>
          <p className="font-body-lg text-body-lg text-on-primary-container/90">
            Create your farmer profile. Access precise AI insights, weather predictions, and tailored advisory for your unique fields.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/20 to-transparent"></div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-margin-mobile md:p-margin-desktop overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <header className="mb-xl text-center md:text-left mt-8 md:mt-0">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-xs">Register Farmer</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Fill in your details to create an account.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface-variant">Email</label>
              <div className="relative">
                <span translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-outline">alternate_email</span>
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-surface text-on-surface border-2 border-outline-variant focus:border-secondary rounded-lg font-body-md outline-none" 
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="farmer@agrismart.io" required type="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface-variant">Password</label>
              <div className="relative">
                <span translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-outline">lock</span>
                <input 
                  className="w-full h-12 pl-12 pr-12 bg-surface text-on-surface border-2 border-outline-variant focus:border-secondary rounded-lg font-body-md outline-none" 
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required type={showPassword ? "text" : "password"}
                />
                <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" onClick={() => setShowPassword(!showPassword)}>
                  <span translate="no" className="material-symbols-outlined notranslate">{showPassword ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block font-label-lg text-label-lg text-on-surface-variant">Farm Name</label>
              <div className="relative">
                <span translate="no" className="material-symbols-outlined notranslate absolute left-4 top-1/2 -translate-y-1/2 text-outline">home_work</span>
                <input 
                  className="w-full h-12 pl-12 pr-4 bg-surface text-on-surface border-2 border-outline-variant focus:border-secondary rounded-lg font-body-md outline-none" 
                  value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder="e.g. Sunny Vale Farm" required type="text"
                />
              </div>
            </div>

            <button 
              className="w-full h-14 mt-8 bg-primary text-on-primary font-headline-md text-headline-md rounded-lg shadow-sm hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-sm group" 
              type="submit"
            >
              <span>Complete Registration</span>
              <span translate="no" className="material-symbols-outlined notranslate transition-transform group-hover:translate-x-1">check_circle</span>
            </button>
          </form>

          <div className="mt-8 text-center pb-8">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Already have an account?{' '}
              <Link className="text-secondary font-bold hover:underline" to="/login">Sign In Here</Link>
            </p>
          </div>
        </div>
      </div>

      <div className="fixed top-0 right-0 -z-10 pointer-events-none opacity-20">
        <div className="w-96 h-96 bg-primary-container rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

export default RegisterFarmer;
