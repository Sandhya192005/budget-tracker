# Budget Tracker

A personal budget tracking app for logging income and expenses, setting category budgets, and visualizing spending trends.

## Features

- Sign up / sign in (demo auth, stored locally)
- Add, edit, and delete transactions with categories
- Dashboard with spending stats, a budget overview, and a spending chart
- Per-category monthly budgets with progress tracking
- Default categories seeded automatically for new users

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- Recharts (charts)
- react-hook-form
- lucide-react (icons)

## Getting Started

```
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Other scripts:

- `npm run build` — production build
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

## How Data Is Stored

This is a client-only app — there is no backend or database. All data (users, transactions, categories, budgets) is persisted to your browser's `localStorage`. This is a demo project, so passwords are stored in plaintext; don't reuse real credentials.

## Project Structure

```
src/
  components/
    Auth/         sign in / sign up form
    Layout/       page chrome, header
    Dashboard/    stats, budget overview, spending chart
    Transactions/ transaction list and add/edit modal
  context/         AuthContext, DataContext
  lib/storage.ts   localStorage persistence layer
```
