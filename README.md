# Job Application Auto-Fill Browser Extension

A production-grade Chrome Extension (Manifest V3) to autofill job applications, built with React 18, Vite, and CRXJS.

## Features
- **Deterministic Field Classification**: Uses a weighted scoring model matching `<label>`, `aria-label`, headings, and more against a canonical field taxonomy.
- **Privacy-First**: No external network calls, no analytics, no `chrome.storage.sync`. Everything runs entirely on your device.
- **Guardrails built-in**: Never submits forms, skips file uploads (resume/cover letter), and rigorously ignores passwords, SSNs, and EEO questions.
- **On-Page Review**: A floating overlay appears post-fill, allowing one-click undo or manual filling of low-confidence fields.

## Build and Install

1. Install dependencies:
   ```bash
   npm install
   ```
2. Build the extension:
   ```bash
   npm run build
   ```
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable **Developer mode** in the top right.
5. Click **Load unpacked** and select the generated `dist` folder.

## Testing

- Unit tests (Vitest): `npm test`
- Integration tests (Playwright): `npm run test:e2e`
- Guardrail strict linting: `npm run lint`

See `tests/MANUAL_QA.md` for manual testing instructions.
