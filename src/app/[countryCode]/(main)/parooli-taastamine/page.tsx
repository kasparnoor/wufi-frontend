"use client"

import React from "react"
import { requestPasswordReset, resetPassword } from "@lib/data/customer"
import { useSearchParams } from "next/navigation"
import { ModernInput as Input, Button } from "@lib/components"
import { toast } from "@medusajs/ui"

export default function PasswordResetPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const emailFromLink = searchParams.get("email") || ""

  const [mode, setMode] = React.useState(token && emailFromLink ? "reset" : "request")
  const [email, setEmail] = React.useState(emailFromLink)
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    await requestPasswordReset(email)
    toast.success("Kui konto eksisteerib, saadeti e-kiri juhistega.")
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error("Paroolid ei ühti")
      return
    }
    try {
      await resetPassword({ email: emailFromLink, token, new_password: newPassword })
      toast.success("Parool uuendatud. Palun logi sisse.")
      setMode("request")
    } catch (e: any) {
      toast.error(e?.message || "Parooli uuendamine ebaõnnestus")
    }
  }

  return (
    <div className="content-container py-10">
      <div className="max-w-md mx-auto bg-white rounded-2xl p-6 border border-yellow-200">
        {mode === "request" ? (
          <form onSubmit={handleRequest} className="space-y-4">
            <h1 className="text-xl font-bold">Parooli taastamine</h1>
            <Input label="E-post" value={email} onChange={(e: any) => setEmail(e.target.value)} required name="email" />
            <Button type="submit">Saada link</Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <h1 className="text-xl font-bold">Uus parool</h1>
            <Input label="Uus parool" type="password" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} required />
            <Input label="Kinnita parool" type="password" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} required />
            <Button type="submit">Uuenda parool</Button>
          </form>
        )}
      </div>
    </div>
  )
}


