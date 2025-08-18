"use client"

// app/reset-password/page.tsx
// Secure password reset page for Next.js App Router.
// - Uses existing `buss/lib/supabaseClient.ts`
// - Handles both `code` (PKCE) and legacy `access_token`/`refresh_token` flows
// - Enforces strong passwords and redirects to /login on success

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '../../lib/supabaseClient'

const passwordRules = {
  minLength: 8,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
}

function validatePassword(pw: string) {
  if (!pw || pw.length < passwordRules.minLength) return 'Password must be at least 8 characters.'
  if (!passwordRules.regex.test(pw)) {
    return 'Password must include uppercase, lowercase, a number, and a symbol.'
  }
  return ''
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  const tokens = useMemo(() => {
    // Prefer PKCE code param if present
    const code = searchParams?.get('code') || null

    // Query params
    const access_q = searchParams?.get('access_token') || null
    const refresh_q = searchParams?.get('refresh_token') || null

    // Hash fragment (fallback)
    let access_h: string | null = null
    let refresh_h: string | null = null
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      access_h = hashParams.get('access_token')
      refresh_h = hashParams.get('refresh_token')
    }

    return {
      code,
      access_token: access_q || access_h,
      refresh_token: refresh_q || refresh_h,
    }
  }, [searchParams])

  const hasAnyToken = !!(tokens.code || (tokens.access_token && tokens.refresh_token))

  useEffect(() => {
    let isMounted = true

    async function prepareSession() {
      try {
        if (tokens.code) {
          // Modern flow: exchange code for a session
          const { error: exErr } = await supabase.auth.exchangeCodeForSession(tokens.code)
          if (exErr) {
            // eslint-disable-next-line no-console
            console.error('exchangeCodeForSession error', exErr)
          }
        } else if (tokens.access_token && tokens.refresh_token) {
          // Legacy flow: set session directly
          const { error: sessErr } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          })
          if (sessErr) {
            // eslint-disable-next-line no-console
            console.error('setSession error', sessErr)
          }
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('prepareSession exception', e)
      } finally {
        if (isMounted) setSessionReady(true)
      }
    }

    prepareSession()
    return () => {
      isMounted = false
    }
  }, [tokens])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    const v = validatePassword(newPassword)
    if (v) {
      setError(v)
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword })
      if (updateErr) {
        // eslint-disable-next-line no-console
        console.error('updateUser error', updateErr)
        setError('Unable to reset password. The link may have expired. Please request a new reset.')
        setLoading(false)
        return
      }

      // Success: redirect to /login; include a query param for a simple success message if desired
      router.push('/login?resetSuccess=1')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('reset submit exception', err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 16 }}>
      <h1 style={{ marginBottom: 16 }}>Reset your password</h1>

      {!sessionReady && (
        <p role="status" aria-live="polite">Preparing your session…</p>
      )}

      {!hasAnyToken && sessionReady && (
        <div role="alert" style={{ color: 'crimson', margin: '8px 0 16px' }}>
          The reset link is missing or invalid. Please request a new password reset from the sign-in page.
        </div>
      )}

      <form onSubmit={onSubmit} aria-disabled={!sessionReady}>
        <label htmlFor="newPw">New password</label>
        <input
          id="newPw"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={passwordRules.minLength}
          placeholder="••••••••"
          style={{ display: 'block', width: '100%', margin: '8px 0 12px', padding: 8 }}
        />
        <small>
          Must be at least 8 characters and include uppercase, lowercase, a number, and a symbol.
        </small>

        <label htmlFor="confirmPw" style={{ marginTop: 12, display: 'block' }}>Confirm password</label>
        <input
          id="confirmPw"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="••••••••"
          style={{ display: 'block', width: '100%', margin: '8px 0 16px', padding: 8 }}
        />

        {error && (
          <div role="alert" style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>
        )}

        <button type="submit" disabled={!sessionReady || loading || !hasAnyToken} style={{ padding: '8px 12px' }}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
