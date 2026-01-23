import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface ConfirmationEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const ConfirmationEmail = ({
  name,
  email,
  phone,
  subject,
  message,
}: ConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Grazie per averci contattato - {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Header */}
          <Section style={header}>
            <Heading style={h1}>
              Grazie per averci contattato
            </Heading>
            <Text style={subtitle}>
              Abbiamo ricevuto la tua richiesta
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={paragraph}>
              Ciao <strong>{name}</strong>,
            </Text>
            
            <Text style={paragraph}>
              Ti confermiamo di aver ricevuto il tuo messaggio. Ti risponderemo al piÃ¹ presto all'indirizzo <strong>{email}</strong>
            </Text>

            {/* Riepilogo */}
            <Section style={summaryBox}>
              <Text style={summaryTitle}>RIEPILOGO RICHIESTA</Text>
              
              <Section style={summaryItem}>
                <Text style={summaryLabel}>Oggetto</Text>
                <Text style={summaryValue}>{subject}</Text>
              </Section>

              {phone && (
                <Section style={summaryItem}>
                  <Text style={summaryLabel}>Telefono</Text>
                  <Text style={summaryValue}>{phone}</Text>
                </Section>
              )}

              <Section style={summaryItemLast}>
                <Text style={summaryLabel}>Messaggio</Text>
                <Text style={summaryMessage}>{message}</Text>
              </Section>
            </Section>

            <Text style={footerText}>
              Se hai bisogno di assistenza immediata, non esitare a contattarci direttamente.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerNote}>
              Questa Ã¨ una email automatica, per favore non rispondere.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default ConfirmationEmail;

// Stili ispirati a https://nms-v2.vercel.app
const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  padding: '40px 20px',
};

const container = {
  backgroundColor: '#111111',
  borderRadius: '16px',
  border: '1px solid #1a1a1a',
  margin: '0 auto',
  maxWidth: '600px',
  overflow: 'hidden',
};

const header = {
  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
  padding: '48px 40px',
  textAlign: 'center' as const,
  borderBottom: '1px solid #2a2a2a',
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  letterSpacing: '-0.5px',
  margin: '0',
};

const subtitle = {
  color: '#888888',
  fontSize: '16px',
  margin: '12px 0 0 0',
};

const content = {
  padding: '40px',
};

const paragraph = {
  color: '#cccccc',
  fontSize: '15px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const summaryBox = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
};

const summaryTitle = {
  color: '#666666',
  fontSize: '13px',
  fontWeight: '500',
  letterSpacing: '0.5px',
  margin: '0 0 16px 0',
  textTransform: 'uppercase' as const,
};

const summaryItem = {
  borderBottom: '1px solid #2a2a2a',
  padding: '12px 0',
};

const summaryItemLast = {
  padding: '12px 0',
};

const summaryLabel = {
  color: '#666666',
  fontSize: '13px',
  margin: '0',
};

const summaryValue = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '500',
  margin: '4px 0 0 0',
};

const summaryMessage = {
  color: '#cccccc',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0 0 0',
  whiteSpace: 'pre-wrap' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '0',
};

const footer = {
  backgroundColor: '#0d0d0d',
  borderTop: '1px solid #1a1a1a',
  padding: '32px 40px',
  textAlign: 'center' as const,
};

const footerNote = {
  color: '#555555',
  fontSize: '13px',
  margin: '0',
};
