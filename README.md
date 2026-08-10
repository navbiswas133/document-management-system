# Document Management System (DOCURA)

A React frontend for a document management product — login, dashboard, document search/upload, and a separate admin area. Built as part of an interview submission.

**Stack:** React 19 · Vite 8 · Redux Toolkit · React Router · Axios · CSS Modules

## Project structure

```
document-management-system/
├── .env.development         # Local dev (Vite proxy) — for development only
├── .env.production          # API config for reviewers (committed)
├── public/
│   └── branding/            # Logo, favicon
├── src/
│   ├── app/                 # Routes, providers, toasts
│   ├── components/          # Layout, auth guards, shared UI
│   ├── constants/           # Branding, admin auth config
│   ├── features/            # auth · dashboard · documents · admin
│   ├── lib/                 # Axios client, API helpers
│   ├── store/               # Redux (auth)
│   ├── styles/              # Global CSS
│   └── test/                # Test setup, helpers, Axios mocks
├── index.html
├── vite.config.js           # Dev proxy for API + S3; Vitest config
├── playwright.config.js     # Playwright E2E (webServer + test dir)
├── tests/e2e/               # Playwright specs
├── eslint.config.js
├── package.json
└── package-lock.json
```

Page components live in `src/features/`. Each feature uses co-located `*.module.css` where needed.

---

## Quick start (for reviewers)

```bash
npm install
npm run serve-production
```

Open **http://localhost:4173** (Vite preview after build).

**Use only `.env.production`** — it is already set in the repo. Do not create or edit other env files.

---

## How to test the app

### User login (real backend)

1. Go to `/login`
2. Enter any valid mobile number (not the admin number below)
3. Request OTP → backend sends SMS
4. Enter the OTP from SMS
5. You land on `/dashboard` with full document features

### Admin login (static / demo only)

For quick admin access without SMS, use the hardcoded credentials in `src/constants/adminAuth.js`:

| | |
|---|---|
| Mobile | `8839154808` |
| OTP | `123456` |

1. Enter the mobile above on `/login`
2. Tap send OTP (no API call is made for this number)
3. Enter OTP `123456`
4. You land on `/admin` (user creation UI)

> Admin login is client-side only — for demo/testing. Normal users always go through the real OTP APIs.

---

## What is implemented

<details>
<summary><strong>Authentication & access</strong></summary>

- Mobile + 6-digit OTP login UI
- Real backend auth: `POST /generateOTP`, `POST /validateOTP`
- Token stored in Redux + `localStorage`; sent as `token` header on document APIs
- Route guards: user routes (`/dashboard`, `/documents`) vs admin route (`/admin`)
- Static admin login branch (see table above)

</details>

<details>
<summary><strong>Dashboard</strong> (`/dashboard`)</summary>

- Summary stat cards
- Recent documents list
- Top tags chart
- Quick links to documents and upload

</details>

<details>
<summary><strong>Documents</strong></summary>

| Page | What it does |
|------|----------------|
| `/documents` | Search (debounced 400 ms), filters (category, 2 tags, date range), pagination, ZIP download of results |
| `/documents/upload` | Upload PDF/JPG/PNG (max 10 MB), categories, tag autocomplete, remarks |
| `/documents/:id` | Metadata, PDF/image preview, single-file download |

Backend: `searchDocumentEntry`, `documentTags`, `saveDocumentEntry`

</details>

<details>
<summary><strong>Admin</strong> (`/admin`)</summary>

- User creation form (username + password)
- Client-side validation only — **API not connected yet** (shows success toast after validation)

</details>

<details>
<summary><strong>UI & UX</strong></summary>

- Responsive layout (sidebar, mobile bottom nav, collapsible filters)
- Custom dropdown/select components
- Toast notifications (Sonner) + global API error handling

</details>

---

## What is not implemented yet

<details>
<summary><strong>Pending / out of scope for this submission</strong></summary>

- Admin user creation API integration
- Production-grade admin auth (currently hardcoded mobile/OTP)
- `/verify-otp` route (redirects to `/login`)
- Deployment config (no Dockerfile / Vercel / Netlify files)

</details>

---

## Testing

Automated tests use **Vitest**, **React Testing Library**, and **Playwright**. They do **not** call the real backend, use real OTPs, or use real credentials.

### Unit and component tests

React components are tested with Vitest + React Testing Library + jsdom.

| Area | Location |
|------|----------|
| Login | `src/features/auth/__tests__/LoginPage.test.jsx` |
| Documents UI | `src/features/documents/__tests__/` |
| Admin UI | `src/features/admin/__tests__/AdminUserCreationPage.test.jsx` |

```bash
npm test          # Vitest watch mode
npm run test:run  # Single run (CI-friendly)
```

### API / service tests (mocked)

Auth and document API modules are tested against a **mocked Axios client** — no network requests.

| Area | Location |
|------|----------|
| Auth APIs | `src/features/auth/__tests__/authApi.test.js` |
| Document APIs | `src/features/documents/__tests__/documentsApi.test.js` |

Shared mock helpers: `src/test/mockApiClient.js`, `src/lib/__mocks__/axios.js`

```bash
npm run test:run
```

### Playwright E2E tests (intercepted APIs)

End-to-end tests run in a real browser. Playwright starts the Vite dev server automatically and **intercepts** document-management API requests with test-only responses (Generate OTP, Validate OTP, Search Documents). No real backend is contacted.

| Test | Location |
|------|----------|
| Login → Dashboard → Documents | `tests/e2e/login-documents.spec.js` |

First-time setup (if browsers are not installed):

```bash
npx playwright install chromium
```

```bash
npm run test:e2e
```

### Build verification

```bash
npm run build
```

### Full verification (recommended before review)

```bash
npm run test:run
npm run test:e2e
npm run build
```

---

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/login` | Public | Login |
| `/dashboard` | User | Dashboard |
| `/documents` | User | Search & list |
| `/documents/upload` | User | Upload |
| `/documents/:id` | User | Document details |
| `/admin` | Admin | Create user (UI only) |

---

## API overview

Base URL: `VITE_API_BASE_URL` · Client: Axios (`src/lib/axios.js`)

| Action | Method | Endpoint | Auth |
|--------|--------|----------|------|
| Send OTP | POST | `/generateOTP` | No |
| Verify OTP | POST | `/validateOTP` | No |
| Search documents | POST | `/searchDocumentEntry` | `token` header |
| Tag suggestions | POST | `/documentTags` | `token` header |
| Upload file | POST | `/saveDocumentEntry` | `token` header |

---

## Environment setup

| File | Who uses it |
|------|-------------|
| `.env.production` | **Reviewers** — run `npm run serve-production` (pre-configured, do not change) |
| `.env.development` | Local dev only — `npm run serve-development` (Vite proxy) |

Both files are in the repo. **Reviewers should only use `.env.production`** — no env edits needed.

`VITE_API_BASE_URL` is read in `src/lib/axios.js`.

---

## Project structure (detail)

<details>
<summary><strong>Full src/ tree</strong></summary>

```
src/
├── app/                  # Routes, providers, toasts
├── components/
│   ├── auth/             # Route guards (user / admin)
│   ├── layout/           # AppLayout, Header, Sidebar, MobileNav
│   └── ui/               # CustomSelect (dropdowns)
├── constants/            # Branding, adminAuth
├── features/
│   ├── admin/            # AdminUserCreationPage
│   ├── auth/             # Login, OTP, auth API
│   ├── dashboard/        # Dashboard + data hooks
│   └── documents/        # Search, upload, details, APIs
├── lib/                  # Axios, retries, API helpers
├── store/                # Redux (auth slice)
├── styles/globals.css
├── App.jsx
└── main.jsx
```

</details>

---

## Scripts (for reviewers)

```bash
npm run serve-production   # Build with .env.production + preview (use this)
npm run lint               # ESLint
npm run test:run           # Unit, component, and API tests (mocked)
npm run test:e2e           # Playwright E2E (intercepted APIs)
npm run build              # Production build check
```

Other scripts for local development:

```bash
npm run serve-development   # Uses .env.development (dev server, port 5173)
```

---

## Tech stack (full list)

React 19 · Vite 8 · React Router 7 · Redux Toolkit · Axios · React Hook Form · Zod · Lodash · Sonner · fflate (ZIP) · CSS Modules · ESLint

JavaScript only (no TypeScript).

---

## Notes for reviewer

- Auth persists across refreshes via `localStorage` (`dms_auth`).
- Document search debounces input by 400 ms before calling the API.
- Admin session token is intentionally not attached to document API calls.
- Use **only** `.env.production` — already included; do not modify for review.
- `npm run serve-production` embeds `VITE_API_BASE_URL` from `.env.production` at build time.

---

## License

No LICENSE file in this repository.
