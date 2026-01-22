// ============================================
// FILE: /app/api/send-email/route.ts
// ============================================

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Validazione
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Campi obbligatori mancanti' },
        { status: 400 }
      );
    }

    // Configura transporter Gmail
    const transporter = nodemailer.createTransport({
      host: 'smtp.libero.it',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    // ============================================
    // EMAIL 1: All'UTENTE (conferma)
    // ============================================
    const confirmationEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Helvetica, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              border-radius: 8px 8px 0 0;
              text-align: center;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .summary {
              background: #f5f5f5;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #667eea;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">✅ Messaggio Ricevuto!</h1>
            </div>
            <div class="content">
              <p>Ciao <strong>${name}</strong>,</p>
              
              <p>Grazie per averci contattato! Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.</p>
              
              <div class="summary">
                <h3 style="margin-top: 0; color: #667eea;">Riepilogo del tuo messaggio:</h3>
                <p><strong>Oggetto:</strong> ${subject}</p>
                <p><strong>Messaggio:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
                ${phone ? `<p><strong>Telefono:</strong> ${phone}</p>` : ''}
              </div>
              
              <p>Ti risponderemo all'indirizzo email: <strong>${email}</strong></p>
              
              <p>Se hai bisogno di assistenza immediata, non esitare a contattarci direttamente.</p>
              
              <div class="footer">
                <p>Questo è un messaggio automatico, per favore non rispondere a questa email.</p>
                <p>© 2026 Nuova Misurascale Soc.Coop. Tutti i diritti riservati.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // ============================================
    // EMAIL 2: All'AZIENDA (notifica dettagliata)
    // ============================================
    const notificationEmailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Helvetica, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f9f9f9;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 0 0 8px 8px;
            }
            .field {
              margin-bottom: 20px;
            }
            .label {
              font-weight: bold;
              color: #667eea;
              display: block;
              margin-bottom: 5px;
              font-size: 14px;
            }
            .value {
              padding: 12px;
              background: #f5f5f5;
              border-radius: 4px;
              border-left: 3px solid #667eea;
            }
            .quick-actions {
              margin: 25px 0;
              padding: 20px;
              background: #e8f4f8;
              border-radius: 8px;
            }
            .action-button {
              display: inline-block;
              padding: 10px 20px;
              margin: 5px 5px 5px 0;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              font-size: 14px;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #999;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">📧 Nuovo Contatto dal Sito Web</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Ricevuto il ${new Date().toLocaleString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>
            <div class="content">
              <div class="field">
                <span class="label">👤 Nome Completo</span>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <span class="label">📧 Email</span>
                <div class="value"><a href="mailto:${email}" style="color: #667eea;">${email}</a></div>
              </div>
              
              ${phone ? `
              <div class="field">
                <span class="label">📱 Telefono</span>
                <div class="value"><a href="tel:${phone}" style="color: #667eea;">${phone}</a></div>
              </div>
              ` : ''}
              
              <div class="field">
                <span class="label">📝 Oggetto</span>
                <div class="value">${subject}</div>
              </div>
              
              <div class="field">
                <span class="label">💬 Messaggio</span>
                <div class="value" style="white-space: pre-wrap;">${message}</div>
              </div>

              <div class="quick-actions">
                <strong>⚡ Azioni Rapide:</strong><br><br>
                <a href="mailto:${email}" class="action-button">✉️ Rispondi via Email</a>
                ${phone ? `<a href="tel:${phone}" class="action-button">📞 Chiama</a>` : ''}
              </div>
              
              <div class="footer">
                <p>Messaggio ricevuto dal form di contatto del sito web</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // ============================================
    // INVIO EMAIL 1: Conferma all'utente
    // ============================================
    await transporter.sendMail({
      from: `"${process.env.COMPANY_NAME || 'Il Nostro Team'}" <${process.env.EMAIL_USER}>`,
      to: email, // Email dell'utente
      subject: `✅ Abbiamo ricevuto il tuo messaggio - ${subject}`,
      html: confirmationEmailHtml,
      text: `
Ciao ${name},

Grazie per averci contattato! Abbiamo ricevuto il tuo messaggio e ti risponderemo al più presto.

Riepilogo del tuo messaggio:
Oggetto: ${subject}
Messaggio: ${message}
${phone ? `Telefono: ${phone}` : ''}

Ti risponderemo all'indirizzo: ${email}

Cordiali saluti,
Il Team
      `,
    });

    // ============================================
    // INVIO EMAIL 2: Notifica all'azienda
    // ============================================
    await transporter.sendMail({
      from: `"Form Contatto Sito" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO, // Email aziendale
      replyTo: email, // Rispondi direttamente all'utente
      subject: `🔔 Nuovo contatto: ${subject} - da ${name}`,
      html: notificationEmailHtml,
      text: `
NUOVO CONTATTO DAL SITO WEB

Nome: ${name}
Email: ${email}
${phone ? `Telefono: ${phone}` : ''}
Oggetto: ${subject}

Messaggio:
${message}

---
Ricevuto il ${new Date().toLocaleString('it-IT')}
      `,
    });

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email inviate con successo! Controlla la tua casella email per la conferma.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Errore invio email:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'invio delle email. Riprova più tardi.' },
      { status: 500 }
    );
  }
}


// ============================================
// CONFIGURAZIONE .env.local
// ============================================
/*
EMAIL_USER=tuaemail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
EMAIL_TO=info@tuaazienda.com
COMPANY_NAME=Nome Azienda
*/