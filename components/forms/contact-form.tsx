"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
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
            Ti contatteremo il prima possibile.
          </p>
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
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome e Cognome *</Label>
              <Input id="name" placeholder="Mario Rossi" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono *</Label>
              <Input id="phone" type="tel" placeholder="+39 333 1234567" required />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" placeholder="mario@example.com" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Tipo di Lavorazione</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un servizio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scale-chiocciola">Scale a Chiocciola</SelectItem>
                <SelectItem value="scale-giorno">Scale a Giorno</SelectItem>
                <SelectItem value="ringhiere">Ringhiere e Balaustre</SelectItem>
                <SelectItem value="rivestimenti">Rivestimenti</SelectItem>
                <SelectItem value="altro">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Messaggio *</Label>
            <Textarea 
              id="message" 
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
