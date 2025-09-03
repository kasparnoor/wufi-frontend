import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import { login, signup } from "@lib/data/customer"
import { redirect } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Logi sisse - Kraps",
  description: "Logi sisse oma Kraps kontole või loo uus konto.",
}

export default async function KontoLogin() {
  // If already authenticated, go to dashboard
  const customer = await retrieveCustomer().catch(() => null)
  if (customer) {
    redirect(`/${'ee'}/konto`) // keep user at /konto; layout decides which slot to render
  }
  return <LoginTemplate loginAction={login} signupAction={signup} />
}
