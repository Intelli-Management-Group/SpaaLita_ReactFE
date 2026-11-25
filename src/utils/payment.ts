import { loadStripe } from '@stripe/stripe-js';

/**
 * How the customer pays. Sent to the backend as `paymentMethod` (POST /orders)
 * and returned on the order. Both are processed by Stripe: Klarna redirects the
 * customer to Klarna and back to /checkout/order-received/:orderId.
 */
export type PaymentMethod = 'card' | 'klarna';

// Must belong to the same Stripe account and mode (live/test) as STRIPE_SECRET_KEY in the
// backend .env, or confirming a payment fails with "No such payment_intent".
// The default is the live key of the Spa A'lita Stripe account (acct_1FdWyqHp9OLq5NYn), which
// matches the production API in apiConfig.ts. Publishable keys are public, so it can be committed.
export const stripePromise = loadStripe(
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    'pk_live_Hk1UYBg0xL9wwfAzON6Kq9Cj00nDIeVPFh'
);

const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    card: 'Credit Card / Debit Card',
    klarna: 'Klarna',
};

/** Display name of an order's payment method (orders placed before Klarna have none: card) */
export const paymentMethodLabel = (method?: string | null): string =>
    method && Object.hasOwn(PAYMENT_METHOD_LABELS, method)
        ? PAYMENT_METHOD_LABELS[method as PaymentMethod]
        : PAYMENT_METHOD_LABELS.card;
