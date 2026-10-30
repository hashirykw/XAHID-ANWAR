# Sir Xahid Anwar · Digital Campus

O Level and IGCSE English Language (1123, 0500, 0510, 0511). Static multi-page site, no build step.

## Pages
| File | What it is |
|---|---|
| `index.html` | Home: about Sir, courses, all affiliations, explore, portal registration (opens WhatsApp) |
| `ai-checker.html` | AI paper checker: how it works, sample marked answer, locked checker for registered students |
| `portal.html` | Student portal: sign in, dashboard with notes, lectures, papers and results |
| `past-papers.html` | Past papers with mark scheme side by side, timed lock mode, XA practice papers, attempt log |
| `books.html` | Reading and Writing Handbooks, Rs 5,000 set, order form (opens WhatsApp) |

## Folders
- `assets/css/base.css` shared styles; one stylesheet per page (`home`, `ai`, `portal`, `papers`, `books`)
- `assets/js/main.js` shared nav, menu panel, search (Ctrl K), sound effects, chat assistant, form helpers; one script per page
- `assets/img/` photos, mascot and logo (SVG), `logos/` affiliations, `books/` covers
- `practice/` XA practice papers and mark schemes (original, printable)

## Settings to know
- WhatsApp number: `WA` in `assets/js/main.js`
- Timed-mode exit phrase and Sir's override key: `PHRASE` and `MAGIC` in `assets/js/papers.js`
- Past-paper source: `SRC` in `assets/js/papers.js`

Portal sign-in, AI marking and student data are front end only until the backend (Supabase + a server function for the AI) is connected.

Designed and built by Nexlyr Solutions.
