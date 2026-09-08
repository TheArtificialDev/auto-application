import React from 'react';
import { createRoot } from 'react-dom/client';
import { detectFields } from './detector';
import type { FieldElement } from './detector';
import { fillField, mapCategoryToValue } from './filler';
import { storage } from '../utils/storage';
import { Overlay } from './overlay';
import type { UserProfile } from '../types/profile';

let overlayRoot: any = null;
let overlayContainer: HTMLElement | null = null;
const originalStyles = new Map<HTMLElement, string>();

function highlightField(el: HTMLElement, color: string) {
  if (!originalStyles.has(el)) {
    originalStyles.set(el, el.style.border || '');
  }
  el.style.border = `2px solid ${color}`;
}

function removeHighlight(el: HTMLElement) {
  if (originalStyles.has(el)) {
    el.style.border = originalStyles.get(el) || '';
    originalStyles.delete(el);
  }
}

function clearAllHighlights() {
  for (const el of Array.from(originalStyles.keys())) {
    removeHighlight(el);
  }
}

async function runAutofill(): Promise<number> {
  const profile = await storage.getProfile();
  if (!profile) {
    alert("Please set up your profile in the extension options first.");
    return 0;
  }

  const fields = detectFields();
  
  // Basic rate limit guardrail for repeated groups
  let newGroupsExpanded = 0;
  
  for (const field of fields) {
    const { category, confidence } = field.classification;
    const el = field.element;
    
    if (category.startsWith('excluded')) {
      // Guardrail: Never fill EEO/diversity or credential fields
      continue;
    }
    
    if (category === 'documents') {
      highlightField(el, '#0284c7');
      continue;
    }

    if (confidence === 'high') {
      const value = mapCategoryToValue(category, profile);
      if (value !== null && value !== '') {
        fillField(field, value);
        highlightField(el, '#16a34a');
      } else {
        // Value not in profile
        field.classification.confidence = 'unmatched';
      }
    } else if (confidence === 'low') {
      highlightField(el, '#d97706');
    }
  }

  renderOverlay(fields, profile);
  return fields.length;
}

// ... existing code ...

function renderOverlay(fields: FieldElement[], profile: UserProfile) {
  if (overlayContainer) {
    if (overlayRoot) {
      overlayRoot.unmount();
    }
    overlayContainer.remove();
  }

  overlayContainer = document.createElement('div');
  overlayContainer.id = 'job-autofill-overlay-root';
  document.body.appendChild(overlayContainer);
  
  overlayRoot = createRoot(overlayContainer);
  
  const handleDismiss = () => {
    clearAllHighlights();
    overlayRoot.unmount();
    overlayContainer?.remove();
    overlayContainer = null;
  };
  
  const handleUndo = (field: FieldElement) => {
    fillField(field, ''); // Assuming empty string clears it or false for checkbox
    removeHighlight(field.element);
    
    // Rerender overlay without this field in filled state
    field.classification.confidence = 'unmatched';
    overlayRoot.render(
      <Overlay fields={fields} onDismiss={handleDismiss} onUndo={handleUndo} onFillManually={handleFillManually} />
    );
  };
  
  const handleFillManually = (field: FieldElement, category: string) => {
    const value = mapCategoryToValue(category, profile);
    if (value !== null && value !== '') {
      fillField(field, value);
      removeHighlight(field.element);
      highlightField(field.element, '#16a34a');
      field.classification = { category, confidence: 'high' };
      
      overlayRoot.render(
        <Overlay fields={fields} onDismiss={handleDismiss} onUndo={handleUndo} onFillManually={handleFillManually} />
      );
    }
  };

  overlayRoot.render(
    <Overlay fields={fields} onDismiss={handleDismiss} onUndo={handleUndo} onFillManually={handleFillManually} />
  );
}

// Listen for trigger from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'trigger_autofill') {
    runAutofill().then(fieldsCount => {
      sendResponse({ status: 'started', fieldsFound: fieldsCount });
    });
    return true; // Keep message channel open for async response
  }
});
