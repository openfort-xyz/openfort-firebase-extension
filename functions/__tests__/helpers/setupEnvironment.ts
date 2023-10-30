const path = require('path');

export const pathToenvFile = path.resolve(
  __dirname,
  '../../../_emulator/extensions/firestore-openfort-wallet.env.local'
);

export const pathTosecretsFile = path.resolve(
  __dirname,
  '../../../_emulator/extensions/firestore-openfort-wallet.secret.local'
);

export const setupEnvironment = () => {
  require('dotenv').config({
    path: pathToenvFile,
  });

  require('dotenv').config({
    path: pathTosecretsFile,
  });
};
