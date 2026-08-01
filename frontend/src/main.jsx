import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import LoginRegistration from './pages/LoginRegistration.jsx'
import MainDashboard from './pages/MainDashboard.jsx'
import Advisory from './pages/Advisory.jsx'
import DataInput from './pages/DataInput.jsx'
import Alerts from './pages/Alerts.jsx'
import Reports from './pages/Reports.jsx'
import RegisterFarmer from './pages/RegisterFarmer.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { PlotProvider } from './contexts/PlotContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlotProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginRegistration />} />
            <Route path="/register" element={<RegisterFarmer />} />
            <Route path="/dashboard" element={<MainDashboard />} />
            <Route path="/input" element={<DataInput />} />
            <Route path="/advisory" element={<Advisory />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </PlotProvider>
  </StrictMode>,
)
