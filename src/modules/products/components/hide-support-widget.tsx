"use client"

import { useEffect } from "react"

/**
 * Force-hide Chatwoot (or similar) widgets on product pages.
 * Uses API calls when available, CSS overrides, and a MutationObserver to
 * catch late/async injections.
 */
const HideSupportWidget: React.FC = () => {
  useEffect(() => {
    const STYLE_ID = "hide-support-widget-on-product"

    // Add strong CSS overrides
    const css = `
      #chatwoot_live_chat_widget,
      .woot-widget-holder,
      .woot-widget-bubble-holder,
      #chatwoot_container,
      #chatwoot-widget-container,
      [id*="chatwoot"],
      [class*="woot-widget"],
      iframe[src*="chatwoot"],
      iframe[id*="chatwoot"] {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `
    let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null
    if (!styleEl) {
      styleEl = document.createElement("style")
      styleEl.id = STYLE_ID
      styleEl.textContent = css
      document.head.appendChild(styleEl)
    }

    // Try SDK/global APIs if present
    try {
      const w: any = window as any
      if (w.$chatwoot && typeof w.$chatwoot.hide === "function") {
        w.$chatwoot.hide()
      }
      if (w.chatwootSDK && typeof w.chatwootSDK.toggle === "function") {
        w.chatwootSDK.toggle("close")
      }
    } catch {}

    // MutationObserver to hide late-injected nodes
    const observer = new MutationObserver(() => {
      try {
        const nodes = document.querySelectorAll(
          "#chatwoot_live_chat_widget, .woot-widget-holder, .woot-widget-bubble-holder, #chatwoot_container, #chatwoot-widget-container, [id*=chatwoot], [class*=woot-widget]"
        )
        nodes.forEach((n) => ((n as HTMLElement).style.display = "none"))
        const w: any = window as any
        if (w.$chatwoot && typeof w.$chatwoot.hide === "function") {
          w.$chatwoot.hide()
        }
      } catch {}
    })

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    })

    return () => {
      observer.disconnect()
      try {
        const el = document.getElementById(STYLE_ID)
        if (el) el.remove()
      } catch {}
    }
  }, [])

  return null
}

export default HideSupportWidget


