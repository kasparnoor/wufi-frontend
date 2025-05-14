"use client"

import React, { createContext, useContext, useState, useCallback, useEffect } from "react"
import { XMark } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import Link from "next/link"

export type ToastType = "success" | "error" | "info"

type ToastAction = {
  label: string
  href: string
}

type Toast = {
  id: string
  message: string
  type: ToastType
  duration?: number
  action?: ToastAction
}

type ToastContextType = {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number, action?: ToastAction) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((
    message: string, 
    type: ToastType = "success", 
    duration = 3000,
    action?: ToastAction
  ) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type, duration, action }])
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        onClose()
      }, toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast, onClose])

  const getBgColor = () => {
    switch (toast.type) {
      case "success": return "bg-green-50 border-green-200"
      case "error": return "bg-red-50 border-red-200"
      case "info": return "bg-blue-50 border-blue-200"
      default: return "bg-green-50 border-green-200"
    }
  }

  const getTextColor = () => {
    switch (toast.type) {
      case "success": return "text-green-800"
      case "error": return "text-red-800"
      case "info": return "text-blue-800"
      default: return "text-green-800"
    }
  }

  const getIconBg = () => {
    switch (toast.type) {
      case "success": return "bg-green-100 text-green-700"
      case "error": return "bg-red-100 text-red-700"
      case "info": return "bg-blue-100 text-blue-700"
      default: return "bg-green-100 text-green-700"
    }
  }

  const getActionBg = () => {
    switch (toast.type) {
      case "success": return "bg-green-700 hover:bg-green-800 text-white"
      case "error": return "bg-red-700 hover:bg-red-800 text-white"
      case "info": return "bg-blue-700 hover:bg-blue-800 text-white"
      default: return "bg-green-700 hover:bg-green-800 text-white"
    }
  }

  return (
    <div 
      className={clx(
        "flex flex-col gap-3 p-4 rounded-lg border shadow-md mb-3 transition-all transform",
        getBgColor()
      )}
      style={{ animation: "slideIn 0.3s ease, fadeOut 0.3s ease forwards", animationDelay: "0s, " + ((toast.duration || 3000) - 300) + "ms" }}
    >
      <div className="flex items-center gap-3">
        <div className={clx("rounded-full p-1.5", getIconBg())}>
          {toast.type === "success" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast.type === "error" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.type === "info" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <p className={clx("text-base flex-1", getTextColor())}>{toast.message}</p>
        <button
          onClick={onClose}
          className={clx("rounded-full p-1 hover:bg-opacity-80 transition-colors", getIconBg())}
        >
          <XMark className="w-4 h-4" />
        </button>
      </div>
      
      {/* Action Button */}
      {toast.action && (
        <Link
          href={toast.action.href}
          className={clx(
            "mt-1 text-center py-2 px-4 rounded font-medium text-sm transition-colors",
            getActionBg()
          )}
        >
          {toast.action.label}
        </Link>
      )}
    </div>
  )
}

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
      ))}
    </div>
  )
}

// Add animation keyframes to global styles
export const ToastStyles = () => {
  return (
    <style jsx global>{`
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `}</style>
  )
} 