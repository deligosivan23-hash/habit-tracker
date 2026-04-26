# Obsidian — Habit Tracker PWA

A bold, atmospheric habit tracker built with React 18 + TypeScript + Tailwind CSS + Framer Motion. Fully offline-capable PWA.

## Stack

- **React 18** + TypeScript (Vite)
- **Tailwind CSS** with custom Obsidian design system
- **Framer Motion** for page/card animations
- **Zustand** + localStorage persistence (no backend)
- **Recharts** for analytics charts
- **vite-plugin-pwa** + Workbox for offline support
- **React Router v6** for navigation

## Features

- ✅ Checklist and Timed habit types (or both)
- ⏱ **Multi-timer system** — run multiple independent timers simultaneously
  - Each timer: idle → running → paused → stopped state machine
  - Paused timers persist through page refresh
  - Persistent bottom tray shows all active/paused timers
- 📊 Analytics with weekly/monthly/yearly views
  - Completion rates, streaks, time logged, missed days
  - GitHub-style activity heatmap
  - Per-habit breakdown with progress bars
- 📱 Mobile-first, installable PWA (works fully offline)
- 🌑 Obsidian dark theme — rich atmospheric backgrounds, amber accents

## Getting Started

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Import the repo in Vercel
3. Vercel auto-detects Vite — hit Deploy

## PWA Icons

Replace `public/icons/icon-192.png` and `public/icons/icon-512.png` with production-quality icons.
Use [pwa-asset-generator](https://github.com/elegantapp/pwa-asset-generator) or [realfavicongenerator.net](https://realfavicongenerator.net).

## Design System

| Token | Value |
|---|---|
| Background | `#080C14` |
| Surface | `#0D1420` |
| Accent | `#F0A500` |
| Font Display | DM Serif Display |
| Font Body | DM Sans |
| Font Mono | DM Mono |
