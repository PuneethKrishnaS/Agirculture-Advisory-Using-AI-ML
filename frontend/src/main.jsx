import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import LandingPage from './pages/LandingPage.jsx'
import LoginRegistration from './pages/LoginRegistration.jsx'
import MainDashboard from './pages/MainDashboard.jsx'
import Advisory from './pages/Advisory.jsx'
import DataInput from './pages/DataInput.jsx'

import Reports from './pages/Reports.jsx'
import RegisterFarmer from './pages/RegisterFarmer.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'
import { PlotProvider } from './contexts/PlotContext.jsx'
import PlotGuard from './components/PlotGuard.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlotProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginRegistration />} />
            <Route path="/register" element={<RegisterFarmer />} />
            <Route path="/dashboard" element={<PlotGuard><MainDashboard /></PlotGuard>} />
            <Route path="/input" element={<PlotGuard><DataInput /></PlotGuard>} />
            <Route path="/advisory" element={<PlotGuard><Advisory /></PlotGuard>} />

            <Route path="/reports" element={<PlotGuard><Reports /></PlotGuard>} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </PlotProvider>
  </StrictMode>,
)
