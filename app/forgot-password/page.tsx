"use client"

// app/forgot-password/page.tsx
// Secure forgot password request page using Supabase Auth
// - Uses existing `buss/lib/supabaseClient.ts`
// - Always shows a generic success message

import React, { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

// Helper to build a safe redirect URL
const getRedirectUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (envUrl) return `${envUrl.replace(/\/$/, '')}/reset-password`
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/reset-password`
  }
  return 'https://mydomain.com/reset-password'
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    try {
      await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: getRedirectUrl(),
      })
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('resetPasswordForEmail error', err)
    } finally {
      setSubmitted(true)
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Forgot your password?</h1>

      {submitted ? (
        <div role="status" aria-live="polite">
          <p>
            If the account exists, a reset link has been sent to the email address provided.
            Please check your inbox and spam folder.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{ display: 'block', width: '100%', margin: '8px 0 16px', padding: 8 }}
          />

          <button type="submit" disabled={loading || !email} style={{ padding: '8px 12px' }}>
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  )
}
