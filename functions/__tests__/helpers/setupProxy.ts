const ngrok = require('ngrok');
const fs = require('fs').promises;
const { parse, stringify } = require('envfile');

import { clearWebhooks, clearAllWebhooks } from './webhooks';
import { pathTosecretsFile, pathToenvFile } from './setupEnvironment';
import { setupEnvironment } from './setupEnvironment';

async function setEnv(key: string, value, isSecret?: boolean) {
  /** Load Openfort key into env */
  setupEnvironment();

  const path = isSecret ? pathTosecretsFile : pathToenvFile;

  const data = await fs.readFile(path, 'utf8');

  var result = parse(data);
  result[key] = value;

  await fs.writeFile(path, stringify(result));
}

export const setupProxy = async () => {
  /** Set Openfort secret and webhooks if provided or running in CI */
  if (process.env.OPENFORT_API_KEY) {
    await setEnv('OPENFORT_API_KEY', process.env.OPENFORT_API_KEY, true);
    await setEnv('WEBHOOK_URL', process.env.OPENFORT_API_KEY);
  }

  /** Load Openfort key before initialisation */
  const secretsEnv = await fs.readFile(pathTosecretsFile, 'utf8');
  const paramsEnv = await fs.readFile(pathToenvFile, 'utf8');
  const { OPENFORT_API_KEY } = parse(secretsEnv);
  const { WEBHOOK_URL } = parse(paramsEnv);

  /** Set configurable params */
  process.env.OPENFORT_API_KEY = OPENFORT_API_KEY;
  process.env.WEBHOOK_URL = WEBHOOK_URL;

  await Promise.all([
    await setEnv('OPENFORT_API_KEY', OPENFORT_API_KEY, true),
    await setEnv('WEBHOOK_URL', WEBHOOK_URL),
    // await setEnv('WEBHOOK_ID', webhook.id),
    await setEnv('LOCATION', 'us-central1'),
    await setEnv('PROJECT_ID', 'demo-project'),
    await setEnv('PLAYERS_COLLECTION', 'players'),
    await setEnv('SYNC_USERS_ON_CREATE', 'Sync'),
    await setEnv('DELETE_OPENFORT_PLAYERS', 'Auto delete'),
  ]);

  /** Load additional key into env */
  setupEnvironment();

  // return webhook.id;

  return;
};

export const cleanupProxy = async (webhookUrl) => {
  return clearWebhooks(webhookUrl);
};

export const cleanupAllWebhooks = async () => {
  return clearAllWebhooks();
};
