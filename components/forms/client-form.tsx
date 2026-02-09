"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import type { Client } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

const clientSchema = z.object({
  company_name: z.string().min(1, "La ragione sociale e obbligatoria"),
  contact_name: z.string().min(1, "Il nome del contatto e obbligatorio"),
  email: z.string().email("Email non valida"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  vat_number: z.string().optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null
  onSubmit: (data: ClientFormData) => Promise<void>
  isLoading: boolean
}

export function ClientForm({
  open,
  onOpenChange,
  client,
  onSubmit,
  isLoading,
}: ClientFormProps) {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      company_name: client?.company_name || "",
      contact_name: client?.contact_name || "",
      email: client?.email || "",
      phone: client?.phone || "",
      address: client?.address || "",
      city: client?.city || "",
      country: client?.country || "",
      vat_number: client?.vat_number || "",
      notes: client?.notes || "",
    },
  })

  // Reset form when client changes (edit mode) or becomes null (create mode)
  useEffect(() => {
    if (client) {
      form.reset({
        company_name: client.company_name,
        contact_name: client.contact_name,
        email: client.email,
        phone: client.phone || "",
        address: client.address || "",
        city: client.city || "",
        country: client.country || "",
        vat_number: client.vat_number || "",
        notes: client.notes || "",
      })
    } else {
      form.reset({
        company_name: "",
        contact_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        country: "",
        vat_number: "",
        notes: "",
      })
    }
  }, [client, form])

  const handleSubmit = async (data: ClientFormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? "Modifica Cliente" : "Nuovo Cliente"}
          </DialogTitle>
          <DialogDescription>
            {client
              ? "Modifica le informazioni del cliente."
              : "Inserisci le informazioni del nuovo cliente."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Ragione Sociale *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome azienda"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Contatto *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Mario Rossi"
                        className="bg-secondary/50 border-border"
                      />
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
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="email@esempio.it"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefono</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="+39 012 345 6789"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vat_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partita IVA</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="IT01234567890"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Indirizzo</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Via Roma 1"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Citta</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Milano"
                        className="bg-secondary/50 border-border"
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
                    <FormLabel>Paese</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Italia"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Note aggiuntive sul cliente..."
                        rows={3}
                        className="bg-secondary/50 border-border resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-border"
              >
                Annulla
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {client ? "Salva Modifiche" : "Crea Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
