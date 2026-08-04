import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Top Navigation */}
      <nav className={`sticky top-0 z-[100] transition-all bg-background/80 backdrop-blur-md h-16 flex justify-between items-center px-4 md:px-8 w-full border-b ${isScrolled ? 'border-border' : 'border-transparent'}`}>
        <div className="flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined notranslate text-primary text-3xl">eco</span>
          <span className="text-2xl font-bold text-primary">AgriSmart</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-semibold text-primary hover:bg-muted px-3 py-2 rounded-lg transition-colors">Home</Link>
          <Link to="/login" className="bg-primary text-primary-foreground text-sm font-semibold px-6 py-2 rounded-full hover:scale-105 active:scale-95 transition-all">Login / Register</Link>
        </div>
        <div className="md:hidden">
          <span translate="no" className="material-symbols-outlined notranslate text-foreground cursor-pointer" onClick={() => setMobileNavOpen(true)}>menu</span>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden px-4">
          <div className="relative z-10 max-w-4xl text-center flex flex-col items-center gap-4">
            <div className="bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium mb-4 border border-primary/20">
              AI-POWERED PRECISION AGRICULTURE
            </div>
            <h1 className="text-5xl md:text-[64px] font-extrabold text-foreground leading-tight mb-6 tracking-tight">
              The Future of Farming is <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Explainable.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-12">
              A comprehensive ML system to predict crop yields, recommend fertilizers, detect plant diseases, and understand exactly *why* decisions are recommended.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <Link to="/login" className="bg-primary text-primary-foreground font-semibold text-lg h-14 px-10 rounded-full hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                Start Your Prediction
                <span translate="no" className="material-symbols-outlined notranslate">arrow_forward</span>
              </Link>
            </div>
          </div>
          
          {/* Ambient background blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        </section>

        {/* Feature Grid */}
        <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-foreground mb-4 tracking-tight">Core Features</h2>
            <p className="text-lg text-muted-foreground">The machine learning capabilities powering AgriSmart.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* ML-Driven Insights */}
            <div className="hover:-translate-y-2 transition-all duration-300 bg-card border border-border p-8 rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden group">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                <span translate="no" className="material-symbols-outlined notranslate">analytics</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Tabular ML Predictions</h3>
              <p className="text-sm text-muted-foreground">
                Gradient Boosting models (XGBoost, LightGBM) trained on agricultural data to predict optimal crops and fertilizers.
              </p>
            </div>
            {/* Disease Detection */}
            <div className="hover:-translate-y-2 transition-all duration-300 bg-card border border-border p-8 rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden group">
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                <span translate="no" className="material-symbols-outlined notranslate">coronavirus</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Disease Detection</h3>
              <p className="text-sm text-muted-foreground">
                A custom PyTorch ResNet9 Convolutional Neural Network that classifies crop leaf diseases from uploaded images.
              </p>
            </div>
            {/* XAI Transparency */}
            <div className="hover:-translate-y-2 transition-all duration-300 bg-card border border-border p-8 rounded-2xl shadow-sm flex flex-col gap-4 relative overflow-hidden group">
              <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center text-purple-500 mb-2 group-hover:scale-110 transition-transform">
                <span translate="no" className="material-symbols-outlined notranslate">psychology</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Explainable AI (XAI)</h3>
              <p className="text-sm text-muted-foreground">
                Integration with SHAP values to explain the specific feature impacts (like Nitrogen or pH) driving the predictions.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background pt-12 pb-8 px-4 md:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span translate="no" className="material-symbols-outlined notranslate text-primary text-xl">eco</span>
            <span className="text-base font-bold text-primary">AgriSmart AI Labs</span>
          </div>
          <p>Academic Project - Agriculture Advisory using Machine Learning</p>
        </div>
      </footer>

      {/* Mobile Navigation Shell Overlay Logic */}
      <div className={`fixed inset-0 z-[110] bg-background/95 backdrop-blur-xl transition-transform duration-300 md:hidden ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full py-16 px-4">
          <div className="flex justify-end mb-16">
            <button className="p-2 bg-muted rounded-full text-foreground hover:bg-border transition-colors" onClick={() => setMobileNavOpen(false)}>
              <span translate="no" className="material-symbols-outlined notranslate">close</span>
            </button>
          </div>
          <div className="flex flex-col gap-8">
            <Link to="/" onClick={() => setMobileNavOpen(false)} className="text-2xl font-bold text-primary flex items-center justify-between">Home <span translate="no" className="material-symbols-outlined notranslate">arrow_forward</span></Link>
          </div>
          <div className="mt-auto">
            <Link to="/login" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center bg-primary text-primary-foreground h-14 rounded-full font-bold text-lg hover:opacity-90 transition-opacity">Login / Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
