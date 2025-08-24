// RouterExample.jsx
// Example integration using React Router. This does not modify your Next.js setup;
// it's purely a sample you can adapt if you run a standalone React SPA route layer.

import React from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import ForgotPassword from './ForgotPassword'
import ResetPassword from './ResetPassword'

function LoginPage() {
  // Example login page showing success banner after reset
  const location = useLocation()
  const resetSuccess = location?.state?.resetSuccess
  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 16 }}>
      <h1>Login</h1>
      {resetSuccess && (
        <div role="status" style={{ background: '#E6FFFA', padding: 12, border: '1px solid #B2F5EA', marginBottom: 12 }}>
          Your password has been updated. You can sign in now.
        </div>
      )}
      {/* Replace with your real login form */}
      <p>Demo login form goes here.</p>
      <p>
        <Link to="/forgot-password">Forgot password?</Link>
      </p>
    </div>
  )
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Add other routes as needed */}
      </Routes>
    </BrowserRouter>
  )
}
