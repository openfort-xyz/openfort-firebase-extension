import * as admin from 'firebase-admin';
import { DocumentData } from '@google-cloud/firestore';
import {
  waitForDocumentToExistInCollection,
  waitForDocumentToExistWithField,
} from './utils';
import { UserRecord } from 'firebase-functions/v1/auth';
import setupEmulator from './setupEmulator';

if (admin.apps.length === 0) {
  admin.initializeApp({ projectId: 'demo-project' });
}

setupEmulator();

const firestore = admin.firestore();

function playerCollection() {
  return firestore.collection('players');
}

function transactionIntentCollection(userId) {
  return firestore.collection('players').doc(userId).collection('transaction_intents');
}

export async function findPlayerInCollection(user: UserRecord) {
  const doc = firestore.collection('players').doc(user.uid);

  const playerDoc = await waitForDocumentToExistWithField(
    doc,
    'openfortId',
    60000
  );

  return Promise.resolve({ docId: user.uid, ...playerDoc.data() });
}

export async function findPlayerTransactionIntentInCollection(
  userId: string,
  openfortId: string
) {
  const transactionIntentDoc: DocumentData = await waitForDocumentToExistInCollection(
    transactionIntentCollection(userId),
    'player',
    openfortId
  );

  const transactionIntentRef = transactionIntentCollection(userId).doc(transactionIntentDoc.doc.id);

  const updatedTransactionIntentDoc = await waitForDocumentToExistWithField(
    transactionIntentRef,
    'prices'
  );

  return updatedTransactionIntentDoc.data();
}
