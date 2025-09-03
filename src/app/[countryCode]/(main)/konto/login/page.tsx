import LoginTemplate from "@modules/account/templates/login-template"
import { login, signup, retrieveCustomer } from "@lib/data/customer"
import { redirect } from "next/navigation"

export default async function KontoLoginAlias() {
  // If already authenticated, go straight to dashboard
  const customer = await retrieveCustomer().catch(() => null)
  if (customer) {
    redirect(`/${'ee'}/konto`)
  }
  return <LoginTemplate loginAction={login} signupAction={signup} />
}



