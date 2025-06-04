"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { 
  Button, 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@lib/components/ui"

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "Eesnimi peab olema vähemalt 2 tähemärki.",
  }),
  lastName: z.string().min(2, {
    message: "Perekonnanimi peab olema vähemalt 2 tähemärki.",
  }),
  email: z.string().email({
    message: "Palun sisestage kehtiv e-posti aadress.",
  }),
  country: z.string({
    required_error: "Palun valige riik.",
  }),
})

export function ShadcnFormExample() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Eesnimi</FormLabel>
              <FormControl>
                <Input placeholder="Sisestage oma eesnimi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Perekonnanimi</FormLabel>
              <FormControl>
                <Input placeholder="Sisestage oma perekonnanimi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-post</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="sisestage@oma-email.ee" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Riik</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Valige riik" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ee">Eesti</SelectItem>
                  <SelectItem value="lv">Läti</SelectItem>
                  <SelectItem value="lt">Leedu</SelectItem>
                  <SelectItem value="fi">Soome</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Salvesta
        </Button>
      </form>
    </Form>
  )
} 