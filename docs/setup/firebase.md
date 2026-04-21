# Firebase Setup Guide

This guide walks you through setting up Firebase for your own NexChat instance.

## Prerequisites

- A Google account
- Node.js 18+ installed
- A code editor (VS Code recommended)

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter a project name (e.g., `nexchat-demo`)
4. Click **"Continue"**
5. Disable Google Analytics (optional, not needed for chat features)
6. Click **"Create project"**
7. Wait for project to be created, then click **"Continue"**

## Step 2: Enable Authentication

1. In Firebase Console, click **"Authentication"** in the left sidebar
2. Click **"Get started"**
3. Click the **"Sign-in method"** tab
4. Click **"Google"**
5. Toggle **"Enable"** to ON
6. Set a support email (your email)
7. Click **"Save"**

## Step 3: Create Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a location (choose the one closest to your users)
5. Click **"Enable"**

## Step 4: Configure Firestore Security Rules

1. In Firestore Database, click the **"Rules"** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection: Users can read any profile, write only their own
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update, delete: if request.auth != null && request.auth.uid == userId;
    }

    // Rooms collection
    match /rooms/{roomId} {
      // Any authenticated user can create rooms
      allow create: if request.auth != null;

      // Room members can read room data
      allow read: if request.auth != null
                  && request.auth.uid in resource.data.members;

      // Only room creator can update or delete
      allow update: if request.auth != null
                    && request.auth.uid == resource.data.createdBy;
      allow delete: if request.auth != null
                    && request.auth.uid == resource.data.createdBy;

      // Messages subcollection
      match /messages/{messageId} {
        // Room members can read messages
        allow read: if request.auth != null
                    && request.auth.uid in get(/databases/$(database)/documents/rooms/$(roomId)).data.members;

        // Any authenticated user can send messages (userId must match auth uid)
        allow create: if request.auth != null
                      && request.resource.data.userId == request.auth.uid;

        // Only message sender can delete their messages
        allow delete: if request.auth != null
                      && resource.data.userId == request.auth.uid;

        // No updates allowed (messages are immutable)
        allow update: if false;
      }
    }
  }
}
```

3. Click **"Publish"**

## Step 5: Register a Web App

1. In Firebase Console, click the **gear icon** next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **web icon** (`</>`)
5. Enter an app nickname (e.g., `nexchat-web`)
6. Click **"Register app"**
7. Copy the configuration object:

```javascript
const firebaseConfig = {
  apiKey: 'AIza...',
  authDomain: 'nexchat-demo.firebaseapp.com',
  projectId: 'nexchat-demo',
  storageBucket: 'nexchat-demo.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};
```

## Step 6: Configure Environment Variables

1. In your NexChat project root, create a `.env.local` file:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=nexchat-demo.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=nexchat-demo
VITE_FIREBASE_STORAGE_BUCKET=nexchat-demo.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

2. Replace the values with your actual Firebase config

## Step 7: Add Authorized Domains (for Production)

1. In Firebase Console, go to **Authentication** → **Settings**
2. Click the **"Authorized domains"** tab
3. Click **"Add domain"**
4. Add your production domain (e.g., `nexchat.vercel.app`)
5. Click **"Save"**

⚠️ **Important**: `localhost` is already authorized for development.

## Step 8: Run the Application

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The app should now connect to your Firebase project.

## Testing Authentication

1. Open the app in your browser
2. Click **"Sign in with Google"**
3. Select your Google account
4. You should be redirected to the chat page

## Troubleshooting

### "Firebase config missing keys" Warning

- **Cause**: Environment variables not set
- **Solution**: Check `.env.local` file exists and contains all required keys

### "Permission denied" Errors

- **Cause**: Firestore Security Rules blocking access
- **Solution**: Verify security rules match the configuration above

### "Unauthorized domain" Error

- **Cause**: Domain not in Authorized Domains list
- **Solution**: Add your domain to Firebase Authentication settings

### Google Sign-In Popup Blocked

- **Cause**: Browser popup blocker
- **Solution**: Allow popups for your domain, or use redirect sign-in

## Firestore Data Structure

After using the app, your Firestore will have this structure:

```
users/
  {userId}/
    uid: string
    email: string
    displayName: string
    photoURL: string
    createdAt: timestamp

rooms/
  {roomId}/
    id: string
    name: string
    description: string
    createdBy: string
    createdAt: timestamp
    members: [string]

    messages/
      {messageId}/
        id: string
        text: string
        userId: string
        userName: string
        timestamp: timestamp
        replyTo: string (optional)
```

## Optional: Enable Firebase Storage (for media)

If you want to enable image/file uploads:

1. In Firebase Console, click **"Storage"** in the left sidebar
2. Click **"Get started"**
3. Choose production mode
4. Update security rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    match /rooms/{roomId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## Next Steps

- [Environment Variables](./environment.md) — Learn about all available environment variables
- [Deployment](../development/deployment.md) — Deploy your NexChat instance
- [Testing](../development/testing.md) — Run tests to verify setup
