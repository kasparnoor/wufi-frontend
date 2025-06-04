"use client"

import { useActionState } from "react"
import { ModernInput as Input } from "@lib/components"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import { ErrorMessage } from "@lib/components"
import { SubmitButton } from "@lib/components"
import { LocalizedClientLink } from "@lib/components"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
  signupAction?: (prevState: any, formData: FormData) => Promise<any>
}

const Register = ({ setCurrentView, signupAction }: Props) => {
  const [message, formAction] = useActionState(signupAction || (() => Promise.resolve("No signup action provided")), null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">
        Liitu Wüfi poega
      </h1>
      <p className="text-center text-base-regular text-ui-fg-base mb-4">
        Loo oma Wüfi poe konto ja saa ligipääs paremale ostlemiskogemusele.
      </p>
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Eesnimi"
            name="first_name"
            required
            autoComplete="given-name"
            data-testid="first-name-input"
          />
          <Input
            label="Perekonnanimi"
            name="last_name"
            required
            autoComplete="family-name"
            data-testid="last-name-input"
          />
          <Input
            label="E-post"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="Telefon"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="Parool"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage error={message} data-testid="register-error" />
        <span className="text-center text-ui-fg-base text-small-regular mt-6">
          Konto loomisega nõustud Wüfi poe{" "}
          <LocalizedClientLink
            href="/content/privacy-policy"
            className="underline"
          >
            privaatsuspoliitika
          </LocalizedClientLink>{" "}
          ja{" "}
          <LocalizedClientLink
            href="/content/terms-of-use"
            className="underline"
          >
            kasutustingimustega
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          Liitu
        </SubmitButton>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Juba liige?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Logi sisse
        </button>
        .
      </span>
    </div>
  )
}

export default Register
