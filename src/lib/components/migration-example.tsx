"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Button,
  ModernInput,
  ModernTooltip,
  InfoTooltip,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Separator,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Label
} from "@lib/components/ui"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  subscribe: z.boolean(),
  preference: z.enum(["email", "sms", "both"], {
    required_error: "Please select a preference",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function MigrationExample() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      phone: "",
      subscribe: false,
      preference: "email",
    },
  })

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted:", data)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Component Migration Example</h1>
        <p className="text-gray-600">
          Demonstrating the new unified component system with perfect centering and modern accessibility
        </p>
      </div>

      <Separator />

      {/* Modern Form Example */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">✨ Modern Form (shadcn + React Hook Form)</h2>
          <InfoTooltip content="This form uses shadcn components with perfect centering and validation" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ModernInput
                      {...field}
                      type="email"
                      label="Email Address"
                      errors={fieldState.error?.message ? [fieldState.error.message] : undefined}
                      touched={fieldState.isTouched}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ModernInput
                      {...field}
                      type="password"
                      label="Password"
                      errors={fieldState.error?.message ? [fieldState.error.message] : undefined}
                      touched={fieldState.isTouched}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormControl>
                    <ModernInput
                      {...field}
                      type="tel"
                      variant="phone"
                      placeholder="Phone Number"
                      errors={fieldState.error?.message ? [fieldState.error.message] : undefined}
                      touched={fieldState.isTouched}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subscribe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label className="font-medium">
                      Subscribe to newsletter
                    </Label>
                    <p className="text-sm text-gray-600">
                      Get updates about new products and offers
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preference"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Contact Preference</Label>
                    <InfoTooltip content="Choose how you'd like to be contacted" />
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email">Email only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="sms" />
                        <Label htmlFor="sms">SMS only</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="both" id="both" />
                        <Label htmlFor="both">Both email and SMS</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Submit Form
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Show Info
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Migration Complete! 🎉</DialogTitle>
                    <DialogDescription className="space-y-2">
                      <p>This form demonstrates the new unified component system:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Perfect text centering in all inputs</li>
                        <li>Floating labels with smooth animations</li>
                        <li>Built-in validation with React Hook Form + Zod</li>
                        <li>Accessible components using Radix UI primitives</li>
                        <li>Consistent styling with shadcn/ui</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </form>
        </Form>
      </div>

      <Separator />

      {/* Component Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">🚀 New Component Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">ModernInput</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Perfect vertical centering</li>
              <li>✅ Floating labels</li>
              <li>✅ Password visibility toggle</li>
              <li>✅ Error state handling</li>
              <li>✅ Multiple variants</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Modern Components</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✅ Better accessibility</li>
              <li>✅ Consistent APIs</li>
              <li>✅ Radix UI primitives</li>
              <li>✅ React Hook Form integration</li>
              <li>✅ TypeScript support</li>
            </ul>
          </div>
        </div>
      </div>

      <Separator />

      {/* Migration Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Migration Complete</h3>
        <p className="text-green-700">
          All critical components have been migrated to shadcn/ui with backward compatibility.
          Import from <code className="bg-green-100 px-1 rounded">@lib/components/ui</code> for the unified system.
        </p>
      </div>
    </div>
  )
} 