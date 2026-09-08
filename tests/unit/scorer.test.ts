import { describe, it, expect } from 'vitest';
import { computeScore, classifyField, normalizeString, matchesCredentialPattern } from '../../src/content/scorer';

describe('normalizeString', () => {
  it('normalizes various cases to spaced lowercase words', () => {
    expect(normalizeString('camelCase')).toBe('camel case');
    expect(normalizeString('snake_case')).toBe('snake case');
    expect(normalizeString('kebab-case')).toBe('kebab case');
    expect(normalizeString('  Extra   Spaces  ')).toBe('extra spaces');
  });
});

describe('credential filtering', () => {
  it('blocks password and ssn', () => {
    expect(matchesCredentialPattern('Enter your Password')).toBe(true);
    expect(matchesCredentialPattern('Social Security Number (SSN)')).toBe(true);
    expect(matchesCredentialPattern('Credit Card number')).toBe(true);
    expect(matchesCredentialPattern('First Name')).toBe(false);
  });
});

describe('scoring and classification', () => {
  const testCases = [
    {
      category: 'email',
      truePositive: { labelFor: 'Email Address' },
      trueNegative: { labelFor: 'Postal Address' }
    },
    {
      category: 'phone',
      truePositive: { ariaLabel: 'Mobile Number' },
      trueNegative: { ariaLabel: 'Fax' }
    },
    {
      category: 'education_12th',
      truePositive: { sectionContext: 'Education', labelFor: '12th Percentage' },
      trueNegative: { sectionContext: 'Education', labelFor: '10th Percentage' }
    },
    {
      category: 'documents',
      truePositive: { inputType: 'file', nameAttr: 'resume' },
      trueNegative: { inputType: 'text', nameAttr: 'resume_link' }
    }
  ];

  for (const { category, truePositive, trueNegative } of testCases) {
    it(`classifies ${category} correctly`, () => {
      const tpScores = computeScore(truePositive);
      const tpClass = classifyField(tpScores);
      expect(tpClass.category).toBe(category);
      expect(['high', 'low']).toContain(tpClass.confidence);

      const tnScores = computeScore(trueNegative);
      const tnClass = classifyField(tnScores);
      expect(tnClass.category).not.toBe(category);
    });
  }

  it('handles low confidence correctly when gap is < 20', () => {
    const scores = [
      { category: 'education_12th', score: 80 },
      { category: 'education_10th', score: 70 } // gap is 10
    ];
    const result = classifyField(scores);
    expect(result.confidence).toBe('low');
    expect(result.category).toBe('education_12th');
  });
});
