import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { storage } from '../utils/storage';
import type { UserProfile } from '../types/profile';

const emptyProfile: UserProfile = {
  personal: { firstName: '', lastName: '', email: '', phone: '', address: {}, links: {} },
  education: {},
  workExperience: [],
  skills: [],
  documents: {}
};

const Options = () => {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    storage.getProfile().then(p => {
      if (p) setProfile(p);
    });
  }, []);

  const handleChange = (section: keyof UserProfile, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const handlePersonalChange = (field: string, value: string) => {
    setProfile(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const save = async () => {
    await storage.saveProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clear = async () => {
    if (confirm("Are you sure you want to clear all profile data?")) {
      await storage.clearProfile();
      setProfile(emptyProfile);
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'job-autofill-profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          setProfile(data);
          await storage.saveProfile(data);
          alert("Profile imported successfully!");
        } catch (err) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h1 style={{ color: '#1e293b' }}>Auto-Fill Profile Options</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={save} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {saved ? 'Saved!' : 'Save Profile'}
        </button>
        <button onClick={exportData} style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Export JSON
        </button>
        <label style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Import JSON
          <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
        </label>
        <button onClick={clear} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginLeft: 'auto' }}>
          Clear All Data
        </button>
      </div>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Personal Information</h2>
          <fieldset style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '4px', marginBottom: '15px' }}>
            <legend style={{ fontWeight: 'bold' }}>Professional Details</legend>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px' }}>Total Exp (Years)</label>
                <input style={{ width: '100%', padding: '6px' }} type="number" value={profile.personal.totalExperienceYears || ''} onChange={e => handlePersonalChange('totalExperienceYears', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px' }}>Total Exp (Months)</label>
                <input style={{ width: '100%', padding: '6px' }} type="number" value={profile.personal.totalExperienceMonths || ''} onChange={e => handlePersonalChange('totalExperienceMonths', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px' }}>Notice Period / Days to Join</label>
                <input style={{ width: '100%', padding: '6px' }} type="text" value={profile.personal.noticePeriod || ''} onChange={e => handlePersonalChange('noticePeriod', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px' }}>Salary Currency</label>
                <input style={{ width: '100%', padding: '6px' }} type="text" placeholder="e.g. INR, USD" value={profile.personal.salaryCurrency || ''} onChange={e => handlePersonalChange('salaryCurrency', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px' }}>Current Salary</label>
                <input style={{ width: '100%', padding: '6px' }} type="text" value={profile.personal.currentCtc || ''} onChange={e => handlePersonalChange('currentCtc', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px' }}>Expected Salary</label>
                <input style={{ width: '100%', padding: '6px' }} type="text" value={profile.personal.expectedCtc || ''} onChange={e => handlePersonalChange('expectedCtc', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px' }}>Current Location</label>
                <input style={{ width: '100%', padding: '6px' }} type="text" value={profile.personal.currentLocation || ''} onChange={e => handlePersonalChange('currentLocation', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px' }}>Preferred Location</label>
                <input style={{ width: '100%', padding: '6px' }} type="text" value={profile.personal.preferredLocation || ''} onChange={e => handlePersonalChange('preferredLocation', e.target.value)} />
              </div>
            </div>
          </fieldset>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
          <div>
            <label>First Name</label><br/>
            <input type="text" value={profile.personal.firstName || ''} onChange={e => handlePersonalChange('firstName', e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Last Name</label><br/>
            <input type="text" value={profile.personal.lastName || ''} onChange={e => handlePersonalChange('lastName', e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Email</label><br/>
            <input type="email" value={profile.personal.email || ''} onChange={e => handlePersonalChange('email', e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Phone Country Code</label><br/>
            <input type="text" placeholder="+91" value={profile.personal.phoneCountryCode || ''} onChange={e => handlePersonalChange('phoneCountryCode', e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>Phone</label><br/>
            <input type="tel" value={profile.personal.phone || ''} onChange={e => handlePersonalChange('phone', e.target.value)} style={{ width: '100%', padding: '8px' }} />
          </div>
          <div>
            <label>LinkedIn URL</label><br/>
            <input type="url" value={profile.personal.links?.linkedin || ''} onChange={e => handleChange('personal', 'links', { ...profile.personal.links, linkedin: e.target.value })} style={{ width: '100%', padding: '8px' }} />
          </div>
        </div>
      </section>

      {/* Other sections would go here - keeping minimal for now to ensure working structure */}
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Options />);
