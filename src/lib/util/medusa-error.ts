export default function medusaError(error: any): never {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const u = new URL(error.config.url, error.config.baseURL)
    console.error("Resource:", u.toString())
    console.error("Response data:", error.response.data)
    console.error("Status code:", error.response.status)
    console.error("Headers:", error.response.headers)

    // Extracting the error message from the response data
    const message = error.response.data.message || error.response.data

    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error("No response received: " + error.request)
  }

  // Handle errors from fetch-based clients (Medusa SDK) which may not expose axios-like shapes
  if (typeof error === "object") {
    const status = (error as any).status || (error as any).statusCode
    const data = (error as any).data || (error as any).body
    const msg = (error as any).message || (typeof data === "string" ? data : undefined)

    if (status) {
      const text = typeof msg === "string" ? msg : JSON.stringify(data || {})
      throw new Error(`HTTP ${status}: ${text}`)
    }
  }

  // Fallback
  const generic = (error && error.message) ? error.message : "Unknown error"
  throw new Error("Error setting up the request: " + generic)
}
