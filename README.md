# 🌿 MacroTracker — Premium Nutrition Intelligence

A production-ready nutrition and macro tracking web app built with React, TypeScript, Vite, Tailwind CSS, and Firebase.

---

## ✨ Features

- 🔐 **Firebase Auth** — Sign up, login, logout, protected routes
- 📊 **Dashboard** — Daily calories, macros, progress bars, wellness score
- 🍽️ **Meal Logging** — Add meals with calories, protein, carbs, fat, meal type, and notes
- 📅 **Meal History** — Browse logs by date, edit or delete entries
- 🎯 **Daily Goals** — Personalised calorie and macro targets saved per user
- 📋 **Nutrition Report** — Protein score, metabolic score, body composition score, food quality score, and personalised recommendations
- 📱 **Mobile Responsive** — Clean layout across all screen sizes

---

## 🛠 Tech Stack

| Layer        | Tech                          |
|--------------|-------------------------------|
| Framework    | React 18 + TypeScript         |
| Build Tool   | Vite                          |
| Styling      | Tailwind CSS                  |
| Auth         | Firebase Authentication       |
| Database     | Firebase Firestore            |
| Hosting      | Firebase Hosting              |
| Icons        | Lucide React                  |
| Date Utils   | date-fns                      |

---

## 🚀 Getting Started

### 1. Clone or Download

```bash
git clone https://github.com/YOUR_USERNAME/macro-tracker.git
cd macro-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Firebase Project Setup

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → give it a name (e.g. `macro-tracker`) → click through
3. In the project dashboard, click **"</> Web"** to register a web app
4. Copy the `firebaseConfig` object shown — you'll need those values

#### Enable Authentication

1. In Firebase Console → **Authentication** → **Get Started**
2. Under **Sign-in method**, enable **Email/Password**

#### Enable Firestore

1. In Firebase Console → **Firestore Database** → **Create database**
2. Start in **production mode**
3. Choose a region close to your users (e.g. `us-central`)

#### Deploy Firestore Security Rules

After setting up the Firebase CLI (step 5 below):

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Or paste the contents of `firestore.rules` manually in Firebase Console → Firestore → Rules tab.

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase config values:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📦 Build for Production

```bash
npm run build
```

Output goes to the `dist/` folder.

---

## 🔥 Deploy to Firebase Hosting

### Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Login

```bash
firebase login
```

### Initialise Firebase (first time only)

```bash
firebase init
```

Select:
- ✅ **Hosting**
- ✅ **Firestore** (optional, to deploy rules)

When prompted:
- Public directory: `dist`
- Single-page app: **Yes**
- Overwrite `index.html`: **No**

### Deploy

```bash
npm run build
firebase deploy
```

Your app will be live at `https://YOUR_PROJECT_ID.web.app`

---

## 🐙 Upload to GitHub

### Create a new repo on GitHub

1. Go to [https://github.com/new](https://github.com/new)
2. Name it `macro-tracker`, set to Public or Private
3. Don't initialise with README (you already have one)

### Push your code

```bash
git init
git add .
git commit -m "Initial commit — MacroTracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/macro-tracker.git
git push -u origin main
```

> ⚠️ The `.env` file is in `.gitignore` and will never be committed. Keep your Firebase keys safe.

---

## 📁 Project Structure

```
macro-tracker/
├── public/
│   └── favicon.svg
├── src/
│   ├── context/
│   │   └── AuthContext.tsx     # Firebase auth state + helpers
│   ├── components/
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── MacroCard.tsx       # Calorie/macro stat cards
│   │   ├── ProgressBar.tsx     # Reusable progress bar
│   │   ├── AddMealForm.tsx     # Add/edit meal modal
│   │   ├── MealList.tsx        # Grouped meal list with edit/delete
│   │   ├── DailyGoals.tsx      # Collapsible goals editor
│   │   └── NutritionPanel.tsx  # Full nutrition report panel
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── Dashboard.tsx       # Main app page
│   ├── firebase.ts             # Firebase initialisation
│   ├── types.ts                # TypeScript interfaces
│   ├── App.tsx                 # Router + auth guards
│   ├── main.tsx
│   └── index.css               # Tailwind + global styles
├── firebase.json               # Firebase Hosting config
├── firestore.rules             # Firestore security rules
├── firestore.indexes.json      # Firestore composite indexes
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
├── .env.example
└── .gitignore
```

---

## 🎨 Design Language

- **Typography**: Cormorant Garamond (display) + DM Sans (body)
- **Palette**: Deep emerald greens (`#022c22` → `#064e3b`) with gold accents (`#d4a017`)
- **Cards**: Frosted glass with subtle borders
- **Motion**: Staggered fade-in and slide-up animations

---

## 🔒 Security Notes

- Firestore rules ensure users can only access their own meals and goals
- Firebase Auth tokens are handled automatically by the Firebase SDK
- Never commit `.env` — it contains your secret API keys
- For production, consider enabling Firebase App Check

---

## 📄 License

MIT — free to use and modify.
