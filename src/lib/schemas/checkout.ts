import { z } from 'zod'

// Sanitize string input to prevent XSS
const sanitizeString = (str: string) => str.trim().replace(/[<>\"'&]/g, '')

// Estonian postal code validation (5 digits)
const estonianPostalCode = z.string().regex(/^\d{5}$/, 'Sisestaage korrektne postiindeks (5 numbrit)')

// Estonian phone number validation with security
const estonianPhone = z.string()
  .max(20, 'Telefoninumber on liiga pikk')
  .regex(/^(\+372\s?)?[5-9]\d{6,7}$/, 'Sisestaage korrektne Eesti telefoninumber')
  .transform(sanitizeString)

// Email validation with Estonian error message and security  
const emailField = z.string()
  .max(254, 'E-posti aadress on liiga pikk') // RFC 5321 limit
  .email('Sisestaage korrektne e-posti aadress')
  .refine(
    (email: string) => !email.includes('<script') && !email.includes('javascript:') && !email.includes('<'),
    { message: 'Keelatud märgid e-posti aadressis' }
  )
  .transform(sanitizeString)

// Estonian provinces/counties
const estonianProvinces = [
  'Harjumaa', 'Hiiumaa', 'Ida-Virumaa', 'Jõgevamaa', 'Järvamaa', 'Läänemaa',
  'Lääne-Virumaa', 'Põlvamaa', 'Pärnumaa', 'Raplamaa', 'Saaremaa', 'Tartumaa',
  'Valgamaa', 'Viljandimaa', 'Võrumaa'
] as const

// Secure string validation with length limits and sanitization
const secureString = (minLength: number, maxLength: number, fieldName: string) =>
  z.string()
    .min(minLength, `${fieldName} on nõutav`)
    .max(maxLength, `${fieldName} on liiga pikk (maksimaalselt ${maxLength} märki)`)
    .transform(sanitizeString)
    .refine(val => val.length >= minLength, { message: `${fieldName} on nõutav` })

// Address validation schema
export const addressSchema = z.object({
  firstName: secureString(1, 50, 'Eesnimi'),
  lastName: secureString(1, 50, 'Perekonnanimi'),
  address1: secureString(1, 100, 'Aadress'),
  address2: z.string().max(100, 'Lisaadress on liiga pikk').transform(sanitizeString).optional(),
  city: secureString(1, 50, 'Linn'),
  postalCode: estonianPostalCode,
  province: z.enum(estonianProvinces, { errorMap: () => ({ message: 'Valige maakond' }) }),
  countryCode: z.string().default('ee'),
  phone: estonianPhone,
  company: z.string().max(100, 'Ettevõtte nimi on liiga pikk').transform(sanitizeString).optional(),
})

// Main checkout form schema
export const checkoutFormSchema = z.object({
  // Contact information
  email: emailField,
  firstName: secureString(1, 50, 'Eesnimi'),
  lastName: secureString(1, 50, 'Perekonnanimi'),
  phone: estonianPhone,
  
  // Address information
  address1: secureString(1, 100, 'Aadress'),
  address2: z.string().max(100, 'Lisaadress on liiga pikk').transform(sanitizeString).optional(),
  city: secureString(1, 50, 'Linn'),
  postalCode: estonianPostalCode,
  province: z.enum(estonianProvinces, { errorMap: () => ({ message: 'Valige maakond' }) }),
  countryCode: z.string().default('ee'),
  company: z.string().max(100, 'Ettevõtte nimi on liiga pikk').transform(sanitizeString).optional(),
  
  // Billing settings
  sameAsBilling: z.boolean().default(true),
  billingAddress: addressSchema.optional(),
  
  // Additional checkout fields
  courierInstructions: z.string().max(500, 'Juhised on liiga pikad (maksimaalselt 500 märki)').transform(sanitizeString).optional(),
})

// Type exports
export type CheckoutFormData = z.infer<typeof checkoutFormSchema>
export type AddressData = z.infer<typeof addressSchema>

// Validation helpers
export const validateContactInfo = (data: Partial<CheckoutFormData>) => {
  try {
    checkoutFormSchema.pick({
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
    }).parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: error.flatten().fieldErrors }
    }
    return { isValid: false, errors: {} }
  }
}

export const validateAddress = (data: Partial<CheckoutFormData>) => {
  try {
    checkoutFormSchema.pick({
      address1: true,
      city: true,
      postalCode: true,
      province: true,
      countryCode: true,
    }).parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { isValid: false, errors: error.flatten().fieldErrors }
    }
    return { isValid: false, errors: {} }
  }
} 