# ADR 004: Firebase as Backend

## Status

Accepted

## Context

NexChat required a backend for:

- User authentication (Google Sign-In)
- Real-time database (messages, rooms)
- Data persistence and synchronization
- Offline support
- Scalability without server management

We evaluated several backend options:

1. **Firebase** (Google Cloud)
2. **Supabase** (PostgreSQL-based)
3. **Custom Node.js/Express backend**
4. **AWS Amplify**
5. **Appwrite**

## Decision

We chose **Firebase** (Authentication + Firestore) as our backend.

## Consequences

### Positive

- ✅ **Real-time by default**: Firestore `onSnapshot` provides instant updates
- ✅ **No server management**: Fully managed serverless infrastructure
- ✅ **Authentication**: Built-in Google OAuth with minimal code
- ✅ **Offline support**: Firestore caches data locally, works offline
- ✅ **Scalability**: Handles millions of concurrent connections
- ✅ **Free tier**: Generous free tier sufficient for small to medium apps
- ✅ **SDK quality**: Well-documented, typed SDK for web

### Negative

- ⚠️ **Vendor lock-in**: Tied to Google Cloud platform
- ⚠️ **Query limitations**: Firestore queries are limited compared to SQL
- ⚠️ **Cost at scale**: Can become expensive at high read/write volumes
- ⚠️ **No joins**: Data modeling must be denormalized
- ⚠️ **Cold starts**: Cloud Functions (if used) have cold start latency

## Alternatives Considered

### Supabase

- **Rejected**: Less mature real-time features, SQL-based (we prefer NoSQL for chat)
- **When it makes sense**: Apps needing relational data, SQL queries, open-source alternative

### Custom Node.js/Express

- **Rejected**: Too much maintenance, no real-time out of the box, requires server hosting
- **When it makes sense**: Complex business logic, full control over infrastructure needed

### AWS Amplify

- **Rejected**: More complex setup, steeper learning curve, less intuitive for chat apps
- **When it makes sense**: Apps already in AWS ecosystem, enterprise requirements

### Appwrite

- **Rejected**: Smaller community, less mature real-time features
- **When it makes sense**: Self-hosted backend, privacy-focused applications

## Data Model

### Firestore Collections

```
rooms/
  {roomId}/
    - id: string
    - name: string
    - description: string
    - createdBy: string
    - createdAt: timestamp
    - members: array<string>

    messages/
      {messageId}/
        - id: string
        - text: string
        - userId: string
        - userName: string
        - timestamp: timestamp
        - replyTo: string (optional)

users/
  {userId}/
    - uid: string
    - email: string
    - displayName: string
    - photoURL: string
    - createdAt: timestamp
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Room members can read/write room data
    match /rooms/{roomId} {
      allow read: if request.auth != null && request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.createdBy;

      // Messages in rooms
      match /messages/{messageId} {
        allow read: if request.auth != null && get(/databases/$(database)/documents/rooms/$(roomId)).data.members.hasAny([request.auth.uid]);
        allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
        allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
      }
    }
  }
}
```

## Migration Path

If Firebase becomes unsuitable in the future:

1. Abstract all data access behind a repository pattern (already done)
2. Create a new backend (e.g., Supabase, custom API)
3. Implement the repository interface for the new backend
4. Swap the implementation via dependency injection
5. Gradually migrate data using Firebase export tools
