import config from '../../../lib/config';
import Openfort from '@openfort/openfort-node'
const openfort = new Openfort(config.openfortSecretKey);

export const findPlayer = async (id) => {
  return await openfort.players.get({ id: id });
};
