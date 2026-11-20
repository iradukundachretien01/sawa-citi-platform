import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react'
import BackButton from '../../components/common/BackButton'
import { useAuth } from '../../context/AuthContext'
import { apiErrors, apiMessage } from '../../lib/api'

export default function RegisterPage() {
  const { user, register } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const redirectTo = location.state?.from || '/'
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setFieldErrors([])

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not create your account.'))
      setFieldErrors(apiErrors(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-6 sm:py-10">
      <BackButton fallbackTo="/login" className="mb-4" />
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-card border border-black/5 bg-white shadow-lift lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-brand-800 p-8 text-white lg:block">
          <img src="/logo.png" alt="Sawa Citi" className="h-14 w-auto rounded-xl bg-white p-1.5" />
          <h2 className="mt-8 font-display text-2xl font-extrabold leading-tight">
            Join Sawa Citi and shop smarter.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Create a free account to save your wishlist, track orders and check out faster.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/80">
            {['Save favourite products', 'Track every order', 'Faster repeat checkout', 'Member-only offers'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-400 text-[10px] font-bold text-brand-900">
                    ✓
                  </span>
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="p-6 sm:p-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
            Account
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">Create account</h1>
          <p className="mt-1 text-sm text-muted">
            Already have an account?{' '}
            <Link
              to="/login"
              state={location.state}
              className="font-semibold text-brand-700 hover:underline"
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={submit} className="mt-6 space-y-3.5">
            <label className="block text-xs font-semibold text-muted">
              Full name
              <div className="relative mt-1">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
                  aria-hidden="true"
                />
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  placeholder="Your full name"
                  autoComplete="name"
                  required
                />
              </div>
            </label>

            <label className="block text-xs font-semibold text-muted">
              Email address
              <div className="relative mt-1">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block text-xs font-semibold text-muted">
              Phone (optional)
              <div className="relative mt-1">
                <Phone
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
                  aria-hidden="true"
                />
                <input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  placeholder="+250 7xx xxx xxx"
                  autoComplete="tel"
                />
              </div>
            </label>

            <label className="block text-xs font-semibold text-muted">
              Password
              <div className="relative mt-1">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-10 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted hover:text-brand-700"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block text-xs font-semibold text-muted">
              Confirm password
              <div className="relative mt-1">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
                  aria-hidden="true"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, confirmPassword: event.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </label>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}
            {fieldErrors.length > 0 && (
              <ul className="space-y-1 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                {fieldErrors.map((item) => (
                  <li key={`${item.path}-${item.message}`}>• {item.message}</li>
                ))}
              </ul>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
