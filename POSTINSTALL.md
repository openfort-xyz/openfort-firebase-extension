### Configuring the extension

Before you proceed, make sure you have the following Firebase services set up:

- [Cloud Firestore](https://firebase.google.com/docs/firestore) to store player details.
  - Follow the steps in the [documentation](https://firebase.google.com/docs/firestore/quickstart#create) to create a Cloud Firestore database.
- [Firebase Authentication](https://firebase.google.com/docs/auth) to enable different sign-up options for your users.
  - Enable the sign-in methods in the [Firebase console](https://console.firebase.google.com/project/_/authentication/providers) that you want to offer your users.

#### Set your Cloud Firestore security rules

It is crucial to limit data access to authenticated users only and for users to only be able to see their own information. For product and pricing information it is important to disable write access for client applications. Use the rules below to restrict access as recommended in your project's [Cloud Firestore rules](https://console.firebase.google.com/project/${param:PROJECT_ID}/firestore/rules):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /${param:PLAYERS_COLLECTION}/{uid} {
      allow read: if request.auth.uid == uid;

      match /transaction_intents/{id} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
}
```

#### Configure Openfort webhooks

You need to set up a webhook that synchronizes relevant details from Openfort with your Cloud Firestore. This includes product and pricing data from the Openfort Dashboard.

Here's how to set up the webhook and configure your extension to use it:

1. Configure your webhook:

   1. Go to the [Openfort dashboard.](https://dashboard.openfort.xyz/webhooks)

   2. Use the URL of your extension's function as the endpoint URL. Here's your function's URL: `${function:handleWebhookEvents.url}`


2. Using the Firebase console or Firebase CLI, [reconfigure](https://console.firebase.google.com/project/${param:PROJECT_ID}/extensions/instances/${param:EXT_INSTANCE_ID}?tab=config) your extension with your Openfort secret key (such as, `sk_test_12345678`). Enter the value in the parameter called `Openfort secret key`. Make sure you scroll back to the top of the Extension configuration page and click 'Save' otherwise your Openfort webhook secret will not be saved.

#### Create contract and policy information

Checkout the guide on [how to create a contract and policy](https://www.openfort.xyz/docs/guides/smart-accounts/policies) in the Openfort documentation.

### Using the extension

Once you've configured the extension you can add payments and access control to your websites and mobile apps fully client-side with the corresponding Firebase SDKs. You can find the demo source code on [GitHub](https://github.com/openfort-xyz/samples);

#### Sign-up users with Firebase Authentication

The quickest way to sign-up new users is by using the [FirebaseUI library](https://firebase.google.com/docs/auth/web/firebaseui). Follow the steps outlined in the official docs. When configuring the extension you can choose to 'Sync' new users to Openfort. If set to 'Sync', the extension listens to new users signing up and then automatically creates a Openfort player object and a player record in your Cloud Firestore. If set to 'Do not sync' (default), the extension will create the player object "on the fly" with the first checkout session creation.


### Send transactions to the blockchain

You can create Checkout Sessions for one-time payments when referencing a one-time price ID. One-time payments will be synced to Cloud Firestore into a payments collection for the relevant player doc if you update your webhook handler in the Openfort dashboard to include the following events: `transaction_intent.succeeded`, `transaction_intent.canceled`.


```js
const docRef = await db
  .collection('${param:PLAYERS_COLLECTION}')
  .doc(currentUser.uid)
  .collection("transaction_intents")
  .add({
      "policy": 'pol_',
      "chainId": 80001,
      "optimistic": false,
      "interactions": [
        {
          "contract": "con_...",
          "functionName": 'mint',
          "functionArgs": ['0x64452Dff1180b21dc50033e1680bB64CDd492582'],
        },
      ],
  });
``` 

#### Delete User Data

You have the option to automatically delete player objects in Openfort by setting the deletion option in the configuration to "Auto delete". In that case, when a user is deleted in Firebase Authentication, the extension will delete their player object in Openfort.

The extension will not delete any data from Cloud Firestore. Should you wish to delete the player data from Cloud Firestore, you can use the [Delete User Data](https://firebase.google.com/products/extensions/delete-user-data) extension built by the Firebase team.

### Monitoring

As a best practice, you can [monitor the activity](https://firebase.google.com/docs/extensions/manage-installed-extensions#monitor) of your installed extension, including checks on its health, usage, and logs.

Access the [Openfort dashboard](https://dashboard.openfort.xyz/) to manage all aspects of your Openfort account.

Enjoy and please submit any feedback and feature requests on [GitHub](https://github.com/openfort-xyz/openfort-firebase-extensions/issues/new/choose)!
