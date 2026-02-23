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
import { Loader2 } from "lucide-react"

const clientSchema = z.object({
  ragione_sociale: z.string().min(1, "La ragione sociale e obbligatoria"),
  codice_fiscale: z.string().optional(),
  partita_iva: z.string().optional(),
  codice_univoco: z.string().optional(),
  email: z.string().optional(),
  pec: z.string().optional(),
  telefono: z.string().optional(),
  indirizzo: z.string().optional(),
  citta: z.string().optional(),
  provincia: z.string().optional(),
  cap: z.string().optional(),
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
      ragione_sociale: client?.ragione_sociale || "",
      codice_fiscale: client?.codice_fiscale || "",
      partita_iva: client?.partita_iva || "",
      codice_univoco: client?.codice_univoco || "",
      email: client?.email || "",
      pec: client?.pec || "",
      telefono: client?.telefono || "",
      indirizzo: client?.indirizzo || "",
      citta: client?.citta || "",
      provincia: client?.provincia || "",
      cap: client?.cap || "",
    },
  })

  // Reset form when client changes (edit mode) or becomes null (create mode)
  useEffect(() => {
    if (client) {
      form.reset({
        ragione_sociale: client.ragione_sociale,
        codice_fiscale: client.codice_fiscale || "",
        partita_iva: client.partita_iva || "",
        codice_univoco: client.codice_univoco || "",
        email: client.email || "",
        pec: client.pec || "",
        telefono: client.telefono || "",
        indirizzo: client.indirizzo || "",
        citta: client.citta || "",
        provincia: client.provincia || "",
        cap: client.cap || "",
      })
    } else {
      form.reset({
        ragione_sociale: "",
        codice_fiscale: "",
        partita_iva: "",
        codice_univoco: "",
        email: "",
        pec: "",
        telefono: "",
        indirizzo: "",
        citta: "",
        provincia: "",
        cap: "",
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
                name="ragione_sociale"
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
                name="codice_fiscale"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codice Fiscale</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="RSSMRA80A01H501Z"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partita_iva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partita IVA</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="01234567890"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codice_univoco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Codice Univoco (SDI)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="ABCDEFG"
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
                    <FormLabel>Email</FormLabel>
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
                name="pec"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PEC</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="azienda@pec.it"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefono"
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
                name="indirizzo"
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
                name="citta"
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
                name="provincia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provincia</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MI"
                        className="bg-secondary/50 border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAP</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="20100"
                        className="bg-secondary/50 border-border"
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
