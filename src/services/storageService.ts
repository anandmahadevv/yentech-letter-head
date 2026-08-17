import { DEFAULT_ORGANIZATIONS, INITIAL_ADMIN_SETTINGS } from '../data/defaultOrganizations';
import { AdminSettings, GeneratedDocumentLog, LetterData, Organization } from '../types';

const ORGS_STORAGE_KEY = 'official_letterhead_organizations_v4';
const ADMIN_STORAGE_KEY = 'official_letterhead_admin_settings_v1';
const HISTORY_STORAGE_KEY = 'official_letterhead_history_v1';
const AUTH_SESSION_KEY = 'yentech_studio_auth_session_v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 24 hours (1 day)

export interface AuthSession {
  authenticated: boolean;
  timestamp: number;
}

/**
 * Checks if the user is authenticated within the 24-hour window
 */
export function isStudioAuthenticated(): boolean {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return false;
    const session: AuthSession = JSON.parse(raw);
    if (session.authenticated && typeof session.timestamp === 'number') {
      const elapsed = Date.now() - session.timestamp;
      if (elapsed < ONE_DAY_MS && elapsed >= 0) {
        return true;
      }
    }
  } catch (e) {
    console.warn('Auth check error', e);
  }
  return false;
}

/**
 * Saves authenticated session timestamp to localStorage for 24 hours
 */
export function setStudioAuthenticated(): void {
  try {
    const session: AuthSession = {
      authenticated: true,
      timestamp: Date.now(),
    };
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to set auth session', e);
  }
}

/**
 * Clears authentication session (manual lock/logout)
 */
export function clearStudioAuth(): void {
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear auth session', e);
  }
}

export function loadOrganizations(): Organization[] {
  try {
    const data = localStorage.getItem(ORGS_STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse organizations from storage', e);
  }
  return DEFAULT_ORGANIZATIONS;
}

export function saveOrganizations(orgs: Organization[]): void {
  try {
    localStorage.setItem(ORGS_STORAGE_KEY, JSON.stringify(orgs));
  } catch (e) {
    console.error('Failed to save organizations to storage', e);
  }
}

export function loadAdminSettings(): AdminSettings {
  try {
    const data = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (data) {
      return { ...INITIAL_ADMIN_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    console.warn('Failed to parse admin settings from storage', e);
  }
  return INITIAL_ADMIN_SETTINGS;
}

export function saveAdminSettings(settings: AdminSettings): void {
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save admin settings', e);
  }
}

export function loadDocumentHistory(): GeneratedDocumentLog[] {
  try {
    const data = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.warn('Failed to parse history', e);
  }
  return [];
}

export function saveDocumentToHistory(letterData: LetterData, org: Organization): void {
  try {
    const history = loadDocumentHistory();
    const newEntry: GeneratedDocumentLog = {
      id: letterData.id || 'log_' + Date.now(),
      orgId: org.id,
      orgName: org.name,
      letterType: letterData.letterType,
      subject: letterData.subject,
      recipient: `${letterData.recipient.title}, ${letterData.recipient.department}`,
      date: letterData.date,
      refNumber: letterData.refNumber,
      letterData,
      createdAt: new Date().toISOString(),
    };

    // Keep last 50 letters in history
    const updated = [newEntry, ...history.filter(h => h.id !== newEntry.id)].slice(0, 50);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save document to history', e);
  }
}

export function deleteHistoryItem(id: string): void {
  try {
    const history = loadDocumentHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete history item', e);
  }
}

export function clearAllHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history', e);
  }
}
