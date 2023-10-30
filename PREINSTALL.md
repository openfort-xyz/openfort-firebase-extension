Use this extension as a backend for your [Openfort](https://www.openfort.xyz/) blockchain transactions.

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
