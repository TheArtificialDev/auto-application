import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { storage } from '../utils/storage';
import type { UserProfile } from '../types/profile';

const Popup = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    storage.getProfile().then(p => setProfile(p));
  }, []);

  const handleAutofill = async () => {
    setStatus('processing');
    setMessage('Injecting script...');
    
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) {
      setStatus('error');
      setMessage('No active tab found.');
      return;
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        files: ['assets/content.js']
      });

      setMessage('Scanning page for fields...');
      
      // We send to the top frame. If forms are in iframes, this might not reach them unless we loop over frames.
      // But standard Keka is usually single frame or we can broadcast.
      chrome.tabs.sendMessage(tab.id, { action: 'trigger_autofill' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          // Don't immediately fail, as the script might have run but port closed
          setStatus('error');
          setMessage('Failed to connect to page. If this is a restricted page (like chrome://), it will not work.');
          return;
        }
        
        if (response && response.status === 'started') {
          setStatus('success');
          if (response.fieldsFound === 0) {
             setStatus('error');
             setMessage('No fillable fields detected on this page.');
          } else {
             setMessage(`Found ${response.fieldsFound} field(s). Review overlay should appear.`);
          }
        }
      });
      
      // Safety timeout
      setTimeout(() => {
        setStatus(prev => prev === 'processing' ? 'error' : prev);
        setMessage(prev => prev === 'Scanning page for fields...' ? 'Request timed out.' : prev);
      }, 5000);

    } catch(e: any) {
      setStatus('error');
      setMessage('Execution failed: ' + e.message);
    }
  };

  const handleOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const isComplete = profile !== null && profile.personal?.firstName;

  return (
    <div style={{ width: '320px', padding: '16px', fontFamily: 'sans-serif' }}>
      <h2 style={{ fontSize: '18px', marginTop: 0, marginBottom: '16px' }}>Job Application Auto-Fill</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Profile Status:</strong>
        <p style={{ marginTop: '4px', fontSize: '14px', color: isComplete ? 'green' : 'red' }}>
          {isComplete ? 'Profile set up' : 'Profile incomplete or missing'}
        </p>
      </div>

      <button 
        onClick={handleAutofill} 
        disabled={!isComplete || status === 'processing'}
        style={{ 
          width: '100%', 
          padding: '10px', 
          backgroundColor: !isComplete ? '#93c5fd' : status === 'processing' ? '#fbbf24' : status === 'success' ? '#10b981' : '#2563eb', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: !isComplete || status === 'processing' ? 'not-allowed' : 'pointer',
          marginBottom: '10px',
          fontWeight: 'bold'
        }}
      >
        {status === 'processing' ? 'Processing...' : status === 'success' ? 'Autofill Triggered!' : 'Autofill this page'}
      </button>

      {message && (
        <div style={{ 
          padding: '8px', 
          marginBottom: '10px', 
          borderRadius: '4px', 
          fontSize: '13px',
          backgroundColor: status === 'error' ? '#fee2e2' : status === 'success' ? '#d1fae5' : '#e0f2fe',
          color: status === 'error' ? '#b91c1c' : status === 'success' ? '#065f46' : '#0369a1'
        }}>
          {message}
        </div>
      )}

      <button 
        onClick={handleOptions} 
        style={{ 
          width: '100%', 
          padding: '10px', 
          backgroundColor: 'white', 
          color: '#2563eb', 
          border: '1px solid #2563eb', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Edit Profile Options
      </button>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
