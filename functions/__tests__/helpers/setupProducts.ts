import { faker } from '@faker-js/faker';
import config from '../../lib/config';
import Openfort, { ContractResponse } from '@openfort/openfort-node'
const openfort = new Openfort(config.openfortSecretKey);


export const generateContract = async (): Promise<ContractResponse> => {
  const name = faker.commerce.product();

  /** create a contract */
  const contract = await openfort.contracts.create({ address: '0x38090d1636069c0ff1af6bc1737fb996b7f63ac0', chainId: 80001, name: name })

  return contract;
}

export const generatePolicy = async ({ contractId }: { contractId: string }) => {
  const name = faker.commerce.product();
  /** create a policy */
  const policy = await openfort.policies.create({ name: name, chainId: 80001, strategy: { sponsorSchema: 'pay_for_user' } })
  await openfort.policyRules.create({ policy: policy.id, contract: contractId, type: 'contract_functions', functionName: 'All functions' })
  return Promise.resolve(policy);
}

