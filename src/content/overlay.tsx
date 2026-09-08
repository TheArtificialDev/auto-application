import React, { useState } from 'react';
import type { FieldElement } from './detector';

interface OverlayProps {
  fields: FieldElement[];
  onDismiss: () => void;
  onUndo: (field: FieldElement) => void;
  onFillManually: (field: FieldElement, category: string) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ fields, onDismiss, onUndo, onFillManually }) => {
  const [expanded, setExpanded] = useState(true);

  if (!expanded) {
    return (
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 999999, background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontFamily: 'sans-serif' }} onClick={() => setExpanded(true)}>
        Show Autofill Review
      </div>
    );
  }

  const filled = fields.filter(f => f.classification.confidence === 'high' && !f.classification.category.startsWith('excluded') && f.classification.category !== 'documents');
  const lowConfidence = fields.filter(f => f.classification.confidence === 'low');
  const unmatched = fields.filter(f => f.classification.confidence === 'unmatched');
  const documents = fields.filter(f => f.classification.category === 'documents');

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, width: 350, maxHeight: '80vh', overflowY: 'auto', zIndex: 999999, background: 'white', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'sans-serif', fontSize: '14px', color: '#333' }}>
      <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '8px 8px 0 0' }}>
        <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>Autofill Review</h3>
        <div>
          <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}>_</button>
          <button onClick={onDismiss} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
        </div>
      </div>
      
      <div style={{ padding: '15px' }}>
        {documents.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#0284c7' }}>Documents (Attach Manually)</strong>
            {documents.map((f, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '12px', background: '#e0f2fe', padding: '8px', borderRadius: '4px' }}>
                <span>{f.element.getAttribute('aria-label') || f.element.name || 'File Input'}</span>
                <span>Please attach manually</span>
              </div>
            ))}
          </div>
        )}

        {lowConfidence.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <strong style={{ color: '#d97706' }}>Please Review (Low Confidence)</strong>
            {lowConfidence.map((f, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', marginTop: '5px', fontSize: '12px', border: '1px solid #fcd34d', padding: '8px', borderRadius: '4px' }}>
                <span style={{ marginBottom: '4px' }}>{f.element.getAttribute('aria-label') || f.element.name || 'Unknown Field'}</span>
                <select onChange={(e) => onFillManually(f, e.target.value)} defaultValue="" style={{ padding: '4px' }}>
                  <option value="" disabled>Select category to fill...</option>
                  <option value="first_name">First Name</option>
                  <option value="last_name">Last Name</option>
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="linkedin_url">LinkedIn</option>
                </select>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <strong style={{ color: '#16a34a' }}>Filled Fields ({filled.length})</strong>
          {filled.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', fontSize: '12px', borderBottom: '1px solid #eee', paddingBottom: '4px' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                {f.classification.category}
              </span>
              <button onClick={() => onUndo(f)} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '2px 8px' }}>Undo</button>
            </div>
          ))}
        </div>

        {unmatched.length > 0 && (
          <div>
            <strong style={{ color: '#64748b' }}>Unmatched ({unmatched.length})</strong>
          </div>
        )}
      </div>
    </div>
  );
};
