import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from '@react-email/components';

interface OrderConfirmationProps {
  shortId: string;
  customerName: string;
  items: Array<{
    name: string;
    qty: number;
    unitPriceRupees: number;
    totalRupees: number;
  }>;
  subtotalRupees: number;
  shippingRupees: number;
  totalRupees: number;
  shipping: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
    phone: string;
  };
  orderUrl: string;
}

const fmt = (n: number) => 'Rs. ' + n.toLocaleString('en-IN');

const main = { backgroundColor: '#faf9f6', fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' };
const container = { margin: '0 auto', padding: '32px 24px', maxWidth: 560 };
const h1 = { fontSize: 24, color: '#1a1a1a', margin: '0 0 8px', letterSpacing: '-0.02em' };
const muted = { color: '#6b6b6b', fontSize: 13, margin: 0 };
const card = { background: '#ffffff', border: '1px solid #ececec', borderRadius: 8, padding: 24, marginTop: 24 };
const hr = { borderColor: '#ececec', margin: '16px 0' };
const totalRow = { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' };

export function OrderConfirmationEmail(props: OrderConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Order {props.shortId} confirmed — Paras n Paras</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Thanks for your order, {props.customerName.split(' ')[0]}.</Heading>
          <Text style={muted}>
            Order <strong style={{ color: '#1a1a1a' }}>{props.shortId}</strong> is confirmed. We&apos;ll email you again when it ships.
          </Text>

          <Section style={card}>
            <Text style={{ ...muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 14px' }}>
              Items
            </Text>
            {props.items.map((it, i) => (
              <Row key={i} style={{ marginBottom: 10 }}>
                <Column>
                  <Text style={{ fontSize: 14, color: '#1a1a1a', margin: 0, fontWeight: 500 }}>{it.name}</Text>
                  <Text style={{ ...muted, margin: '2px 0 0' }}>
                    Qty {it.qty} · {fmt(it.unitPriceRupees)} each
                  </Text>
                </Column>
                <Column align="right" style={{ verticalAlign: 'top' }}>
                  <Text style={{ fontSize: 14, color: '#1a1a1a', margin: 0 }}>{fmt(it.totalRupees)}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={hr} />

            <div style={totalRow}>
              <span style={{ color: '#6b6b6b' }}>Subtotal</span>
              <span>{fmt(props.subtotalRupees)}</span>
            </div>
            <div style={totalRow}>
              <span style={{ color: '#6b6b6b' }}>Shipping</span>
              <span>{props.shippingRupees === 0 ? 'Free' : fmt(props.shippingRupees)}</span>
            </div>
            <Hr style={hr} />
            <div style={{ ...totalRow, fontSize: 16 }}>
              <span style={{ color: '#1a1a1a' }}>Total paid</span>
              <strong style={{ color: '#1a1a1a' }}>{fmt(props.totalRupees)}</strong>
            </div>
          </Section>

          <Section style={card}>
            <Text style={{ ...muted, fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 10px' }}>
              Shipping to
            </Text>
            <Text style={{ fontSize: 14, color: '#1a1a1a', margin: 0, fontWeight: 500 }}>{props.shipping.fullName}</Text>
            <Text style={{ fontSize: 13, color: '#3a3a3a', margin: '4px 0 0', lineHeight: 1.55 }}>
              {props.shipping.line1}{props.shipping.line2 ? `, ${props.shipping.line2}` : ''}<br />
              {props.shipping.city}, {props.shipping.state} {props.shipping.pincode}<br />
              {props.shipping.country} · {props.shipping.phone}
            </Text>
          </Section>

          <Text style={{ ...muted, marginTop: 24, fontSize: 12 }}>
            View your order at{' '}
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
