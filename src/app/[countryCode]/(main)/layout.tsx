import React from "react"
import Layout from "@modules/layout/templates"

/**
 * MainLayout wraps all pages in the (main) group with the global Nav and Footer.
 */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>
} 