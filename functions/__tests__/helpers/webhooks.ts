export const setupWebhooks = async (url) => {
  const Openfort = require('@openfort/openfort-node').default;

  const openfort = new Openfort(process.env.OPENFORT_API_KEY);

  const webhook = await openfort.settings.updateWebhook(url);

  return webhook;
};

export const clearWebhooks = async () => {
  const Openfort = require('@openfort/openfort-node').default;

  const openfort = new Openfort(process.env.OPENFORT_API_KEY);

  return openfort.settings.removeWebhook();
};
