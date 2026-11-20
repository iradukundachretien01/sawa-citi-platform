import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import BackButton from '../../components/common/BackButton'
import { useAuth } from '../../context/AuthContext'
import { apiMessage } from '../../lib/api'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from || '/'

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const signedIn = await login(form)
      const target = ['employee', 'manager', 'admin'].includes(signedIn.role) ? '/admin' : redirectTo
      navigate(target, { replace: true })
    } catch (requestError) {
      setError(apiMessage(requestError, 'Could not sign in. Check your email and password.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-page py-6 sm:py-10">
      <BackButton className="mb-4" />
      <div className="mx-auto grid max-w-4xl overflow-hidden rounded-card border border-black/5 bg-white shadow-lift lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-brand-800 p-8 text-white lg:block">
          <img src="/logo.png" alt="Sawa Citi" className="h-14 w-auto rounded-xl bg-white p-1.5" />
          <h2 className="mt-8 font-display text-2xl font-extrabold leading-tight">
            Welcome back to fresh, fast shopping.
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Sign in to track orders, manage your wishlist and check out faster across all Sawa Citi
            branches.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/80">
            {['Order tracking', 'Saved wishlist', 'Faster checkout', 'Exclusive promotions'].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent-400" aria-hidden="true" />
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
          <h1 className="mt-1 font-display text-2xl font-extrabold text-ink">Sign in</h1>
          <p className="mt-1 text-sm text-muted">
            New here?{' '}
            <Link
              to="/register"
              state={location.state}
              className="font-semibold text-brand-700 hover:underline"
            >
              Create an account
            </Link>
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold text-muted">
              Email address
              <div className="relative mt-1">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted/60"
                  aria-hidden="true"
                />
                <input
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-3 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  placeholder="you@example.com"
                  required
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
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                  className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-9 pr-10 text-sm font-medium text-ink focus:border-brand-400 focus:outline-none"
                  placeholder="Your password"
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

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
