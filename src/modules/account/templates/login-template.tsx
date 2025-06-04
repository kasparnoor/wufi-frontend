"use client"

import { useState } from "react"

import { Register } from "@lib/components"
import { Login } from "@lib/components"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

type LoginTemplateProps = {
  loginAction?: (prevState: any, formData: FormData) => Promise<any>
  signupAction?: (prevState: any, formData: FormData) => Promise<any>
}

const LoginTemplate = ({ loginAction, signupAction }: LoginTemplateProps) => {
  const [currentView, setCurrentView] = useState("sign-in")

  return (
    <div className="w-full flex justify-start px-8 py-8">
      {currentView === "sign-in" ? (
        <Login setCurrentView={setCurrentView} loginAction={loginAction} />
      ) : (
        <Register setCurrentView={setCurrentView} signupAction={signupAction} />
      )}
    </div>
  )
}

export default LoginTemplate
