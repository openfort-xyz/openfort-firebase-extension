/*
 * Copyright 2023 Alamas Labs, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as admin from 'firebase-admin';
import { getEventarc } from 'firebase-admin/eventarc';
import * as functions from 'firebase-functions';
import { PlayerData } from './interfaces';
import Openfort, {
  TransactionIntentResponse,
  CreateTransactionIntentRequest,
} from '@openfort/openfort-node';
import * as logs from './logs';
import config from './config';
import { Timestamp } from 'firebase-admin/firestore';

const openfort = new Openfort(config.openfortSecretKey);

admin.initializeApp();

const eventChannel =
  process.env.EVENTARC_CHANNEL &&
  getEventarc().channel(process.env.EVENTARC_CHANNEL, {
    allowedEventTypes: process.env.EXT_SELECTED_EVENTS,
  });

function toPlainObject(obj) {
  if (obj === null) return null;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(toPlainObject);
  }

  const newObj = {};
  for (const key in obj) {
    newObj[key] = toPlainObject(obj[key]);
  }

  return newObj;
}

/**
 * Create a player object in Openfort when a user is created.
 */
const createPlayerRecord = async ({
  email,
  uid,
  phone,
}: {
  email?: string;
  phone?: string;
  uid: string;
}) => {
  try {
    logs.creatingPlayer(uid);
    const playerData: PlayerData = {
      name: uid,
    };

    const player = await openfort.players.create(playerData);

    // Add a mapping record in Cloud Firestore.
    const playerRecord = {
      email: email,
      openfortId: player.id,
    };
    if (phone) (playerRecord as any).phone = phone;
    await admin
      .firestore()
      .collection(config.playersCollectionPath)
      .doc(uid)
      .set(playerRecord, { merge: true });
    logs.playerCreated(
      player.id
    );
    return playerRecord;
  } catch (error) {
    logs.playerCreationError(error, uid);
    return null;
  }
};

exports.createPlayer = functions.auth
  .user()
  .onCreate(async (user): Promise<void> => {
    if (!config.syncUsersOnCreate) return;
    const { email, uid, phoneNumber } = user;
    await createPlayerRecord({
      email,
      uid,
      phone: phoneNumber,
    });
  });

/**
 * Create a transactionIntent based on which client is being used.
 */
exports.createTransactionIntent = functions
  .runWith({
    minInstances: config.minCheckoutInstances,
  })
  .firestore.document(
    `/${config.playersCollectionPath}/{uid}/transaction_intents/{id}`
  )
  .onCreate(async (snap, context) => {
    const {
      chainId,
      optimistic = true,
      confirmationBlocks,
      externalOwnerAddress,
      policy,
      contract,
      functionName,
      functionArgs,
      interactions,
    } = snap.data();
    try {
      logs.creatingTransactionIntent(context.params.id);
      // Get openfort player id
      let playerRecord = (await snap.ref.parent.parent.get()).data();

      if (!playerRecord?.openfortId) {
        const { email, phoneNumber } = await admin
          .auth()
          .getUser(context.params.uid);
        playerRecord = await createPlayerRecord({
          uid: context.params.uid,
          email,
          phone: phoneNumber,
        });
      }

      const player = playerRecord.openfortId;

      const transactionCreateParams: CreateTransactionIntentRequest = {
        player,
        chainId,
        optimistic,
        confirmationBlocks,
        externalOwnerAddress,
        policy,
        interactions: interactions
          ? interactions
          : [
            {
              contract,
              functionName,
              functionArgs,
            },
          ],
      };

      const transactionIntent = await openfort.transactionIntents.create(
        transactionCreateParams
      );

      if (!optimistic) {
        await insertTransactionResponseRecord(transactionIntent);
      }

      await snap.ref.set(
        {
          id: transactionIntent.id,
          created: Timestamp.now(),
        },
        { merge: true }
      );

      logs.transactionIntentCreated(context.params.id);
      return;
    } catch (error) {
      logs.transactionIntentCreationError(context.params.id, error);
      await snap.ref.set(
        { error: { message: error.message } },
        { merge: true }
      );
    }
  });

/**
 * Add TransactionIntent objects to Cloud Firestore.
 */
const insertTransactionResponseRecord = async (
  transaction: TransactionIntentResponse
) => {

  // Get player's UID from Firestore
  const playersSnap = await admin
    .firestore()
    .collection(config.playersCollectionPath)
    .where('openfortId', '==', transaction.player.id)
    .get();
  if (playersSnap.size !== 1) {
    throw new Error('User not found!');
  }

  // Convert the transaction response to plain JSON
  const plainResponse = toPlainObject(transaction.response);

  // Write to invoice to a subcollection on the player doc.
  await playersSnap.docs[0].ref
    .collection('response')
    .doc(transaction.id)
    .set(plainResponse, { merge: true });
  logs.firestoreDocCreated('response', transaction.id);
};

/**
 * A webhook handler function for the relevant Openfort events.
 */
export const handleWebhookEvents = functions.handler.https.onRequest(
  async (req: functions.https.Request, resp) => {
    const relevantEvents = new Set(['transaction_intent.succeeded', 'transaction_intent.canceled']);
    let event;

    // Use the Openfort webhooks API to make sure
    // this webhook call came from a trusted source
    try {
      event = openfort.constructWebhookEvent(
        req.rawBody.toString(),
        req.headers['openfort-signature'] as string
      );
    } catch (error) {
      logs.badWebhookSecret(error);
      resp.status(401).send('Webhook Error: Invalid Secret');
      return;
    }

    if (relevantEvents.has(event.type)) {
      logs.startWebhookEventProcessing(event.id, event.type);
      try {
        switch (event.type) {
          case 'transaction_intent.succeeded':
            await insertTransactionResponseRecord(event.data as TransactionIntentResponse);
          case 'transaction_intent.canceled':
            await insertTransactionResponseRecord(event.data as TransactionIntentResponse);
          default:
            logs.webhookHandlerError(
              new Error('Unhandled relevant event!'),
              event.id,
              event.type
            );
        }
        if (eventChannel) {
          await eventChannel.publish({
            type: `com.openfort.v1.${event.type}`,
            data: event.data.object,
          });
        }
        logs.webhookHandlerSucceeded(event.id, event.type);
      } catch (error) {
        logs.webhookHandlerError(error, event.id, event.type);
        resp.json({
          error: 'Webhook handler failed. View function logs in Firebase.',
        });
        return;
      }
    }
  }
);

const deleteOpenfortPlayer = async ({
  uid,
  openfortId,
}: {
  uid: string;
  openfortId: string;
}) => {
  try {
    // Delete their player object.
    await openfort.players.delete(openfortId);
    logs.playerDeleted(openfortId);

  } catch (error) {
    logs.playerDeletionError(error, uid);
  }
};

/*
 * The `onUserDeleted` deletes their player object in Openfort.
 */
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  if (!config.autoDeleteUsers) return;
  // Get the Openfort player id.
  const player = (
    await admin
      .firestore()
      .collection(config.playersCollectionPath)
      .doc(user.uid)
      .get()
  ).data();
  // If you use the `delete-user-data` extension it could be the case that the player record is already deleted.
  // In that case, the `onPlayerDataDeleted` function below takes care of deleting the Openfort player object.
  if (player) {
    await deleteOpenfortPlayer({
      uid: user.uid,
      openfortId: player.openfortId,
    });
  }
});

/*
 * The `onPlayerDataDeleted` deletes their player object in Openfort.
 */
export const onPlayerDataDeleted = functions.firestore
  .document(`/${config.playersCollectionPath}/{uid}`)
  .onDelete(async (snap, context) => {
    if (!config.autoDeleteUsers) return;
    const { openfortId } = snap.data();
    await deleteOpenfortPlayer({ uid: context.params.uid, openfortId });
  });
