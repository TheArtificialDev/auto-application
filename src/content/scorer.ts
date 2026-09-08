import taxonomyData from '../config/field-taxonomy.json';

type TaxonomyKey = keyof typeof taxonomyData;

const CREDENTIAL_EXCLUSION_LIST = [
  "password", "credit card", "cvv", "ssn", "national id", 
  "passport number", "bank account", "routing number"
];

// EEO and self-identification categories are not in the taxonomy to begin with,
// but let's explicitly list them if we want to flag them.
const EEO_EXCLUSION_LIST = [
  "race", "ethnicity", "disability", "veteran", "religion", 
  "marital status", "salary history"
];

export interface ScoredCategory {
  category: string;
  score: number;
}

export function normalizeString(str: string): string {
  if (!str) return '';
  return str
    // replace camelCase, snake_case, kebab-case with spaces
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_\-:*]/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
}

export function matchesCredentialPattern(text: string): boolean {
  const norm = normalizeString(text);
  return CREDENTIAL_EXCLUSION_LIST.some(pattern => norm.includes(pattern));
}

export function matchesEEOPattern(text: string): boolean {
  const norm = normalizeString(text);
  return EEO_EXCLUSION_LIST.some(pattern => norm.includes(pattern));
}

export function computeScore(signals: {
  labelFor?: string,
  wrappingLabel?: string,
  proximityLabel?: string,
  ariaLabel?: string,
  nameAttr?: string,
  idAttr?: string,
  placeholder?: string,
  sectionContext?: string,
  inputType?: string
}): ScoredCategory[] {
  const scores = new Map<string, number>();
  const taxonomy = taxonomyData as Record<string, string[]>;

  // Combined text to check for exclusions
  const combinedText = [
    signals.labelFor, signals.wrappingLabel, signals.proximityLabel, signals.ariaLabel,
    signals.nameAttr, signals.idAttr, signals.placeholder, signals.sectionContext
  ].filter(Boolean).join(' ');

  if (matchesCredentialPattern(combinedText)) {
    return [{ category: 'excluded_credential', score: 100 }];
  }
  
  if (matchesEEOPattern(combinedText)) {
    return [{ category: 'excluded_eeo', score: 100 }];
  }

  if (signals.inputType === 'file') {
    return [{ category: 'documents', score: 100 }];
  }

  for (const [category, phrases] of Object.entries(taxonomy)) {
    let currentScore = 0;

    for (const phrase of phrases) {
      // Label For - 100
      if (signals.labelFor && normalizeString(signals.labelFor) === phrase) {
        currentScore = Math.max(currentScore, 100);
      }
      // Wrapping Label - 95
      if (signals.wrappingLabel && normalizeString(signals.wrappingLabel) === phrase) {
        currentScore = Math.max(currentScore, 95);
      }
      // Aria Label - 90
      if (signals.ariaLabel && normalizeString(signals.ariaLabel) === phrase) {
        currentScore = Math.max(currentScore, 90);
      }
      // Proximity Label - 85
      if (signals.proximityLabel && normalizeString(signals.proximityLabel) === phrase) {
        currentScore = Math.max(currentScore, 85);
      }
      // Substring match of label/aria/proximity - 70
      if ((signals.labelFor && normalizeString(signals.labelFor).includes(phrase)) ||
          (signals.wrappingLabel && normalizeString(signals.wrappingLabel).includes(phrase)) ||
          (signals.ariaLabel && normalizeString(signals.ariaLabel).includes(phrase)) ||
          (signals.proximityLabel && normalizeString(signals.proximityLabel).includes(phrase))) {
        currentScore = Math.max(currentScore, 70);
      }
      // Name or ID attribute - 60
      if ((signals.nameAttr && normalizeString(signals.nameAttr).includes(phrase)) ||
          (signals.idAttr && normalizeString(signals.idAttr).includes(phrase))) {
        currentScore = Math.max(currentScore, 60);
      }
      // Placeholder - 50
      if (signals.placeholder && normalizeString(signals.placeholder).includes(phrase)) {
        currentScore = Math.max(currentScore, 50);
      }
    }

    if (currentScore > 0) {
      // Section context - additive 40
      if (signals.sectionContext) {
        const normSection = normalizeString(signals.sectionContext);
        if (phrases.some(p => normSection.includes(p))) {
          currentScore += 40;
        }
      }

      // Input type consistency - additive 15
      if (signals.inputType) {
        const type = signals.inputType.toLowerCase();
        if ((type === 'email' && category === 'email') ||
            (type === 'tel' && category === 'phone') ||
            (type === 'date' && category.includes('date')) ||
            (type === 'number' && category.includes('years'))) {
          currentScore += 15;
        }
      }

      scores.set(category, currentScore);
    }
  }

  const sorted = Array.from(scores.entries())
    .map(([category, score]) => ({ category, score }))
    .sort((a, b) => b.score - a.score);

  return sorted;
}

export function classifyField(scoredCategories: ScoredCategory[]): { category: string, confidence: 'high' | 'low' | 'unmatched' | 'excluded' } {
  if (scoredCategories.length === 0) return { category: 'unmatched', confidence: 'unmatched' };
  
  const top = scoredCategories[0];
  
  if (top.category.startsWith('excluded_')) {
    return { category: top.category, confidence: 'excluded' };
  }
  
  if (top.category === 'documents') {
    return { category: 'documents', confidence: 'high' };
  }

  if (top.score < 70) {
    return { category: 'unmatched', confidence: 'unmatched' };
  }

  if (scoredCategories.length > 1) {
    const second = scoredCategories[1];
    if (top.score - second.score < 20) {
      return { category: top.category, confidence: 'low' };
    }
  }

  return { category: top.category, confidence: 'high' };
}
