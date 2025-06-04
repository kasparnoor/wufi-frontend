"use client"

import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { ErrorMessage } from "@lib/components"
import { SubmitButton } from "@lib/components"
import { ModernInput as Input } from "@lib/components"
import { useActionState } from "react"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  loginAction?: (prevState: any, formData: FormData) => Promise<any>
}

const Login = ({ setCurrentView, loginAction }: Props) => {
  const [message, formAction] = useActionState(loginAction || (() => Promise.resolve("No login action provided")), null)

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="login-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Tere tulemast tagasi</h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-8">
        Logi sisse, et saada parem ostlemiskogemus.
      </p>
      <form className="w-full" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="E-post"
            name="email"
            type="email"
            title="Sisesta kehtiv e-posti aadress."
            autoComplete="email"
            required
            data-testid="email-input"
          />
          <Input
            label="Parool"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="login-error-message" />
        <SubmitButton data-testid="sign-in-button" className="w-full mt-6">
          Logi sisse
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Pole veel liige?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="underline"
          data-testid="register-button"
        >
          Liitu meiega
        </button>
        .
      </span>
    </div>
  )
}

export default Login
