# story-app-web

Static marketing site for the Baboo Stories early-access programme.

## Firestore integration overview

The Early Bird Access form is wired to store submissions in a Firebase
Firestore collection. The browser script expects a valid Firebase
configuration and will gracefully warn visitors if Firestore has not been
initialised yet.

### Files involved

- `assets/js/firebase-config.js` – holds your Firebase project credentials.
- `assets/js/firebase-config.example.js` – sample configuration you can copy
  and adapt.
- `assets/js/early-bird-form.js` – initialises Firebase and stores form data in
  the `earlyBirdSignups` collection.

## Configuring Firestore

1. **Create a Firebase project (or set up a new one)**
   - Visit [console.firebase.google.com](https://console.firebase.google.com)
     and sign in with the Google account that will own the data.
   - Click **Add project** and follow the wizard to create a project name and
     Cloud resource location. This automatically creates the underlying Google
     Cloud project that Firestore needs.
   - Decide whether you want to enable Google Analytics. It is optional for
     this marketing site and can be disabled during setup.
   - Wait for Firebase to finish provisioning the project, then open it from
     the Firebase console home page.

2. **Add a web app**
   - Inside your project settings choose **Add app → Web**.
   - Register the app (e.g. `baboo-story-site`) and copy the configuration
     snippet that Firebase generates for you.

3. **Enable Firestore**
   - In the left-hand navigation open **Build → Firestore Database**.
   - Click **Create database**, choose *Start in production mode*, and select
     the region closest to your visitors.

4. **Create the configuration file**
   - Duplicate `assets/js/firebase-config.example.js` to
     `assets/js/firebase-config.js`.
   - Replace every placeholder with the real values from the Firebase
     configuration snippet you copied earlier.
   - (Optional) Add `assets/js/firebase-config.js` to your `.gitignore` to keep
     secrets out of version control.

5. **Set up the collection**
   - Open **Firestore Database → Data**.
   - Create a collection named `earlyBirdSignups`.
   - Add any fields you want to predefine (for example `name`, `email`,
     `childrenAges`, `expectations`, `referralSource`, `userAgent`,
     `createdAt`). The web form will automatically create fields the first time
     it writes to Firestore, so this step is optional.

6. **Harden your security rules**
   - In **Firestore Database → Rules**, restrict write access to authenticated
     requests where possible. If you must allow public writes, consider using
     [Firebase App Check](https://firebase.google.com/docs/app-check) and
     validation rules to limit spam.
   - Example rule for public submissions:

     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /earlyBirdSignups/{document=**} {
           allow create: if request.resource.data.keys().hasAll([
             'name', 'email', 'childrenAges', 'expectations',
             'referralSource', 'userAgent', 'createdAt'
           ]) &&
           request.time < timestamp.date(2026, 1, 1);
           allow read: if false;
         }
       }
     }
     ```

7. **Deploy**
   - Upload the updated site to your hosting provider.
   - Verify a submission by filling out the form and checking the collection in
     Firestore for the new document.

Following these steps removes the dependency on Google Sheets and ensures form
submissions are stored directly in Firestore.
