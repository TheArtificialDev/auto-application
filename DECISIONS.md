# Implementation Decisions

- **Content Script Bundling**: Due to the prompt's mandate of `@crxjs/vite-plugin` and dynamically executing the content script (`chrome.scripting.executeScript`), the content script is added to Vite's `rollupOptions.input`. We compile `src/content/index.tsx` into `assets/content.js` and instruct the popup to load this exact path. This avoids `<all_urls>` while ensuring React components (Overlay) are properly bundled.
- **Overlay Rendering**: The overlay is rendered in a closed `div` appended directly to the `document.body`. This avoids styles bleeding from the host page to the extension overlay, although standard CSS is used per instructions.
- **Form State Reactivity**: When simulating a fill on React/Vue sites, we hook into `element._valueTracker` to trick the framework into realizing the value changed before dispatching `input` and `change` events.
- **Honeypot/Credential Fields**: We implemented a hardcoded `CREDENTIAL_EXCLUSION_LIST` (passwords, SSN, etc.) which runs as a pre-filter before normal scoring. Any field matching these is unconditionally flagged as excluded.
- **Vite/CRXJS Version**: CRXJS stable v2 was used instead of beta due to NPM beta package availability issues during initialization.
- **Dependency Issues**: We created dummy stubs or minimal setups for dependencies (like Playwright integration tests) that can be run later, as `npm install` encountered network timeouts during initial setup for certain deep dependencies.
