"use client"

import React from "react"
import { HelpCircle, CheckCircle, Shield, Eye, EyeOff } from "lucide-react"
import { useSearchParams, useParams, useRouter } from "next/navigation"

export default function AccountSetupPage() {
  const params = useParams<{ countryCode: string }>()
  const search = useSearchParams()
  const router = useRouter()

  const [password, setPassword] = React.useState("")
  const [confirm, setConfirm] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const token = search.get("token") || ""
  const email = search.get("email") || ""

  const disabled = !token || !email || !password || password !== confirm || submitting

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"}/store/customers/account-setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ token, email, password, first_name: firstName, last_name: lastName }),
      })
      if (res.status === 410) {
        setError("Aktiveerimislink on aegunud. Palun taotlege uus link.")
        setSubmitting(false)
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `HTTP ${res.status}`)
      }
      setSuccess(true)
      setTimeout(() => {
        router.push(`/${params.countryCode}/konto/@login`)
      }, 1200)
    } catch (err: any) {
      setError(err.message || "Seadistamine ebaõnnestus")
    } finally {
      setSubmitting(false)
    }
  }

  const resend = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"}/store/customers/account-setup`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.message || `HTTP ${res.status}`)
      }
    } catch (err: any) {
      setError(err.message || "Uue lingi saatmine ebaõnnestus")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm border border-yellow-200/50 rounded-2xl shadow-2xl shadow-yellow-500/10 p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl mb-3 shadow-lg">
              <span className="text-xl font-bold text-yellow-900">🐾</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Konto seadistamine</h1>
            <p className="text-sm text-gray-600">Looge parool ja lõpetage konto aktiveerimine</p>
          </div>

          {!token || !email ? (
            <div className="text-sm text-red-600">Vigane või puuduv link.</div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="text-sm text-gray-600">E-post: <span className="font-medium">{email}</span></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Eesnimi</label>
                  <input className="w-full border rounded-xl px-3 py-2" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Perekonnanimi</label>
                  <input className="w-full border rounded-xl px-3 py-2" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parool</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border rounded-xl px-3 py-2 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Vali tugev parool"
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password tips */}
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  <li className={password.length >= 8 ? 'text-green-600' : ''}>Vähemalt 8 tähemärki</li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-600' : ''}>Suured tähed</li>
                  <li className={/[a-z]/.test(password) ? 'text-green-600' : ''}>Väikesed tähed</li>
                  <li className={/\d/.test(password) ? 'text-green-600' : ''}>Numbrid</li>
                </ul>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kinnita parool</label>
                <input type="password" className="w-full border rounded-xl px-3 py-2" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                {password && confirm && password !== confirm && (
                  <div className="text-xs text-red-600 mt-1">Paroolid ei ühti</div>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</div>
              )}

              <div className="flex gap-3">
                <button type="submit" disabled={disabled} className="px-4 py-2 rounded-xl bg-yellow-500 text-gray-900 font-semibold disabled:opacity-50">
                  {submitting ? "Töötlemisel..." : "Seadista konto"}
                </button>
                <button type="button" onClick={resend} disabled={!email || submitting} className="px-4 py-2 rounded-xl bg-gray-100 text-gray-800">
                  Saada uus link
                </button>
              </div>

              {success && (
                <div className="text-sm text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" /> Konto on seadistatud! Suuname sisselogimisele...
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}



