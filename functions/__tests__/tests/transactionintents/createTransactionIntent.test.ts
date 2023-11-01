import * as admin from 'firebase-admin';
import { DocumentReference, DocumentData } from '@google-cloud/firestore';
import { UserRecord } from 'firebase-functions/v1/auth';
import setupEmulator from '../../helpers/setupEmulator';
import { generateContract, generatePolicy } from '../../helpers/setupProducts';
import {
  createFirebaseUser,
  waitForDocumentToExistInCollection,
  waitForDocumentToExistWithField,
} from '../../helpers/utils';

admin.initializeApp({ projectId: 'demo-project' });
setupEmulator();

const firestore = admin.firestore();

describe('createTransactionIntent', () => {
  let user: UserRecord;
  let contract = null;
  let policy = null;

  beforeEach(async () => {
    contract = await generateContract();
    policy = await generatePolicy({ contractId: contract.id });
    user = await createFirebaseUser();
  });

  afterEach(async () => {
    await admin.auth().deleteUser(user.uid);
  });

  describe('using a web client', () => {
    test('successfully mints an NFT with a transaction intent', async () => {
      const collection = firestore.collection('players');

      const player: DocumentData = await waitForDocumentToExistInCollection(
        collection,
        'email',
        user.email
      );

      const transactionIntentCollection = collection
        .doc(player.doc.id)
        .collection('transaction_intents');

      const transactionIntentDocument: DocumentReference =
        await transactionIntentCollection.add({
          policy: policy.id,
          chainId: 80001,
          optimistic: false,
          interactions: [
            {
              //@ts-ignore
              contract: contract.id,
              functionName: 'mint',
              functionArgs: ['0x64452Dff1180b21dc50033e1680bB64CDd492582'],
            },
          ],
        });

      const playerDoc = await waitForDocumentToExistWithField(
        transactionIntentDocument,
        'created'
      );

      const data = playerDoc.data();

      expect(data.policy).toBe(policy.id);
    });

    test.skip('throws an error when contract has not been provided', async () => { });

    test.skip('throws an error when policy has not been provided', async () => { });
    test.skip('throws an error when a chainId has not been provided', async () => { });
    test.skip('throws an error when a interactions data array parameter has not been provided', async () => { });
  });
});
