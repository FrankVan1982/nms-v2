import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { ConfirmationEmail } from '@/components/emails/confirmation-email';
import { NotificationEmail } from '@/components/emails/notification-email';

const resend = new Resend(process.env.RESEND_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validazione
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    // Invia email di conferma all'utente
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `✅ Abbiamo ricevuto il tuo messaggio - ${subject}`,
      react: ConfirmationEmail({ name, email, phone, subject, message }),
    });

    // Invia notifica all'azienda
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.EMAIL_TO!,
      replyTo: email,
      subject: `🔔 Nuovo contatto: ${subject} - da ${name}`,
      react: NotificationEmail({ name, email, phone, subject, message }),
    });

    return NextResponse.json(
      { success: true, message: 'Email inviate con successo!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Errore invio email:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'invio delle email' },
      { status: 500 }
    );
  }
}