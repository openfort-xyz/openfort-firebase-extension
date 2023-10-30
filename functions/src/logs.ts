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

import { logger } from 'firebase-functions';

export const creatingPlayer = (uid: string) => {
  logger.log(`⚙️ Creating player object for [${uid}].`);
};

export const playerCreationError = (error: Error, uid: string) => {
  logger.error(
    `❗️[Error]: Failed to create player for [${uid}]:`,
    error.message
  );
};

export const playerDeletionError = (error: Error, uid: string) => {
  logger.error(
    `❗️[Error]: Failed to delete player for [${uid}]:`,
    error.message
  );
};

export function playerCreated(id: string) {
  logger.log(
    `✅ Created a new player: https://dashboard.openfort.xyz/players/${id}.`
  );
}

export function playerDeleted(id: string) {
  logger.log(`🗑 Deleted Openfort player [${id}]`);
}

export function creatingTransactionIntent(docId: string) {
  logger.log(`⚙️ Creating transaction intent for doc [${docId}].`);
}

export function transactionIntentCreated(docId: string) {
  logger.log(`✅ Transaction intent created for doc [${docId}].`);
}

export function transactionIntentCreationError(docId: string, error: Error) {
  logger.error(
    `❗️[Error]: Transaction intent creation failed for doc [${docId}]:`,
    error.message
  );
}

export function firestoreDocCreated(collection: string, docId: string) {
  logger.log(
    `🔥📄 Added doc [${docId}] to collection [${collection}] in Firestore.`
  );
}

export function firestoreDocDeleted(collection: string, docId: string) {
  logger.log(
    `🗑🔥📄 Deleted doc [${docId}] from collection [${collection}] in Firestore.`
  );
}

export function userCustomClaimSet(
  uid: string,
  claimKey: string,
  claimValue: string
) {
  logger.log(
    `🚦 Added custom claim [${claimKey}: ${claimValue}] for user [${uid}].`
  );
}

export function badWebhookSecret(error: Error) {
  logger.error(
    '❗️[Error]: Webhook signature verification failed. Is your Openfort webhook secret parameter configured correctly?',
    error.message
  );
}

export function startWebhookEventProcessing(id: string, type: string) {
  logger.log(`⚙️ Handling Openfort event [${id}] of type [${type}].`);
}

export function webhookHandlerSucceeded(id: string, type: string) {
  logger.log(`✅ Successfully handled Openfort event [${id}] of type [${type}].`);
}

export function webhookHandlerError(error: Error, id: string, type: string) {
  logger.error(
    `❗️[Error]: Webhook handler for  Openfort event [${id}] of type [${type}] failed:`,
    error.message
  );
}
