# 🚀 StudyVerse SaaS Setup Guide

## Overview

This guide will help you set up StudyVerse as a full-featured SaaS platform with user authentication, personal workspaces, and persistent data storage.

## 🔧 Prerequisites

1. **Node.js** (v18 or higher)
2. **Firebase Project**
3. **Google AI API Key**

## 📋 Setup Instructions

### 1. Firebase Setup

1. **Create a Firebase Project**

   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication**

   - In Firebase Console, go to "Authentication" > "Sign-in method"
   - Enable "Google" provider
   - Add your domain (localhost:3000 for development)

3. **Create Firestore Database**

   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" (for development)
   - Select a location

4. **Create Required Indexes**

   ⚠️ **IMPORTANT**: Firestore requires composite indexes for complex queries.

   **Option A - Auto-create (Recommended):**

   - Run your app and perform actions that trigger queries
   - Firebase will show error messages with index creation links
   - Click the provided links to auto-create required indexes

   **Option B - Manual creation:**

   - Go to "Firestore Database" > "Indexes" tab
   - Create these composite indexes:

     **studySets Collection:**

     - Fields: `userId` (Ascending), `lastAccessedAt` (Descending)

     **studySessions Collection:**

     - Fields: `userId` (Ascending), `startTime` (Descending)

     **notifications Collection:**

     - Fields: `userId` (Ascending), `createdAt` (Descending)

5. **Get Firebase Configuration**
   - Go to Project Settings (gear icon)
   - In "Your apps" section, click "Web" icon
   - Register your app
   - Copy the configuration object

### 2. Environment Configuration

1. **Copy Environment File**

   ```bash
   cp .env.example .env.local
   ```

2. **Update Environment Variables**

   ```env
   # Google AI API Key
   GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here

   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
   ```

### 3. Firebase Security Rules

**Firestore Rules** (`firestore.rules`):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read/write their own study sets
    match /studySets/{studySetId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Users can read/write their own study sessions
    match /studySessions/{sessionId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Users can read/write their own progress
    match /userProgress/{progressId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }

    // Users can read/write their own notifications
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## 🏗️ Architecture Overview

### **Database Schema**

#### Collections:

- **users** - User profiles and preferences
- **studySets** - User's study materials and content
- **studySessions** - Learning session tracking
- **userProgress** - Progress and achievements
- **notifications** - User notifications

#### Key Features:

- **Authentication**: Google OAuth with Firebase Auth
- **Data Persistence**: All user data saved to Firestore
- **Real-time Sync**: Changes sync across devices
- **Security**: Row-level security with Firestore rules
- **Scalability**: Firebase auto-scales with usage

### **User Flow**

1. **Landing Page** → Sign in with Google
2. **Dashboard** → View study sets and analytics
3. **Create Study Set** → Upload files and generate content
4. **Study** → Use flashcards, quizzes, chat
5. **Progress Tracking** → Analytics and achievements

### **Key Components**

- **AuthProvider** - Handles authentication state
- **DatabaseService** - Firestore operations
- **UserDashboard** - Main user interface
- **EnhancedDashboard** - Study interface
- **AuthPage** - Login/signup page

## 🔒 Security Features

- **Authenticated Access**: All data requires user authentication
- **Data Isolation**: Users can only access their own data
- **Secure Storage**: Firebase handles encryption and security
- **Privacy**: No data sharing between users

## 📊 Analytics & Tracking

- **Study Time**: Track time spent studying
- **Quiz Performance**: Accuracy and improvement
- **Progress Streaks**: Daily study streaks
- **Achievement System**: Unlock badges and rewards

## 🚀 Deployment Options

### **Option 1: Vercel (Recommended)**

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel --prod
   ```

4. **Set Environment Variables in Vercel Dashboard**

   - Go to your project in Vercel Dashboard
   - Click "Settings" → "Environment Variables"
   - Add all variables from your `.env.local`:
     - `GOOGLE_GENAI_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

5. **Update Firebase Auth Domain**

   - In Firebase Console → Authentication → Settings
   - Add your Vercel domain: `your-app.vercel.app`

6. **Continuous Deployment**
   - Connect your GitHub repository to Vercel
   - Every push to main branch will auto-deploy

### **Option 2: Netlify**

```bash
npm run build
# Deploy dist folder to Netlify
```

### **Option 3: Firebase Hosting**

```bash
npm run build
firebase deploy
```

## 📈 Scaling Considerations

### **Performance**

- Implement Firestore indexes for large collections
- Use Firebase Storage for file uploads
- Consider CDN for static assets

### **Features to Add**

- **Team Workspaces**: Collaborative study groups
- **Public Study Sets**: Share content with community
- **Subscription Tiers**: Premium features
- **Mobile App**: React Native version
- **Offline Support**: PWA capabilities

### **Monitoring**

- Firebase Analytics for user behavior
- Performance monitoring with Firebase Performance
- Error tracking with Sentry

## 🆘 Troubleshooting

### **Common Issues**

1. **Authentication Errors**

   - Check Firebase configuration
   - Verify domain in Firebase Auth settings
   - Ensure Google provider is enabled

2. **Index Errors** (Most Common)

   **Error**: `The query requires an index. You can create it here: https://console.firebase.google.com/...`

   **Solution**:

   - Click the provided link in the error message
   - Firebase will auto-create the required index
   - Wait 2-3 minutes for index to build
   - Refresh your app

   **Alternative**: Create indexes manually in Firebase Console > Firestore > Indexes

3. **Permission Denied**

   - Check Firestore security rules
   - Verify user is authenticated
   - Check data structure matches rules

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check environment variables
   - Verify all imports are correct

### **Support**

- Check Firebase Console for errors
- Review browser console for client-side issues
- Monitor Firestore usage and quotas

## 🎯 Next Steps

1. **Complete Firebase Setup** following this guide
2. **Test Authentication** with Google Sign-in
3. **Create First Study Set** to verify data flow
4. **Customize Branding** and styling
5. **Deploy to Production** when ready

This setup transforms StudyVerse from a local app into a full SaaS platform with user accounts, data persistence, and scalable architecture!
