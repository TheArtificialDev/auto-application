# Manual QA Checklist

### Setup
1. Run `npm run build` to generate the `dist` folder.
2. Open Chrome and go to `chrome://extensions/`.
3. Enable "Developer mode".
4. Click "Load unpacked" and select the `dist` folder.
5. Open the extension options page and populate a test profile.

### Test Cases
- **Greenhouse Form (e.g., https://boards.greenhouse.io/)**
  - [ ] Click the extension icon and run autofill.
  - [ ] Verify First Name, Last Name, Email, Phone are filled correctly.
  - [ ] Verify the "Resume" file input is NOT filled but highlighted in the review panel.
  - [ ] Verify any EEO or voluntary disclosure fields are untouched.

- **Lever Form (e.g., https://jobs.lever.co/)**
  - [ ] Click autofill.
  - [ ] Verify standard fields are populated.
  - [ ] Ensure no submit buttons were clicked automatically.

- **Workday Form (Complex)**
  - [ ] Navigate to the Workday experience entry page.
  - [ ] Click autofill.
  - [ ] Verify custom comboboxes (like Country code or State) are selected correctly if they appear in standard Workday format.
  - [ ] Verify "Add another" group expansion stops after 5 entries if applicable.

- **Reversibility**
  - [ ] On any form, click "Undo" next to a filled field in the review panel.
  - [ ] Verify the field's value is cleared and the green border is removed.
