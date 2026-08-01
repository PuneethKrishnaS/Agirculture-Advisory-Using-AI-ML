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
    <div className="bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed min-h-screen">
      {/* Top Navigation */}
      <nav className={`sticky top-0 z-[100] transition-all bg-surface/80 backdrop-blur-md h-16 flex justify-between items-center px-margin-mobile md:px-margin-desktop w-full ${isScrolled ? 'shadow-md' : ''}`}>
        <div className="flex items-center gap-2">
          <span translate="no" className="material-symbols-outlined notranslate text-primary text-3xl">eco</span>
          <span className="text-headline-md font-headline-md font-bold text-primary">AgriSmart</span>
        </div>
        <div className="hidden md:flex items-center gap-gutter">
          <Link to="/" className="text-label-lg font-label-lg text-primary hover:bg-surface-container-low px-3 py-2 rounded-lg transition-colors">Home</Link>
          <a href="#" className="text-label-lg font-label-lg text-on-surface-variant hover:bg-surface-container-low px-3 py-2 rounded-lg transition-colors">Input</a>
          <a href="#" className="text-label-lg font-label-lg text-on-surface-variant hover:bg-surface-container-low px-3 py-2 rounded-lg transition-colors">Advisory</a>
          <Link to="/login" className="bg-primary text-on-primary font-label-lg px-6 py-2 rounded-full hover:scale-105 active:scale-95 transition-all">Get Started</Link>
        </div>
        <div className="md:hidden">
          <span translate="no" className="material-symbols-outlined notranslate text-on-surface cursor-pointer" onClick={() => setMobileNavOpen(true)}>menu</span>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[795px] flex items-center justify-center overflow-hidden px-margin-mobile">
          <div className="relative z-10 max-w-4xl text-center flex flex-col items-center gap-base">
            <div className="bg-primary-fixed/20 text-on-primary-fixed-variant px-4 py-1 rounded-full text-label-md font-label-md mb-4 border border-primary-fixed/30">
              AI-POWERED PRECISION AGRICULTURE
            </div>
            <h1 className="font-display-lg text-display-lg md:text-[64px] text-primary leading-tight mb-gutter">
              The Future of Farming is <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-container">Explainable.</span>
            </h1>
            <p className="text-body-lg font-body-lg text-on-surface-variant max-w-2xl mb-xxl">
              Bridge the gap between advanced ML insights and field expertise. Predict yields, monitor soil health, and understand exactly *why* decisions are recommended.
            </p>
            <div className="flex flex-col sm:flex-row gap-gutter w-full sm:w-auto">
              <Link to="/login" className="bg-primary text-on-primary font-label-lg text-lg h-14 px-10 rounded-full hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                Start Your Free Prediction
                <span translate="no" className="material-symbols-outlined notranslate">arrow_forward</span>
              </Link>
              <button className="bg-surface glass-effect text-primary border border-primary/20 font-label-lg text-lg h-14 px-10 rounded-full hover:bg-surface-container transition-all flex items-center justify-center gap-2">
                View Demo
                <span translate="no" className="material-symbols-outlined notranslate">play_circle</span>
              </button>
            </div>
          </div>
          {/* Scroll Indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-1 opacity-50">
            <span className="text-label-md font-label-md text-on-surface-variant">Scroll</span>
            <span translate="no" className="material-symbols-outlined notranslate">expand_more</span>
          </div>
        </section>

        {/* Feature Grid (Bento Style) */}
        <section className="py-xxl px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
          <div className="text-center mb-xxl">
            <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">Tools for Modern Growth</h2>
            <p className="text-body-md font-body-md text-on-surface-variant">Intelligent modules designed to work as hard as you do.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* ML-Driven Insights */}
            <div className="hover:-translate-y-2 transition-all duration-300 bg-surface border border-outline/10 p-gutter rounded-xl shadow-sm flex flex-col gap-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-container"></div>
              <div className="bg-primary-fixed w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                <span translate="no" className="material-symbols-outlined notranslate">analytics</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">ML-Driven Insights</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Leverage neural networks trained on millions of crop cycles to predict yields with 94% accuracy.
              </p>
              <div className="mt-auto pt-md flex items-center gap-2 text-primary font-label-lg cursor-pointer">
                Learn more <span translate="no" className="material-symbols-outlined notranslate text-sm">chevron_right</span>
              </div>
            </div>
            {/* Weather Integration */}
            <div className="hover:-translate-y-2 transition-all duration-300 bg-surface border border-outline/10 p-gutter rounded-xl shadow-sm flex flex-col gap-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-secondary-container"></div>
              <div className="bg-secondary-fixed w-12 h-12 rounded-lg flex items-center justify-center text-secondary">
                <span translate="no" className="material-symbols-outlined notranslate">cloudy_snowing</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">Weather Integration</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">
                Hyper-local forecast modeling that connects atmospheric data directly to your soil moisture sensors.
              </p>
              <div className="mt-auto pt-md flex items-center gap-2 text-primary font-label-lg cursor-pointer">
                Explore mapping <span translate="no" className="material-symbols-outlined notranslate text-sm">chevron_right</span>
              </div>
            </div>
            {/* XAI Transparency */}
            <div className="hover:-translate-y-2 transition-all duration-300 bg-surface border border-outline/10 p-gutter rounded-xl shadow-sm flex flex-col gap-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-tertiary-container"></div>
              <div className="bg-tertiary-fixed w-12 h-12 rounded-lg flex items-center justify-center text-tertiary">
                <span translate="no" className="material-symbols-outlined notranslate">psychology</span>
              </div>
              <h3 className="font-headline-md text-headline-md text-primary">XAI Transparency</h3>
              <p className="text-body-md font-body-md text-on-surface-variant">
                No black boxes. Our Explainable AI explains the 'why' behind every alert so you can farm with confidence.
              </p>
              <div className="mt-auto pt-md flex items-center gap-2 text-primary font-label-lg cursor-pointer">
                See XAI in action <span translate="no" className="material-symbols-outlined notranslate text-sm">chevron_right</span>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section className="py-xxl bg-surface-container-low">
          <div className="px-margin-mobile md:px-margin-desktop max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-xxl">
            <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden shadow-xl">
              <img alt="Farmer Portrait" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAALxGGJ9ISST60zojQoekkjuBn8mdmxl2fyjDSyHw3rYNQbgfQ4maHh-kaq27BJ3dBlqxI4QBES52Kb7uur8Ur6raI9rVupvDFoWhqjkgQnbwdPkQZezxeoeodKa1W4zCjJ2cz_lLbreFyknrrhWNPIfoo0oMGj_8wjo2ktVEboXM4DEMH8XPB1YiYCWIrMxQbwCEi5R6jEC7Upv6kcRHpjnULWqo1QMDqjwpXvWLaERHYwBn4MLxdcjMytY827NQE9XGHq6_QKIgB"/>
            </div>
            <div className="w-full md:w-2/3">
              <span translate="no" className="material-symbols-outlined notranslate text-primary-container text-6xl opacity-30 mb-md">format_quote</span>
              <blockquote className="text-headline-md font-headline-md text-on-surface italic mb-lg">
                "AgriSmart changed how I look at my land. It's not just data; it's a partner that understands the nuances of my soil as well as I do, but with the power of thousands of years of weather history."
              </blockquote>
              <div className="flex flex-col">
                <span className="text-label-lg font-label-lg text-primary">Samuel Henderson</span>
                <span className="text-body-md font-body-md text-on-surface-variant">Proprietor, Henderson Organic Acres</span>
              </div>
              <div className="flex gap-1 mt-md text-tertiary">
                <span translate="no" className="material-symbols-outlined notranslate" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span translate="no" className="material-symbols-outlined notranslate" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span translate="no" className="material-symbols-outlined notranslate" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span translate="no" className="material-symbols-outlined notranslate" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                <span translate="no" className="material-symbols-outlined notranslate" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-xxl px-margin-mobile">
          <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-gutter md:p-xxl flex flex-col md:flex-row items-center gap-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex-1 text-center md:text-left">
              <h2 className="text-headline-lg font-headline-lg text-on-primary mb-sm">Ready to scale?</h2>
              <p className="text-on-primary/80 font-body-md">Join 12,000+ growers using AgriSmart to optimize their harvest.</p>
            </div>
            <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-sm">
              <input className="bg-on-primary/10 border-on-primary/20 text-on-primary placeholder:text-on-primary/60 px-6 py-3 rounded-full focus:ring-2 focus:ring-on-primary w-full sm:w-64 outline-none" placeholder="Enter your email" type="email"/>
              <button className="bg-primary-fixed text-on-primary-fixed font-label-lg px-8 py-3 rounded-full hover:bg-white transition-all whitespace-nowrap">Get Free Access</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface pt-xxl pb-gutter px-margin-mobile md:px-margin-desktop border-t border-outline/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-xxl mb-xxl">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-md">
              <span translate="no" className="material-symbols-outlined notranslate text-primary text-2xl">eco</span>
              <span className="text-headline-md font-headline-md font-bold text-primary">AgriSmart</span>
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Sustainable precision agriculture for the next generation of food security.
            </p>
          </div>
          <div>
            <h4 className="text-label-lg font-label-lg text-on-surface mb-gutter">Platform</h4>
            <ul className="flex flex-col gap-sm text-body-md font-body-md text-on-surface-variant">
              <li><a className="hover:text-primary" href="#">ML Predictions</a></li>
              <li><a className="hover:text-primary" href="#">XAI Insights</a></li>
              <li><a className="hover:text-primary" href="#">Integration Hub</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-lg font-label-lg text-on-surface mb-gutter">Resources</h4>
            <ul className="flex flex-col gap-sm text-body-md font-body-md text-on-surface-variant">
              <li><a className="hover:text-primary" href="#">Help Center</a></li>
              <li><a className="hover:text-primary" href="#">API Documentation</a></li>
              <li><a className="hover:text-primary" href="#">System Health</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-label-lg font-label-lg text-on-surface mb-gutter">Company</h4>
            <ul className="flex flex-col gap-sm text-body-md font-body-md text-on-surface-variant">
              <li><a className="hover:text-primary" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-primary" href="#">Terms of Service</a></li>
              <li><a className="hover:text-primary" href="#">Farmer Stories</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-gutter border-t border-outline/5 text-label-md font-label-md text-on-surface-variant/60">
          <p>© 2024 AgriSmart Inc. All rights reserved.</p>
          <div className="flex gap-gutter mt-sm md:mt-0">
            <span>Version v1.0.4</span>
            <div className="flex gap-md">
              <span translate="no" className="material-symbols-outlined notranslate cursor-pointer hover:text-primary">language</span>
              <span translate="no" className="material-symbols-outlined notranslate cursor-pointer hover:text-primary">share</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Shell Overlay Logic */}
      <div className={`fixed inset-0 z-[110] bg-surface-container-lowest/90 backdrop-blur-xl transition-transform duration-300 md:hidden ${mobileNavOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full py-xxl px-margin-mobile">
          <div className="flex justify-end mb-xxl">
            <button className="p-2 bg-surface-container-high rounded-full" onClick={() => setMobileNavOpen(false)}>
              <span translate="no" className="material-symbols-outlined notranslate">close</span>
            </button>
          </div>
          <div className="flex flex-col gap-lg">
            <Link to="/" onClick={() => setMobileNavOpen(false)} className="text-headline-md font-headline-md text-primary flex items-center justify-between">Home <span translate="no" className="material-symbols-outlined notranslate">arrow_forward</span></Link>
            <a href="#" className="text-headline-md font-headline-md text-on-surface flex items-center justify-between">Input <span translate="no" className="material-symbols-outlined notranslate">arrow_forward</span></a>
            <a href="#" className="text-headline-md font-headline-md text-on-surface flex items-center justify-between">Advisory <span translate="no" className="material-symbols-outlined notranslate">arrow_forward</span></a>
            <a href="#" className="text-headline-md font-headline-md text-on-surface flex items-center justify-between">Alerts <span translate="no" className="material-symbols-outlined notranslate">arrow_forward</span></a>
            <a href="#" className="text-headline-md font-headline-md text-on-surface flex items-center justify-between">Reports <span translate="no" className="material-symbols-outlined notranslate">arrow_forward</span></a>
          </div>
          <div className="mt-auto">
            <Link to="/login" onClick={() => setMobileNavOpen(false)} className="w-full flex items-center justify-center bg-primary text-on-primary h-14 rounded-full font-label-lg">Get Started</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
