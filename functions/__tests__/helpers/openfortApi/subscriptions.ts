import { faker } from '@faker-js/faker';
import config from '../../../lib/config';
import { ContractResponse, PolicyResponse, PolicyRuleResponse, TransactionIntentResponse } from '@openfort/openfort-node';
import Openfort from '@openfort/openfort-node'

const openfort = new Openfort(config.openfortSecretKey);



export const createRandomSubscription = async (
  player
): Promise<TransactionIntentResponse> => {
  const name = faker.commerce.product();

  /** create a contract */
  const contract: ContractResponse = await openfort.contracts.create({ address: '0x38090d1636069c0ff1af6bc1737fb996b7f63ac0', chainId: 80001, name: name })

  /** create a policy */
  const policy: PolicyResponse = await openfort.policies.create({ name: 'Policy sponsor', chainId: 80001, strategy: { sponsorSchema: 'pay_for_user' } })
  const policyRule: PolicyRuleResponse = await openfort.policyRules.create({ policy: policy.id, contract: contract.id, type: 'contract_functions', functionName: 'All functions' })

  /** Attach an account to the player */
  const account = await openfort.accounts.create({ chainId: 80001, player: player })

  /** Create a transaction intent */
  const transactionIntent: TransactionIntentResponse = await openfort.transactionIntents.create({
    player: player, chainId: 80001, policy: policy.id, interactions: [{ contract: contract.id, functionName: 'mint', functionArgs: [player.id] }],
    optimistic: false
  })


  return Promise.resolve(transactionIntent);
};
