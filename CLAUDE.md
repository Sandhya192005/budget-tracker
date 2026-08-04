# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — production build (`vite build`)
- `npm run lint` — run ESLint over the whole project (`eslint .`)
- `npm run preview` — preview the production build locally

There is no test suite and no test runner configured in this project.

## Architecture

This is a client-only React + TypeScript + Vite + Tailwind app (bolt.new `bolt-vite-react-ts` template) with **no backend** — everything is persisted to `localStorage` via `src/lib/storage.ts`. There is no Supabase/API layer despite the auth-shaped return types (`{ data, error }`); that shape is just mimicking a real backend client for future portability.

### Data flow

`src/lib/storage.ts` is the single source of truth for persistence. It defines the core domain types (`User`, `Category`, `Transaction`, `Budget`) and raw CRUD functions that read/write JSON blobs under fixed `localStorage` keys (`budget_tracker_users`, `budget_tracker_transactions`, etc.). Passwords are stored in plaintext in a separate `budget_tracker_passwords` key — this is a demo-only auth scheme, not real security.

Two React contexts sit on top of storage.ts and are the only things components should talk to:
- `src/context/AuthContext.tsx` — `signUp`/`signIn`/`signOut`, exposes `user`/`loading` via `useAuth()`.
- `src/context/DataContext.tsx` — categories/transactions/budgets CRUD, exposes state + mutators via `useData()`. Every mutator (`addTransaction`, `updateTransaction`, `setBudget`, etc.) calls `refresh()` afterward to resync all three collections from storage rather than patching local state optimistically.

`DataProvider` is mounted only after a user is authenticated (see `src/App.tsx`), and lazily seeds a new user's categories via `createDefaultCategories` on first `refresh()` if none exist yet.

### Component structure

- `src/App.tsx` — top-level auth gate: shows `AuthForm` when logged out, otherwise wraps `Dashboard` in `DataProvider` + `Layout`.
- `src/components/Auth/` — sign in/up form, uses `AuthContext` directly.
- `src/components/Layout/` — `Layout` (page chrome) and `Header`.
- `src/components/Dashboard/` — `Dashboard` composes `DashboardStats`, `BudgetOverview`, `SpendingChart` (Recharts), and `TransactionList`; owns the "editing transaction" modal state and passes transactions down as props (no per-component data fetching).
- `src/components/Transactions/` — `TransactionList` (display) and `TransactionModal` (add/edit form, uses `react-hook-form`), both driven by `useData()`.

New features that touch persisted data should add functions to `storage.ts` first, then thread them through `DataContext`/`AuthContext` — components should never call `localStorage` or `src/lib/storage.ts` directly.

### Styling & icons

Tailwind CSS for all styling; icons from `lucide-react` exclusively (per `.bolt/prompt`, avoid pulling in other icon/UI libraries unless there's a strong need). Currency is fixed to `'INR'` on new users (`User.currency` in storage.ts).
