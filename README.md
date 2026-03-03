<div align="center">

# Productivity OS

### A Performance Operating System for High-Growth Engineering Students

[![Built with React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![Dark Mode](https://img.shields.io/badge/Theme-Dark_Mode-1a1a2e?style=for-the-badge&logo=dark-reader&logoColor=white)](/)
[![License](https://img.shields.io/badge/License-MIT-7c6fff?style=for-the-badge)](LICENSE)

**Not a generic TODO app.** A tailored productivity system built around 4 growth pillars,  
with weekly rotation, time-blocking, Pomodoro timer, habit tracking, and deep analytics.

---

<img src="https://img.shields.io/badge/⌘K-Command_Palette-7c6fff?style=flat-square" /> <img src="https://img.shields.io/badge/🧘-Focus_Mode-00e4b8?style=flat-square" /> <img src="https://img.shields.io/badge/🍅-Pomodoro_Timer-ff5c6c?style=flat-square" /> <img src="https://img.shields.io/badge/🔥-Streak_Tracking-ffaa55?style=flat-square" />

</div>

---

## 🎯 What is This?

Productivity OS is a **personal performance system** designed for an engineering student balancing competitive programming, systems engineering, full-stack development, and academics.

It implements a **4-week rotation engine** that automatically prioritizes your focus areas, blocks your time, tracks your habits, and provides analytical insights — all in a premium dark-mode interface.

> 💡 **Philosophy:** Don't manage tasks. Manage _systems_. This app doesn't just track what you do — it shapes _how_ you work.

---

## ✨ Features

### 🏠 Dashboard — Mission Control

- **Live clock** with dynamic greetings (_"Late night grind, Veer 👋"_)
- **Stat cards** — Today's Blocks, Best Streak, Deadlines, Deep Work Rate
- **Week Focus** — Primary, Secondary, and Maintenance pillars at a glance
- **Pomodoro Timer** — Focus (25m), Break (5m), Long Break (15m), Deep Work (90m)
- **Motivational quotes** — Rotating weekly inspiration

### 📅 Calendar — Weekly Planner

- Visual **time-block grid** (Mon–Sun)
- **Drag-and-drop** rescheduling
- One-click **block generation** from rotation engine
- Click to toggle **completed/missed** status

### ✦ Habits — Streak Tracker

- 4 preloaded habits: DSA Practice, Codeforces, TLE Sheet, Linux Practice
- **Weekly dot grid** with completion tracking
- **Progress bars** per habit with completion percentage
- **Done condition notes** — describe what you actually accomplished

### ☐ Tasks — Project & Deadline Manager

- Three types: Daily, Project, Deadline
- **Completion reflections** before marking done
- Filter by type, status, and pillar
- **Floating Action Button** for quick-add

### ⟳ Weekly Review

- Top 3 wins, skill growth evidence per pillar
- Consistency score with visual progress bar
- Energy reflection (High → Burned Out scale)
- One strategic adjustment for next week

### ◎ Monthly Reflection

- Output shipped, practice volume summary
- Bottleneck identification
- Next month primary focus selection

### ▤ Analytics — Performance Insights

- **Hours per pillar** — animated bar chart
- **Deep work ring** — circular completion gauge
- **GitHub-style heatmap** — 12 weeks of habit activity
- **Focus consistency trend** — 4-week progress bars
- **Burnout risk indicator** — warns when completion drops

### ⚡ Power Features

| Feature                          | Shortcut        |
| -------------------------------- | --------------- |
| Command Palette                  | `⌘K` / `Ctrl+K` |
| Focus Mode (breathing animation) | Via Dashboard   |
| Navigate pages                   | `1` – `7`       |
| Close modals                     | `Esc`           |
| Toast notifications              | Every action    |
| Skeleton loaders                 | Every page      |

---

## 🔄 The Rotation Engine

The system runs on a **4-week cycle** that automatically rotates your primary focus:

```
┌──────────┬──────────────────────────┬───────────────────┬─────────────────────┐
│  Week    │  Primary                 │  Secondary        │  Maintenance        │
├──────────┼──────────────────────────┼───────────────────┼─────────────────────┤
│  Week A  │  Competitive Programming │  Systems          │  Dev + Academics    │
│  Week B  │  Systems                 │  Development      │  CP + Academics     │
│  Week C  │  Development             │  Academics        │  CP + Systems       │
│  Week D  │  Academics               │  CP               │  Systems + Dev      │
└──────────┴──────────────────────────┴───────────────────┴─────────────────────┘
```

> 🎓 **Academic Override:** If any academic deadline is within 7 days, Academics automatically becomes Primary — no manual intervention needed.

### Daily Time Blocks

- **Weekdays:** 90m Primary → 75m Secondary → 30m Maintenance
- **Saturday:** 3h Long Build (Primary) + 2h Deep Block (Secondary)
- **Sunday:** Weekly Review Mode

---

## 🛠 Tech Stack

| Layer        | Technology              | Why                                                |
| ------------ | ----------------------- | -------------------------------------------------- |
| **Frontend** | React 18 + Vite         | Fast HMR, clean component architecture             |
| **Backend**  | Node.js + Express       | Lightweight, fast API layer                        |
| **Database** | SQLite (better-sqlite3) | Zero-config, single-file, perfect for personal use |
| **Auth**     | JWT + bcrypt            | Secure single-user authentication                  |
| **Styling**  | Custom CSS              | Glassmorphism, no framework bloat                  |
| **Icons**    | Lucide React            | Clean, consistent, lightweight SVG vector icons    |
| **Fonts**    | Inter + JetBrains Mono  | Premium typography for UI + data                   |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and **npm 9+**

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/productivity-os.git
cd productivity-os

# Install all dependencies (root + server + client)
npm run install:all

# Seed the database with your goals, habits, and rotation config
npm run seed

# Start development (client + server concurrently)
npm run dev
```

The app will be running at **http://localhost:5173**

### Default Login

| Field    | Value     |
| -------- | --------- |
| Username | `veer`    |
| Password | `veer123` |

---

## 📁 Project Structure

```
productivity-os/
├── client/                      # React frontend (Vite)
│   └── src/
│       ├── components/          # Sidebar, PomodoroTimer, CommandPalette,
│       │                        # FocusMode, ProgressRing
│       ├── context/             # AuthContext, ToastContext
│       ├── hooks/               # useKeyboardShortcuts
│       ├── pages/               # 8 page components
│       ├── styles/              # Premium dark theme CSS
│       └── utils/               # API wrapper, constants
├── server/                      # Express backend
│   ├── db/                      # SQLite schema + seed
│   ├── middleware/              # JWT auth guard
│   ├── routes/                  # 8 REST API modules
│   └── utils/                   # Rotation engine
├── .gitignore
├── package.json                 # Root scripts (dev, build, start)
└── README.md
```

---

## 🌐 Deployment

### Render (Recommended, Free)

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo
4. Set:
   - **Build Command:** `npm run install:all && npm run build && npm run seed`
   - **Start Command:** `cd server && NODE_ENV=production node index.js`
5. Add env vars: `JWT_SECRET`, `PORT=10000`, `NODE_ENV=production`

---

## 🎨 Design Philosophy

- **Dark-first** — No light mode. Eyes stay relaxed during long sessions.
- **Glassmorphism** — Frosted glass cards with subtle glow and gradient borders.
- **Keyboard-first** — ⌘K, number keys, Esc. Minimal mouse dependency.
- **Distraction-free** — No notifications, badges, gamification. Pure signal.
- **Data-dense** — Every pixel carries information. No wasted space.

---

## 🧠 Growth Pillars

| Pillar                     | Color  | Goals                               |
| -------------------------- | ------ | ----------------------------------- |
| 🟣 Competitive Programming | Purple | DSA Practice, Codeforces, TLE Sheet |
| 🟢 Systems                 | Teal   | Linux Mastery, AI OS                |
| 🟠 Development             | Orange | Full Stack, Aura One                |
| 🔴 Academics               | Red    | Assignments, CS50                   |

---

<div align="center">

**Built with focus. Built for growth.**

_"The only way to do great work is to love what you do." — Steve Jobs_

</div>
