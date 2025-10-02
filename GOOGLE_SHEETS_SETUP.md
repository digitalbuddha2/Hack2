# 📊 Google Sheets Backend Setup Guide

Follow these steps to set up Google Sheets as your hackathon app's backend.

## 🚀 Quick Setup (15 minutes)

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it: **"Airbnb Hackathon 2024 Database"**
4. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/1ABC123DEF456.../edit
                                      ↑ This part is your Sheet ID
   ```

### Step 2: Set up Google Apps Script
1. Go to [Google Apps Script](https://script.google.com)
2. Click **"New Project"**
3. Delete the default code
4. Copy and paste the entire contents of `google-apps-script.js` from this project
5. Replace `'your-google-sheet-id-here'` with your actual Sheet ID
6. Save the project (name it "Hackathon API")

### Step 3: Deploy the Script
1. In Google Apps Script, click **"Deploy"** → **"New Deployment"**
2. Choose **"Web app"** as the type
3. Settings:
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **"Deploy"**
5. Copy the **Web app URL** (looks like: `https://script.google.com/macros/s/ABC123.../exec`)

### Step 4: Initialize the Sheets
1. In Google Apps Script, click **"Run"** → **"initializeSheets"**
2. Grant permissions when prompted
3. Your Google Sheet now has 3 tabs: Users, Teams, Requests

### Step 5: Update React App
1. In `src/store/googleSheetsStore.ts`, replace:
   ```typescript
   const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
   ```
   With your actual Web app URL from Step 3

### Step 6: Switch to Google Sheets Store
Update your components to use the Google Sheets store instead of the mock store:

```typescript
// Replace this import in your components:
import { useStore } from '../store/useStore';

// With this:
import { useGoogleSheetsStore as useStore } from '../store/googleSheetsStore';
```

## 🎯 What This Gives You

### ✅ **Real Data Persistence**
- User registrations saved forever
- Teams persist across sessions
- No data loss on page refresh

### ✅ **Real-time Collaboration**
- Multiple users can join teams simultaneously
- Data syncs across all connected clients
- Live updates when teams fill up

### ✅ **Easy Management**
- View all data in familiar spreadsheet format
- Export data to CSV anytime
- Admins can edit data directly in sheets

### ✅ **Scalability**
- Handles 7,000+ users easily
- Google's infrastructure
- No server costs

## 📈 **Capacity & Performance**

**Google Sheets Limits:**
- ✅ **10 million cells** (easily handles 10K+ users)
- ✅ **Unlimited reads** for public sheets
- ✅ **100 requests/100 seconds** per user
- ✅ **Real-time updates** with multiple editors

**Expected Performance:**
- **Page load**: ~2-3 seconds (initial data fetch)
- **User registration**: ~1-2 seconds
- **Team joining**: ~1-2 seconds
- **Real-time sync**: ~3-5 seconds

## 🔧 **Testing Your Setup**

1. Open your React app
2. Register a new user
3. Check your Google Sheet - you should see the data appear!
4. Create a team
5. Have a friend join from another browser

## 🎨 **Sheet Structure**

### Users Sheet (Columns A-N):
- A: ID, B: Name, C: Email, D: Role, E: Department
- F: Skills, G: Interests, H: Experience, I: Bio
- J: GitHub, K: Slack, L: Looking for Team, M: Team ID, N: Registration Time

### Teams Sheet (Columns A-K):
- A: ID, B: Name, C: Description, D: Leader ID, E: Member IDs
- F: Max Members, G: Required Skills, H: Tags, I: Is Open
- J: Created At, K: Project Idea

### Requests Sheet (Columns A-F):
- A: ID, B: Team ID, C: User ID, D: Message, E: Status, F: Created At

## 🚨 **Important Notes**

1. **Make sheet publicly viewable** (but not editable) for read access
2. **Apps Script handles all writes** securely
3. **Test thoroughly** before your hackathon
4. **Have a backup plan** (export data regularly)

## 🔒 **Security**

- ✅ Apps Script runs server-side (secure)
- ✅ Sheet access controlled by Google permissions
- ✅ No API keys exposed in frontend
- ✅ CORS properly configured

Your hackathon app now has a real backend! 🎉