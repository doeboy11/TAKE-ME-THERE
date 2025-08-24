// ResetPassword.jsx
// Secure password reset page. Users arrive here via the Supabase reset link
// which includes access_token and refresh_token. We set the session and then
// allow the user to set a new password.

import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'

// Strong password validator: min 8, uppercase, lowercase, number, symbol
const passwordRules = {
  minLength: 8,
  regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
}

function validatePassword(pw) {
  if (!pw || pw.length < passwordRules.minLength) return 'Password must be at least 8 characters.'
  if (!passwordRules.regex.test(pw)) {
    return 'Password must include uppercase, lowercase, a number, and a symbol.'
  }
  return ''
}

export default function ResetPassword() {
  const navigate = useNavigate?.() // Optional if used without router
  const [params] = useSearchParams?.() ?? []

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)

  // Read tokens from URL if present (query or hash)
  const tokens = useMemo(() => {
    // Prefer query params
    const qp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const access_q = qp?.get('access_token') || null
    const refresh_q = qp?.get('refresh_token') || null

    // Also check hash fragment (some setups deliver tokens here)
    let access_h = null
    let refresh_h = null
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
      access_h = hashParams.get('access_token')
      refresh_h = hashParams.get('refresh_token')
    }

    return {
      access_token: access_q || access_h,
      refresh_token: refresh_q || refresh_h,
    }
  }, [params])

  useEffect(() => {
    let isMounted = true

    async function prepareSession() {
      // If tokens exist, set session so updateUser will succeed
      if (tokens.access_token && tokens.refresh_token) {
        try {
          const { error: sessErr } = await supabase.auth.setSession({
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
          })
          if (sessErr) {
            // eslint-disable-next-line no-console
            console.error('setSession error', sessErr)
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('setSession exception', e)
        }
      }

      // Some flows rely on PASSWORD_RECOVERY event
      const { data: sub } = supabase.auth.onAuthStateChange((_event) => {
        // We don't need to react to the event here for UI, but keeping for compatibility
      })

      if (isMounted) setSessionReady(true)

      return () => {
        sub?.subscription?.unsubscribe?.()
      }
    }

    prepareSession()
    return () => {
      isMounted = false
    }
  }, [tokens])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    // Client-side validation
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

      // Success: redirect to login with a success flag
      if (navigate) {
        navigate('/login', { state: { resetSuccess: true } })
      } else {
        // Fallback without router
        window.location.assign('/login')
      }
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

        <button type="submit" disabled={!sessionReady || loading} style={{ padding: '8px 12px' }}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
