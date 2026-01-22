"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  
  // State per i dati del form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.service || "Richiesta preventivo",
          message: formData.message,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          service: "",
          message: ""
        })
      } else {
        setError(data.error || 'Errore durante l\'invio')
      }
    } catch (error) {
      setError('Errore di connessione. Riprova più tardi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  const handleServiceChange = (value: string) => {
    setFormData({
      ...formData,
      service: value
    })
  }

  if (isSubmitted) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="font-serif text-xl font-semibold text-foreground">Messaggio Inviato!</h3>
          <p className="mt-2 text-muted-foreground">
            Ti contatteremo il prima possibile. Controlla la tua email per la conferma.
          </p>
          <Button 
            onClick={() => setIsSubmitted(false)} 
            variant="outline" 
            className="mt-4"
          >
            Invia un altro messaggio
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-serif text-xl">Richiedi un Preventivo</CardTitle>
        <CardDescription>
          Compila il modulo e ti risponderemo entro 24 ore.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome e Cognome *</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Mario Rossi" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+39 333 1234567" 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input 
              id="email" 
              type="email" 
              value={formData.email}
              onChange={handleInputChange}
              placeholder="mario@example.com" 
              required 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Tipo di Lavorazione</Label>
            <Select value={formData.service} onValueChange={handleServiceChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un servizio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Scale a Chiocciola">Scale a Chiocciola</SelectItem>
                <SelectItem value="Scale a Giorno">Scale a Giorno</SelectItem>
                <SelectItem value="Ringhiere e Balaustre">Ringhiere e Balaustre</SelectItem>
                <SelectItem value="Rivestimenti">Rivestimenti</SelectItem>
                <SelectItem value="Altro">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Messaggio *</Label>
            <Textarea 
              id="message" 
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Descrivi il tuo progetto..."
              rows={4}
              required 
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Invio in corso..." : "Invia Richiesta"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            I campi contrassegnati con * sono obbligatori.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}