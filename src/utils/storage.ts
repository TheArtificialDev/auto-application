import type { UserProfile } from '../types/profile';

const PROFILE_KEY = 'userProfile';

export const storage = {
  async getProfile(): Promise<UserProfile | null> {
    const data = await chrome.storage.local.get(PROFILE_KEY);
    return data[PROFILE_KEY] as UserProfile || null;
  },
  
  async saveProfile(profile: UserProfile): Promise<void> {
    await chrome.storage.local.set({ [PROFILE_KEY]: profile });
  },
  
  async clearProfile(): Promise<void> {
    await chrome.storage.local.remove(PROFILE_KEY);
  }
};
