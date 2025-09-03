import { RefObject, useEffect, useState } from "react"

export const useIntersection = (
  element: RefObject<HTMLDivElement | null>,
  rootMargin: string,
  threshold: number = 0
): [boolean, boolean] => {
  const [isVisible, setState] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!element.current) {
      return
    }

    const el = element.current

    const observer = new IntersectionObserver(
      ([entry]) => {
        setState(entry.isIntersecting)
        setReady(true)
      },
      { rootMargin, threshold }
    )

    observer.observe(el)

    return () => observer.unobserve(el)
  }, [element, rootMargin, threshold])

  return [isVisible, ready]
}

/**
 * useScrolledPast
 * Returns true when the referenced element has been fully scrolled past
 * (its bottom edge is above the viewport top). Optional negative/positive
 * offset allows fine tuning the trigger threshold.
 */
export const useScrolledPast = (
  element: RefObject<HTMLElement | null>,
  offset: number = 0
) => {
  const [past, setPast] = useState(false)

  useEffect(() => {
    const el = element.current
    if (!el) return

    let ticking = false

    const update = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      setPast(rect.bottom + offset <= 0)
      ticking = false
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update)
        ticking = true
      }
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [element, offset])

  return past
}
