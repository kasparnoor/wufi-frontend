"use client"

import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { CheckoutFormData } from '../../schemas/checkout'
import { clx } from '@medusajs/ui'
import { User, Mail, Phone, MapPin, Building2 } from 'lucide-react'

interface FormFieldProps {
  register: UseFormRegister<CheckoutFormData>
  name: keyof CheckoutFormData
  label: string
  type?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
  error?: string
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  register,
  name,
  label,
  type = 'text',
  placeholder,
  required = false,
  autoComplete,
  error,
  className
}) => {
  return (
    <div className={clx("space-y-2", className)}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        {...register(name as any)}
        type={type}
        id={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={clx(
          "w-full px-4 py-3 border rounded-xl transition-colors",
          "focus:ring-2 focus:ring-yellow-500 focus:border-transparent",
          "placeholder:text-gray-400",
          error 
            ? "border-red-300 bg-red-50" 
            : "border-gray-300 bg-white hover:border-gray-400"
        )}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

interface ContactInfoSectionProps {
  register: UseFormRegister<CheckoutFormData>
  errors: FieldErrors<CheckoutFormData>
}

export const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ register, errors }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">1</span>
        </div>
        Kontaktandmed
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          register={register}
          name="firstName"
          label="Eesnimi"
          placeholder="Teie eesnimi"
          required
          autoComplete="given-name"
          error={errors.firstName?.message}
        />
        
        <FormField
          register={register}
          name="lastName"
          label="Perekonnanimi"
          placeholder="Teie perekonnanimi"
          required
          autoComplete="family-name"
          error={errors.lastName?.message}
        />
        
        <FormField
          register={register}
          name="email"
          label="E-posti aadress"
          type="email"
          placeholder="teie@email.ee"
          required
          autoComplete="email"
          error={errors.email?.message}
          className="md:col-span-2"
        />
        
        <FormField
          register={register}
          name="phone"
          label="Telefoninumber"
          type="tel"
          placeholder="+372 5xxx xxxx"
          required
          autoComplete="tel"
          error={errors.phone?.message}
          className="md:col-span-2"
        />
      </div>
    </div>
  )
}

interface AddressInfoSectionProps {
  register: UseFormRegister<CheckoutFormData>
  errors: FieldErrors<CheckoutFormData>
  showCompany?: boolean
}

export const AddressInfoSection: React.FC<AddressInfoSectionProps> = ({ 
  register, 
  errors, 
  showCompany = false 
}) => {
  const estonianProvinces = [
    'Harjumaa', 'Hiiumaa', 'Ida-Virumaa', 'Jõgevamaa', 'Järvamaa', 'Läänemaa',
    'Lääne-Virumaa', 'Põlvamaa', 'Pärnumaa', 'Raplamaa', 'Saaremaa', 'Tartumaa',
    'Valgamaa', 'Viljandimaa', 'Võrumaa'
  ] as const

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">2</span>
        </div>
        Tarneaadress
      </h3>
      
      <div className="space-y-4">
        {showCompany && (
          <FormField
            register={register}
            name="company"
            label="Ettevõtte nimi"
            placeholder="OÜ Näidis"
            autoComplete="organization"
            error={errors.company?.message}
          />
        )}
        
        <FormField
          register={register}
          name="address1"
          label="Aadress"
          placeholder="Tänav ja maja number"
          required
          autoComplete="address-line1"
          error={errors.address1?.message}
        />
        
        <FormField
          register={register}
          name="address2"
          label="Täiendav aadress (valikuline)"
          placeholder="Korteri või bürooinumber"
          autoComplete="address-line2"
          error={errors.address2?.message}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            register={register}
            name="city"
            label="Linn"
            placeholder="Tallinn"
            required
            autoComplete="address-level2"
            error={errors.city?.message}
            className="md:col-span-1"
          />
          
          <FormField
            register={register}
            name="postalCode"
            label="Postiindeks"
            placeholder="10001"
            required
            autoComplete="postal-code"
            error={errors.postalCode?.message}
            className="md:col-span-1"
          />
          
          <div className="space-y-2 md:col-span-1">
            <label htmlFor="province" className="block text-sm font-medium text-gray-700">
              Maakond <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              {...register('province')}
              id="province"
              autoComplete="address-level1"
              className={clx(
                "w-full px-4 py-3 border rounded-xl transition-colors",
                "focus:ring-2 focus:ring-yellow-500 focus:border-transparent",
                "bg-white",
                errors.province 
                  ? "border-red-300 bg-red-50" 
                  : "border-gray-300 hover:border-gray-400"
              )}
            >
              <option value="">Valige maakond</option>
              {estonianProvinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
            {errors.province && (
              <p className="text-sm text-red-600">{errors.province.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface FormSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  children,
  className = '',
}) => {
  return (
    <div className={clx('bg-white border border-gray-200 rounded-2xl p-6', className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-yellow-500 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  )
} 