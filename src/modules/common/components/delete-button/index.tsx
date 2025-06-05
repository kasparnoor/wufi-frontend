"use client"

import { LoaderCircle, Trash } from "lucide-react"
import { clx } from "@medusajs/ui"
import { useState } from "react"

const DeleteButton = ({
  id,
  children = "Eemalda",
  className,
  onDelete,
}: {
  id: string
  children?: React.ReactNode
  className?: string
  onDelete?: (id: string) => Promise<void>
}) => {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!onDelete) {
      console.warn("No onDelete handler provided to DeleteButton")
      return
    }
    
    setIsDeleting(true)
    try {
      await onDelete(id)
    } catch (error) {
      console.error("Error deleting item:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      className={clx(
        "flex items-center gap-x-1.5 text-sm font-medium transition-colors duration-200",
        "text-gray-500 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <LoaderCircle size={16} className="animate-spin" />
      ) : (
        <Trash size={16} />
      )}
      <span>{children}</span>
    </button>
  )
}

export default DeleteButton 