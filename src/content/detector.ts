import { computeScore, classifyField } from './scorer';

export interface FieldElement {
  element: HTMLElement;
  classification: {
    category: string;
    confidence: 'high' | 'low' | 'unmatched' | 'excluded';
  };
}

function isVisible(el: HTMLElement): boolean {
  if (el.offsetParent === null) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return true;
}

function getClosestHeadingContext(el: HTMLElement): string {
  let current = el.parentElement;
  let levelsUp = 0;
  
  while (current && levelsUp < 4) {
    // Find preceding sibling headings or headings within the wrapper
    const heading = current.querySelector('h1, h2, h3, h4, h5, h6, legend, [role="heading"]');
    if (heading && heading.textContent) {
      return heading.textContent;
    }
    current = current.parentElement;
    levelsUp++;
  }
  return '';
}

function extractSignals(el: HTMLElement): any {
  let labelFor = '';
  let wrappingLabel = '';
  let proximityLabel = '';
  let ariaLabel = el.getAttribute('aria-label') || '';
  let nameAttr = el.getAttribute('name') || '';
  let idAttr = el.id || '';
  let placeholder = el.getAttribute('placeholder') || '';
  let inputType = el.getAttribute('type') || '';
  
  // Aria labelledby
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const labelEl = document.getElementById(labelledby);
    if (labelEl) ariaLabel = labelEl.textContent || '';
  }

  // Label for
  if (idAttr) {
    const labelEls = document.querySelectorAll(`label[for="${idAttr}"]`);
    if (labelEls.length > 0) {
      labelFor = labelEls[0].textContent || '';
    }
  }

  // Wrapping label
  const parentLabel = el.closest('label');
  if (parentLabel) {
    wrappingLabel = parentLabel.textContent || '';
  }

  // Proximity label (previous sibling or inside same parent)
  if (!labelFor && !wrappingLabel) {
    const previousSibling = el.previousElementSibling;
    if (previousSibling && previousSibling.tagName === 'LABEL') {
      proximityLabel = previousSibling.textContent || '';
    } else if (el.parentElement) {
      const parentLabels = el.parentElement.querySelectorAll('label');
      if (parentLabels.length === 1) {
        proximityLabel = parentLabels[0].textContent || '';
      }
    }
  }

  const sectionContext = getClosestHeadingContext(el);

  return { labelFor, wrappingLabel, proximityLabel, ariaLabel, nameAttr, idAttr, placeholder, sectionContext, inputType };
}

export function detectFields(root: Document | ShadowRoot | Element = document): FieldElement[] {
  const fields: FieldElement[] = [];
  const candidates = root.querySelectorAll('input, select, textarea, [role="combobox"], [role="listbox"], [role="radiogroup"], .ng-select');
  
  candidates.forEach(node => {
    const el = node as HTMLElement;
    
    // Skip if disabled or not visible
    if ((el as any).disabled || !isVisible(el)) return;
    
    // Skip submit buttons
    const type = el.getAttribute('type');
    if (type === 'submit' || type === 'button' || type === 'hidden') return;
    
    const signals = extractSignals(el);
    const scored = computeScore(signals);
    const classification = classifyField(scored);
    
    fields.push({
      element: el,
      classification
    });
  });

  // Recursively search open shadow roots
  const allElements = root.querySelectorAll('*');
  allElements.forEach(node => {
    if (node.shadowRoot) {
      fields.push(...detectFields(node.shadowRoot));
    }
  });

  return fields;
}
