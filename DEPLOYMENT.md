# 📋 Quick Deployment Guide

## 🚀 Deploy StudyVerse to Vercel with GitHub

### **Step 1: Push to GitHub**

1. **Create GitHub Repository**

   - Go to [GitHub.com](https://github.com) → Create new repository
   - Name it "studyverse" or any name you prefer
   - Don't initialize with README (we already have files)

2. **Connect Local Project to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/studyverse.git
   git branch -M main
   git push -u origin main
   ```

### **Step 2: Deploy with Vercel**

1. **Connect GitHub to Vercel**

   - Go to [Vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your StudyVerse repository

2. **Configure Environment Variables**

   - In Vercel project settings → Environment Variables
   - Add these variables (get values from your `.env.local`):
     ```
     GOOGLE_GENAI_API_KEY=your_api_key_here
     NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
     NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
     ```

3. **Deploy**
   - Click "Deploy" button
   - Wait for build to complete (~2-3 minutes)
   - Get your live URL: `https://studyverse-xxx.vercel.app`

### **Step 3: Update Firebase Settings**

1. **Add Production Domain**

   - Firebase Console → Authentication → Settings
   - Add your Vercel URL to "Authorized domains"

2. **Test Your Live App**
   - Visit your Vercel URL
   - Sign in with Google
   - Create a study set
   - Verify data persistence

## ✅ Continuous Updates

**From now on, every time you:**

- Make code changes locally
- Commit: `git add . && git commit -m "Update feature"`
- Push: `git push`

**Vercel will automatically:**

- Build your changes
- Deploy to production
- Update your live URL

## 🔄 Development Workflow

1. **Local Development**

   ```bash
   npm run dev  # Test locally at localhost:3000
   ```

2. **Deploy Changes**

   ```bash
   git add .
   git commit -m "Add new feature"
   git push
   ```

3. **Live in ~30 seconds** at your Vercel URL!

## 🛠️ Quick Commands

```bash
# Start local development
npm run dev

# Build for production
npm run build

# Deploy manually (if needed)
vercel --prod

# Check deployment status
vercel ls
```

Your StudyVerse SaaS platform is now live and will automatically update with every code change! 🎉
