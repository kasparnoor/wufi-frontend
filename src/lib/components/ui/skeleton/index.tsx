import React from 'react'
import { clx } from "@medusajs/ui"

// Basic skeleton component
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={clx(
        "animate-pulse bg-gray-200 rounded",
        className
      )}
    />
  )
}

// Skeleton for form fields
export const FormFieldSkeleton: React.FC<{ 
  label?: boolean
  className?: string 
}> = ({ label = true, className }) => {
  return (
    <div className={clx("space-y-2", className)}>
      {label && <Skeleton className="h-4 w-24" />}
      <Skeleton className="h-12 w-full rounded-xl" />
    </div>
  )
}

// Skeleton for contact info section
export const ContactInfoSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        <FormFieldSkeleton className="md:col-span-2" />
        <FormFieldSkeleton className="md:col-span-2" />
      </div>
    </div>
  )
}

// Skeleton for address info section  
export const AddressInfoSkeleton: React.FC<{ showCompany?: boolean }> = ({ 
  showCompany = false 
}) => {
  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-5 w-28" />
      </div>
      
      <div className="space-y-4">
        {showCompany && <FormFieldSkeleton />}
        <FormFieldSkeleton />
        <FormFieldSkeleton />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormFieldSkeleton className="md:col-span-1" />
          <FormFieldSkeleton className="md:col-span-1" />
          <FormFieldSkeleton className="md:col-span-1" />
        </div>
      </div>
    </div>
  )
}

// Skeleton for shipping method option
export const ShippingMethodSkeleton: React.FC = () => {
  return (
    <div className="border rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <Skeleton className="h-5 w-16 ml-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>
    </div>
  )
}

// Skeleton for shipping section
export const ShippingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Shipping Methods */}
      <div className="space-y-3">
        <ShippingMethodSkeleton />
        <ShippingMethodSkeleton />
        <ShippingMethodSkeleton />
      </div>

      {/* Continue Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    </div>
  )
}

// Skeleton for step transition
export const StepTransitionSkeleton: React.FC = () => {
  return (
    <div className="min-h-[400px] space-y-8 flex flex-col justify-center items-center">
      <div className="text-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
        <Skeleton className="h-6 w-48 mx-auto" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
      
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

// Skeleton for progress bar
export const ProgressSkeleton: React.FC = () => {
  return (
    <div className="relative">
      <Skeleton className="h-0.5 w-full" />
      <div className="relative flex justify-between mt-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <Skeleton className="w-12 h-12 rounded-full mb-3" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Skeleton for checkout summary
export const CheckoutSummarySkeleton: React.FC = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
      <Skeleton className="h-6 w-40" />
      
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex justify-between font-semibold">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
    </div>
  )
} 