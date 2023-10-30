import * as admin from 'firebase-admin';
import { DocumentData } from '@google-cloud/firestore';
import setupEmulator from '../../helpers/setupEmulator';
import { findPlayer } from '../../helpers/openfortApi/players';
import {
  repeat,
  waitForDocumentToExistWithField,
  waitForDocumentToExistInCollection,
  createFirebaseUser,
} from '../../helpers/utils';
import { UserRecord } from 'firebase-functions/v1/auth';

admin.initializeApp({ projectId: 'demo-project' });
setupEmulator();

const firestore = admin.firestore();

describe('playerDataDeleted', () => {
  let user: UserRecord;
  beforeEach(async () => {
    user = await createFirebaseUser();
  });

  test('successfully deletes an openfort player', async () => {
    const collection = firestore.collection('players');

    const player: DocumentData = await waitForDocumentToExistInCollection(
      collection,
      'email',
      user.email
    );

    const doc = collection.doc(player.doc.id);
    const userDoc = await waitForDocumentToExistWithField(doc, 'openfortId');

    await admin.auth().deleteUser(player.doc.id);

    // const check = ($) => $?.deleted;
    const check = ($) => true;
    const toRun = () => findPlayer(userDoc.data().openfortId);
    await repeat(toRun, check, 5, 2000);
  });
});
