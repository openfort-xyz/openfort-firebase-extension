# Manage Smart Wallets with Openfort

**Author**: Openfort (**[https://openfort.xyz](https://openfort.xyz)**)

**Description**: Controls management of a smart wallet to send blockchain transactions with Firebase.

**Details**: Use this extension as a backend for your [Openfort](https://www.openfort.xyz/) transactions.

The extension supports multiple use cases:

- Process blockchain transactions with [Openfort Smart Wallets](https://www.openfort.xyz/docs/guides/smart-accounts).

### Events

This extension emits events, which allows you to listen to and run custom logic at different trigger points during the functioning of the extension. For example you can listen to events when a transaction has been made via the `transaction_intent.created` event.

#### Additional setup

Before installing this extension, set up the following Firebase services in your Firebase project:

- [Cloud Firestore](https://firebase.google.com/docs/firestore) to store player & smart wallets details.
  - Follow the steps in the [documentation](https://firebase.google.com/docs/firestore/quickstart#create) to create a Cloud Firestore database.
- [Firebase Authentication](https://firebase.google.com/docs/auth) to enable different sign-up options for your users.
  - Enable the sign-in methods in the [Firebase console](https://console.firebase.google.com/project/_/authentication/providers) that you want to offer your users.

Then, in the [Openfort Dashboard](https://dashboard.openfort.xyz):

- Head [API keys](https://dashboard.openfort.xyz/apikeys) to get your secret key.

#### Billing

This extension uses the following Firebase services which may have associated charges:

- Cloud Firestore
- Cloud Functions
- Cloud Secret Manager
- Firebase Authentication
- If you enable events [Eventarc fees apply](https://cloud.google.com/eventarc/pricing).

This extension also uses the following third-party services:

- Openfort Smart Wallets ([pricing information](https://openfort.xyz))

You are responsible for any costs associated with your use of these services.

#### Note from Firebase

To install this extension, your Firebase project must be on the Blaze (pay-as-you-go) plan. You will only be charged for the resources you use. Most Firebase services offer a free tier for low-volume use. [Learn more about Firebase billing.](https://firebase.google.com/pricing)


**Configuration Parameters:**

* Cloud Functions deployment location: Where do you want to deploy the functions created for this extension? You usually want a location close to your database. For help selecting a location, refer to the [location selection guide](https://firebase.google.com/docs/functions/locations).

* player details collection: What is the path to the Cloud Firestore collection where the extension should store Openfort player details? This can be the location of an existing user collection, the extension will not overwrite your existing data but rather merge the Openfort data into your existing `uid` docs.

* Openfort configuration collection: What is the path to the Cloud Firestore collection where the extension should store Openfort configuration?

* Sync new users to Openfort players and Cloud Firestore: Do you want to automatically sync new users to player objects in Openfort? If set to 'Sync', the extension will create a new player object in Openfort and add a new doc to the player collection in Firestore when a new user signs up via Firebase Authentication. If set to 'Do not sync' (default), the extension will create the player object "on the fly" with the first checkout session creation.

* Automatically delete Openfort player objects: Do you want to automatically delete player objects in Openfort? When a user is deleted in Firebase Authentication or in Cloud Firestore and set to 'Auto delete' the extension will delete their player object in Openfort.

* Openfort API key: What is your Openfort API key? [Learn more](https://www.openfort.xyz/docs/guides/platform/keys).

* Minimum instances for createTransactionIntent function: Set the minimum number of function instances that should be always be available to create Transaction Intents. This number can be adjusted to reduce cold starts and increase the responsiveness of Checkout Session creation requests. Suggested values are 0 or 1. Please note this setting will likely incur billing costs, see the [Firebase documentation](https://firebase.google.com/docs/functions/manage-functions#reduce_the_number_of_cold_starts) for more information.



**Cloud Functions:**

* **createOpenfort:** Creates a Openfort player object when a new user signs up.

* **createTransactionIntent:** Creates a transaction intent.

* **handleWebhookEvents:** Handles Openfort webhook events to keep transaction intent statuses in sync and update custom claims.

* **onUserDeleted:** Deletes the Openfort player objectwhen the user is deleted in Firebase Authentication.

* **onPlayerDataDeleted:** Deletes the Openfort player object when the player doc in Cloud Firestore is deleted.



**Access Required**:

This extension will operate with the following project IAM roles:

* firebaseauth.admin (Reason: Allows the extension to set custom claims for users.)

* datastore.user (Reason: Allows the extension to store players in Cloud Firestore.)
