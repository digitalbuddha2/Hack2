import Stripe from 'stripe';
import * as db from './db.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createCheckoutSession(user) {
  // Create or retrieve Stripe customer
  let customerId = user.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id }
    });
    customerId = customer.id;
    db.updateUserStripeInfo(user.id, customerId, null, 'inactive', null);
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1
      }
    ],
    mode: 'subscription',
    success_url: `${process.env.BASE_URL}/dashboard?success=true`,
    cancel_url: `${process.env.BASE_URL}/dashboard?canceled=true`,
    metadata: { userId: user.id }
  });

  return session;
}

async function handleWebhook(body, signature) {
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  console.log('Stripe webhook event:', event.type);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      // Get subscription details
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const endDate = subscription.current_period_end;

      // Update user
      const user = db.getUserByStripeCustomer(customerId);
      if (user) {
        db.updateUserStripeInfo(user.id, customerId, subscriptionId, 'active', endDate);
        console.log('Subscription activated for user:', user.email);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const status = subscription.status === 'active' ? 'active' : 'inactive';
      const endDate = subscription.current_period_end;

      db.updateSubscriptionStatus(customerId, status, endDate);
      console.log('Subscription updated:', customerId, status);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      db.updateSubscriptionStatus(customerId, 'canceled', null);
      console.log('Subscription canceled:', customerId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      db.updateSubscriptionStatus(customerId, 'past_due', null);
      console.log('Payment failed for customer:', customerId);
      break;
    }
  }
}

async function cancelSubscription(subscriptionId) {
  await stripe.subscriptions.cancel(subscriptionId);
}

export {
  createCheckoutSession,
  handleWebhook,
  cancelSubscription
};
