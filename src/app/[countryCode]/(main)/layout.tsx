import React from "react"
import Layout from "@modules/layout/templates"
import { Metadata } from "next"

/**
 * MainLayout wraps all pages in the (main) group with the global Nav and Footer.
 */
export const metadata: Metadata = {
  title: "Kraps - Lemmikloomade e-pood",
  description: "Kvaliteetsed lemmikloomade tooted ja personaalne teenindus.",
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
} 