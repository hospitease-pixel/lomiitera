# TapNix Deployment Guide

## 1. Vercel Deployment

### Fixing the Blank White Screen
If you see a blank screen after deployment:

1. **Check Browser Console**: Open your website, right-click anywhere, and select **Inspect** -> **Console**. If you see errors about "404 index.html not found", it means Vercel's pathing is wrong.
2. **Vercel Project Settings**:
   - Go to your **Vercel Dashboard**.
   - Select your project -> **Settings** -> **General**.
   - **Framework Preset**: Ensure it is set to **Vite** (not "Other").
   - **Root Directory**: Ensure this is set to `./` (the root of your GitHub repo).
   - **Output Directory**: Ensure this is set to `dist`.
3. **Environment Variables**:
   - Ensure `GEMINI_API_KEY` is added to **Settings** -> **Environment Variables**.
4. **Redeploy**: After making these changes, go to the **Deployments** tab and click **Redeploy** on the latest build.

### GEMINI_API_KEY Location
The `GEMINI_API_KEY` is **not** written directly into your code for security reasons. Instead, the code looks for it in your "Environment Variables".
1. Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) to get your key.
2. Copy it.
3. Paste it into Vercel's **Environment Variables** settings under the name `GEMINI_API_KEY`.

## 2. Firebase Configuration
Make sure your `firebase-applet-config.json` is correct and you have deployed your Firestore rules using `firebase deploy --only firestore`.
