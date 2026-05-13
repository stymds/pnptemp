import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ShippedProps {
  shortId: string;
  customerName: string;
  itemNames: string[];
  shipping: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
  };
  orderUrl: string;
}

const main = { backgroundColor: '#faf9f6', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' };
const container = { margin: '0 auto', padding: '32px 24px', maxWidth: 560 };
const h1 = { fontSize: 24, color: '#1a1a1a', margin: '0 0 8px', letterSpacing: '-0.02em' };
const muted = { color: '#6b6b6b', fontSize: 13, margin: 0 };
const card = { background: '#ffffff', border: '1px solid #ececec', borderRadius: 8, padding: 24, marginTop: 24 };

export function OrderShippedEmail(props: ShippedProps) {
  return (
    <Html>
      <Head />
      <Preview>Your order {props.shortId} is on its way</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your order is on the way, {props.customerName.split(' ')[0]}.</Heading>
          <Text style={muted}>
            Order <strong style={{ color: '#1a1a1a' }}>{props.shortId}</strong> just shipped.
          </Text>

          <Section style={card}>
            <Text style={{ ...muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              In this shipment
            </Text>
            {props.itemNames.map((n, i) => (
              <Text key={i} style={{ fontSize: 14, color: '#1a1a1a', margin: '4px 0' }}>{n}</Text>
            ))}
          </Section>

          <Section style={card}>
            <Text style={{ ...muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Shipping to
            </Text>
            <Text style={{ fontSize: 14, color: '#1a1a1a', margin: 0, fontWeight: 500 }}>{props.shipping.fullName}</Text>
            <Text style={{ fontSize: 13, color: '#3a3a3a', margin: '4px 0 0', lineHeight: 1.55 }}>
              {props.shipping.line1}{props.shipping.line2 ? `, ${props.shipping.line2}` : ''}<br />
              {props.shipping.city}, {props.shipping.state} {props.shipping.pincode}
            </Text>
          </Section>

          <Text style={{ ...muted, marginTop: 24, fontSize: 12 }}>
            Track and view details:{' '}
            <a href={props.orderUrl} style={{ color: '#1a1a1a', textDecoration: 'underline' }}>
              {props.orderUrl}
            </a>
          </Text>
          <Text style={{ ...muted, marginTop: 16, fontSize: 11 }}>
            Paras n Paras · Authorized Canon Image Square · Est. 1998
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
