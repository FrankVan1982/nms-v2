import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NotificationEmailProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const NotificationEmail = ({
  name,
  email,
  phone,
  subject,
  message,
}: NotificationEmailProps) => {
  const date = new Date().toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = new Date().toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Html>
      <Head />
      <Preview>Nuovo contatto: {subject} - da {name}</Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* Header */}
          <Section style={header}>
            <Section style={badge}>
              <Text style={badgeText}>NUOVO CONTATTO</Text>
            </Section>
            <Heading style={h1}>Richiesta di preventivo</Heading>
            <Text style={dateText}>
              {date} alle {time}
            </Text>
          </Section>

          {/* Content */}
          <Section style={content}>
            
            {/* Nome */}
            <Section style={infoBox}>
              <Text style={infoLabel}>CLIENTE</Text>
              <Text style={infoValueLarge}>{name}</Text>
            </Section>

            {/* Email */}
            <Section style={infoBox}>
              <Text style={infoLabel}>EMAIL</Text>
              <Link href={`mailto:${email}`} style={link}>
                {email}
              </Link>
            </Section>

            {/* Telefono */}
            {phone && (
              <Section style={infoBox}>
                <Text style={infoLabel}>TELEFONO</Text>
                <Link href={`tel:${phone}`} style={link}>
                  {phone}
                </Link>
              </Section>
            )}

            {/* Servizio */}
            <Section style={infoBox}>
              <Text style={infoLabel}>SERVIZIO RICHIESTO</Text>
              <Text style={infoValue}>{subject}</Text>
            </Section>

            {/* Messaggio */}
            <Section style={messageBox}>
              <Text style={infoLabel}>MESSAGGIO</Text>
              <Text style={messageText}>{message}</Text>
            </Section>

          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default NotificationEmail;

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


// 
// Stili per email notifica
const badge = {
  backgroundColor: '#2a2a2a',
  borderRadius: '20px',
  display: 'inline-block',
  marginBottom: '16px',
  padding: '8px 16px',
};

const badgeText = {
  color: '#888888',
  fontSize: '13px',
  fontWeight: '500',
  margin: '0',
};

const dateText = {
  color: '#666666',
  fontSize: '14px',
  margin: '12px 0 0 0',
};

const infoBox = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  marginBottom: '16px',
  padding: '16px',
};

const infoLabel = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '500',
  letterSpacing: '0.5px',
  margin: '0 0 6px 0',
  textTransform: 'uppercase' as const,
};

const infoValue = {
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '500',
  margin: '0',
};

const infoValueLarge = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0',
};

const link = {
  color: '#4a9eff',
  fontSize: '15px',
  fontWeight: '500',
  textDecoration: 'none',
};

const messageBox = {
  backgroundColor: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '10px',
  marginTop: '20px',
  padding: '16px',
};

const messageText = {
  color: '#cccccc',
  fontSize: '14px',
  lineHeight: '1.6',
  margin: '8px 0 0 0',
  whiteSpace: 'pre-wrap' as const,
};
