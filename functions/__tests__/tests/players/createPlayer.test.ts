import * as admin from 'firebase-admin';
import { DocumentData } from '@google-cloud/firestore';

import setupEmulator from '../../helpers/setupEmulator';
import { UserRecord } from 'firebase-functions/v1/auth';
import {
  createFirebaseUser,
  waitForDocumentToExistInCollection,
} from '../../helpers/utils';

admin.initializeApp({ projectId: 'demo-project' });
setupEmulator();

const firestore = admin.firestore();

describe('createPlayer', () => {
  let user: UserRecord;
  beforeEach(async () => {
    user = await createFirebaseUser();
  });

  test('successfully creates a new player', async () => {
    const collection = firestore.collection('players');

    const player: DocumentData = await waitForDocumentToExistInCollection(
      collection,
      'email',
      user.email
    );

    const doc = collection.doc(player.doc.id);

    expect(doc.id).toBeDefined();
  });
});
