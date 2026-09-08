import type { FieldElement } from './detector';
import type { UserProfile } from '../types/profile';

function setNativeValue(element: HTMLElement, value: string) {
  const lastValue = (element as any).value;
  (element as any).value = value;
  
  // React/Vue hacks
  const tracker = (element as any)._valueTracker;
  if (tracker) {
    tracker.setValue(lastValue);
  }
  
  // Dispatch events
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
}

export function fillField(field: FieldElement, value: string | boolean) {
  const el = field.element;
  
  if (typeof value === 'boolean') {
    // Checkbox or radio
    if (el.tagName === 'INPUT') {
      const input = el as HTMLInputElement;
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    return;
  }
  
  if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    setNativeValue(input, value);
  } else if (el.tagName === 'SELECT') {
    const select = el as HTMLSelectElement;
    let found = false;
    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (opt.text.toLowerCase().trim() === value.toLowerCase().trim()) {
        select.selectedIndex = i;
        found = true;
        break;
      }
    }
    // Fuzzy match fallback
    if (!found) {
      for (let i = 0; i < select.options.length; i++) {
        const opt = select.options[i];
        if (opt.text.toLowerCase().trim().includes(value.toLowerCase().trim()) || 
            value.toLowerCase().trim().includes(opt.text.toLowerCase().trim())) {
          select.selectedIndex = i;
          found = true;
          break;
        }
      }
    }
    if (found) {
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } else if (el.getAttribute('role') === 'combobox' || el.getAttribute('role') === 'listbox' || el.classList.contains('ng-select')) {
    const input = el.querySelector('input') || el;
    if (input.tagName === 'INPUT') {
      setNativeValue(input as HTMLElement, value);
      
      setTimeout(() => {
        // Expand the dropdown if it's not already
        const arrowElement = el.querySelector('.ng-arrow-wrapper') as HTMLElement;
        if (arrowElement && !el.classList.contains('ng-select-opened')) {
           arrowElement.click();
        }

        setTimeout(() => {
          // Find the popup overlay
          const popup = document.querySelector('[role="listbox"], .dropdown-menu, .ng-dropdown-panel');
          if (popup) {
            const options = Array.from(popup.querySelectorAll('[role="option"], li, .ng-option')) as HTMLElement[];
            let found = false;
            
            // Exact match
            for (const option of options) {
              if (option.textContent?.toLowerCase().trim() === value.toLowerCase().trim()) {
                option.click();
                found = true;
                break;
              }
            }
            
            // Substring match
            if (!found) {
              for (const option of options) {
                if (option.textContent?.toLowerCase().trim().includes(value.toLowerCase().trim())) {
                  option.click();
                  break;
                }
              }
            }
          }
        }, 100);
      }, 100);
    }
  }
}

export function mapCategoryToValue(category: string, profile: UserProfile): string | boolean | null {
  const p = profile.personal;
  switch (category) {
    case 'first_name': return p.firstName;
    case 'middle_name': return p.middleName || null;
    case 'last_name': return p.lastName;
    case 'full_name': return `${p.firstName} ${p.lastName}`;
    case 'email': return p.email;
    case 'phone': return p.phone;
    case 'phone_country_code': return p.phoneCountryCode || null;
    case 'date_of_birth': return p.dateOfBirth || null;
    case 'gender': return p.gender || null;
    case 'address_line1': return p.address.line1 || null;
    case 'address_line2': return p.address.line2 || null;
    case 'city': return p.address.city || null;
    case 'state': return p.address.state || null;
    case 'postal_code': return p.address.postalCode || null;
    case 'country': return p.address.country || null;
    case 'linkedin_url': return p.links.linkedin || null;
    case 'portfolio_url': return p.links.portfolio || null;
    case 'github_url': return p.links.github || null;
    case 'current_ctc': return p.currentCtc || null;
    case 'expected_ctc': return p.expectedCtc || null;
    case 'salary_currency': return p.salaryCurrency || null;
    case 'notice_period': return p.noticePeriod || null;
    case 'total_experience_years': return p.totalExperienceYears || null;
    case 'total_experience_months': return p.totalExperienceMonths || null;
    case 'current_location': return p.currentLocation || null;
    case 'preferred_location': return p.preferredLocation || null;
    case 'skills_list': return profile.skills.join(', ');
    case 'resume_upload': return profile.documents.resumeFileName || null;
    case 'cover_letter_upload': return profile.documents.coverLetterFileName || null;
    // Repeated groups handled separately
  }
  return null;
}
