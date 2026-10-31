# Sir Xahid Anwar · Digital Campus

O Level and IGCSE English Language (1123, 0500, 0510, 0511). Static multi-page site, no build step.

## Pages (clean URLs, no file names in the address bar)
Every page lives in its own folder as `index.html`, so the address is just the folder name.

| URL | File | What it is |
|---|---|---|
| `/` | `index.html` | Home: about Sir, courses, all affiliations, explore, portal registration (opens WhatsApp) |
| `/ai-checker` | `ai-checker/index.html` | AI paper checker: how it works, sample marked answer, locked checker for registered students |
| `/portal` | `portal/index.html` | Student portal: sign in, dashboard with notes, lectures, papers and results |
| `/past-papers` | `past-papers/index.html` | Past papers with mark scheme side by side, timed lock mode, XA practice papers, attempt log |
| `/books` | `books/index.html` | Reading and Writing Handbooks, Rs 5,000 set, order form (opens WhatsApp) |
| `/practice/...` | `practice/<paper>/index.html` | XA practice papers and mark schemes (original, printable) |
| any wrong link | `404.html` | Friendly not-found page |
| no internet | `offline.html` | Shown by the app when a page isn't saved yet |

`vercel.json` turns on clean URLs and redirects the old `.html` addresses to the new ones, so links shared before still work.
All paths inside the site are root-relative (`/assets/...`, `/books`), so every page works no matter how deep it sits.

## Assets (one job per file)
- `assets/css/base.css` shared styles (tokens, type, buttons, forms, nav, footer, modals)
- `assets/css/chat.css` the Ask Sir X assistant (loaded by `chat.js` itself)
- `assets/css/<page>.css` one stylesheet per page (`home`, `ai`, `portal`, `papers`, `books`)
- `assets/js/loader.js` preloader, self-contained. It only appears if a page takes longer than ~0.45 s to load, and its ring follows real loading progress
- `assets/js/main.js` shared behaviour: nav, menu, search (Ctrl K), sound effects, modals, motion buttons, dropdowns, form helpers
- `assets/js/chat.js` the assistant: builds its own markup, keeps the conversation while you move between pages, hands anything it can't answer to WhatsApp
- `assets/js/pwa.js` + `assets/css/pwa.css` the installable app: registers `sw.js` and shows the "Get the app" pop-up (one "Install the app" button: installs directly on Android/Chrome/Edge, opens the Share menu on iPhone since Apple only allows installing from there). It waits until the visitor has looked around, never covers the chat or a form, and stays away for 7 days after "Not now". The footer's "Get the app" link opens it any time
- `assets/js/steps.js` + `assets/css/steps.css` turn any `<form data-steps>` with `.fstep` groups into a short step-by-step form (progress bar, Next/Back, a tick on each finished field, confetti and a drawn tick when sent). Used by the registration, fee-slip and book order forms
- `assets/js/<page>.js` one script per page. `assets/js/slip.js` + `assets/css/slip.css` handle the fee card / transfer slip upload used by the home registration form ("Already at a campus") and the portal page. Set `ENDPOINT` in `slip.js` to the backend URL to start receiving slips; until then the upload is simulated and the file never leaves the phone
- `assets/img/` photos, mascot and logo (SVG), `logos/` affiliations, `books/` covers

## App and sharing
- `manifest.webmanifest` app name, colours, icons, home-screen shortcuts and install screenshots
- `sw.js` offline cache. Bump `VERSION` in it to clear every installed copy's cache
- `assets/img/og/` link-preview images (1200 × 630), one per page
- `favicon.ico`, `favicon.svg`, `assets/img/icon-*.png`, `apple-touch-icon.png` tab and home-screen icons
- `sitemap.xml` and `robots.txt` for Google

## Settings to know
- WhatsApp number: `WA` in `assets/js/main.js` (the assistant reads it from there)
- Assistant answers: `INTENTS` in `assets/js/chat.js`
- Affiliations shown on the home page: `affils` in `assets/js/home.js`
- Timed-mode exit phrase and Sir's override key: `PHRASE` and `MAGIC` in `assets/js/papers.js`
- Past-paper source: `SRC` in `assets/js/papers.js`
- Portal topics, notes and lectures: `topics`, `notes`, `lectures` in `assets/js/portal.js`. Topics are listed in syllabus order and notes and lectures are shown grouped topic by topic in that order
- Portal profile and rank: `profile`, `positions` and the classmates list `PEERS` in `assets/js/portal.js` are preview data. Stages (`STAGES`: Starter, Bronze 50%+, Silver 60%+, Gold 70%+, Platinum 80%+, Diamond 90%+) come from the average of approved tests. Profile photos are cropped to 320 px and kept on the device until Supabase storage is connected
- Course material protection (portal): notes and lectures black out when the app goes to the background, loses focus, or a screenshot or print shortcut is pressed; the student ID drifts across the lecture video the whole time it is open. A browser cannot stop a phone's own screenshot buttons, so the ID watermark is what traces a leaked copy

Portal sign-in, AI marking and student data are front end only until the backend (Supabase + a server function for the AI) is connected.

Designed and built by Nexlyr Solutions.
