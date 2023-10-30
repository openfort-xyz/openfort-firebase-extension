export const setupWebhooks = async (url) => {
  const stripe = require('stripe')(process.env.OPENFORT_API_KEY);

  const webhook = await stripe.webhookEndpoints.create({
    url,
    enabled_events: [
      'transaction_intent.succeeded',
      'transaction_intent.canceled',
    ],
  });

  return webhook;
};

export const clearWebhooks = async (id) => {
  const stripe = require('stripe')(process.env.OPENFORT_API_KEY);

  return stripe.webhookEndpoints.del(process.env.WEBHOOK_ID);
};

export const clearAllWebhooks = async () => {
  const stripe = require('stripe')(process.env.OPENFORT_API_KEY);

  const webhooks = await stripe.webhookEndpoints.list();

  for await (const webhook of webhooks.data) {
    if (webhook.url.includes('ngrok.io')) {
      await stripe.webhookEndpoints.del(webhook.id);
    }
  }

  return Promise.resolve();
};
