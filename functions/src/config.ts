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

export default {
  openfortSecretKey: process.env.OPENFORT_API_KEY,
  playersCollectionPath: process.env.PLAYERS_COLLECTION,
  openfortConfigCollectionPath: process.env.OPENFORT_CONFIG_COLLECTION,
  syncUsersOnCreate: process.env.SYNC_USERS_ON_CREATE === 'Sync',
  autoDeleteUsers: process.env.DELETE_OPENFORT_PLAYERS === 'Auto delete',
  minCheckoutInstances:
    Number(process.env.CREATE_TRANSACTION_INTENT_MIN_INSTANCES) ?? 0,
};
