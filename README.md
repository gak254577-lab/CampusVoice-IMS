# 📣 CampusVoice | Student & Grievance Portal

> **Empowering IMS Engineering College Students to make their voices heard, resolving grievances systematically with intelligent diagnostics.**

---

[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Firebase](https://img.shields.io/badge/Firebase_Firestore-Enabled-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Express Server](https://img.shields.io/badge/Express_Server-Proxy_Setup-000000?style=flat-square&logo=express)](https://expressjs.com)

CampusVoice is a highly modern, responsive grievance lodgement and support management system built for the students of **IMS Engineering College (IMSEC)**. It bridges the gap between student issues (facilities, academics, Wi-Fi, hostel, administration) and the resolution committee through transparent real-time state tracking, interactive statistics, and local/production authentication.

---

## 🛠 Features

- 🔐 **Dual Mode Authentication**: Instant developer sandbox access (LocalStorage-hydrated mock authorization) or Google OAuth authentication.
- 📊 **Dynamic Statistics Dashboard**: Beautiful real-time statistics powered by interactive visual charts.
- 📑 **Comprehensive Ticket Center**: Clear tracking of "My Tickets" and college-wide concerns.
- ⚡ **Local & production stability**: Deterministic fallback modes allowing smooth usage both inside Cloud containers and static serverless contexts.

---

## 📂 Project Architecture

```
├── .env.example                # Templates for local variables
├── firestore.rules             # Production database permissions 
├── index.html                  # Core single-page canvas setup
├── package.json                # Project dependencies and script runner
├── server.ts                   # Backend proxy, Vite listener, and Gemini API proxy
├── src/
│   ├── main.tsx                # Mount engine
│   ├── App.tsx                 # Core UI view & state layout
│   ├── firebase.ts             # Auth & Firestore connection handlers
│   ├── types.ts                # Strict TypeScript declaration types
│   └── components/             # Sub-component architecture
│       ├── GlowBackground.tsx  # Interactive glowing grid aesthetics
│       ├── GoogleChart.tsx     # Clean data presentations
│       ├── NotificationToast.tsx # Multi-variant animated status notifications
│       ├── RingCursor.tsx      # Stylized accent reticle
│       └── SkeletonLoader.tsx  # Dynamic mock content layout skeleton
```

        console.warn("Express backend API offline or unreachable (Netlify/Vercel static host). Local analysis fallback activated:", geminiErr);
      }
```

## ⚙️ Running Locally

### Prerequisites
- Node.js installed on your machine.
- A Firebase/Firestore config configured inside `/src/firebase.ts`.

### Steps
1. Navigate to the project root:
   ```bash
   cd campusvoice
   ```
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your keys (if applicable):
   ```bash
   cp .env.example .env
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Build the application for production:
   ```bash
   npm run build
   ```
