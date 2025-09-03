import DOMPurify from 'dompurify'

// Basic HTML entity encoding for server-side use
const encodeHtmlEntities = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Strip all HTML tags - secure fallback for server-side
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '')
}

// Safe HTML sanitization utility
export const sanitizeHtml = (html: string): string => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    // Server-side: Use basic sanitization
    return sanitizeHtmlServer(html)
  }
  
  // Configure DOMPurify for maximum security
  const config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur', 'onkeyup', 'onkeydown']
  }
  
  return DOMPurify.sanitize(html, config)
}

// Server-side HTML sanitization
export const sanitizeHtmlServer = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  // For sensitive content, strip all HTML
  if (html.includes('<script') || html.includes('javascript:') || html.includes('data:')) {
    return stripHtmlTags(html)
  }
  
  // For basic content, encode HTML entities
  return encodeHtmlEntities(html)
}

// Sanitize user input text (no HTML allowed)
export const sanitizeUserInput = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .slice(0, 1000) // Limit length to prevent abuse
}

// Sanitize search queries
export const sanitizeSearchQuery = (query: string): string => {
  if (!query || typeof query !== 'string') {
    return ''
  }
  
  return query
    .trim()
    .replace(/[<>\"'&;]/g, '') // Remove SQL injection and XSS characters
    .replace(/[%_]/g, '') // Remove SQL LIKE wildcards
    .slice(0, 100) // Reasonable search query length
} 