"use server"

import { updateLineItem, deleteLineItem } from "@lib/data/cart"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function updateCartItemAction(
  _prevState: unknown,
  formData: FormData
) {
  const lineId = formData.get("lineId") as string
  const quantity = parseInt(formData.get("quantity") as string)

  if (!lineId) {
    return "Missing line item ID"
  }

  if (isNaN(quantity) || quantity < 1) {
    return "Invalid quantity"
  }

  try {
    await updateLineItem({ lineId, quantity })
    revalidatePath("/[countryCode]/cart", "page")
  } catch (error) {
    console.error("Error updating cart item:", error)
    return "Failed to update item"
  }

  return null
}

export async function deleteCartItemAction(lineId: string) {
  if (!lineId) {
    throw new Error("Missing line item ID")
  }

  try {
    await deleteLineItem(lineId)
    revalidatePath("/[countryCode]/cart", "page")
  } catch (error) {
    console.error("Error deleting cart item:", error)
    throw new Error("Failed to delete item")
  }
} 