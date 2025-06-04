import { Metadata } from "next"

import LoginTemplate from "@modules/account/templates/login-template"
import { login, signup } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Medusa Store account.",
}

export default function Login() {
  return <LoginTemplate loginAction={login} signupAction={signup} />
}
