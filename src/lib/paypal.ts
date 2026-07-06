// PayPal Orders v2 REST integration.
// PAYPAL_ENV defaults to "sandbox" so nothing charges real money until it's
// deliberately set to "live" (with a matching live Client ID/Secret).

const PAYPAL_ENV = process.env.PAYPAL_ENV === "live" ? "live" : "sandbox";

const PAYPAL_API_BASE =
  PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

// Server-side source of truth for prices — never trust a client-supplied amount.
export const RANK_PRICES: Record<string, string> = {
  vip: "10.00",
  custom: "25.00",
};

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not configured.");
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

export type OrderCustomData = {
  ign: string;
  rank: string;
  nickname?: string;
  color?: string;
};

export async function createOrder(custom: OrderCustomData): Promise<string> {
  const amount = RANK_PRICES[custom.rank];
  if (!amount) throw new Error(`Unknown rank: ${custom.rank}`);

  const accessToken = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          custom_id: JSON.stringify(custom).slice(0, 127),
          description: `FFA rank purchase: ${custom.rank}`,
          amount: { currency_code: "USD", value: amount },
        },
      ],
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayPal create order failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.id as string;
}

export type CapturedOrder = {
  status: string;
  custom: OrderCustomData | null;
};

export async function captureOrder(orderId: string): Promise<CapturedOrder> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const customId = data?.purchase_units?.[0]?.payments?.captures?.[0]?.custom_id
    ?? data?.purchase_units?.[0]?.custom_id;

  let custom: OrderCustomData | null = null;
  if (customId) {
    try {
      custom = JSON.parse(customId);
    } catch {
      custom = null;
    }
  }

  return { status: data.status as string, custom };
}
