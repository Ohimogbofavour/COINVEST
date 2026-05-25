/**
 * Storage Synchronization Utility
 * Handles cross-device and cross-tab synchronization for sandbox mode
 * 
 * This utility provides mechanisms to sync user data changes across:
 * - Multiple tabs on the same device (via storage events)
 * - Multiple devices (via polling or manual refresh)
 */

import { User, Transaction, Investment, Trade } from '../types';

export interface SandboxStorageKeys {
  usersDb: 'sandbox_users_db';
  currentUid: 'sandbox_current_uid';
  transactions: (uid: string) => string;
  investments: (uid: string) => string;
  trades: (uid: string) => string;
}

export const STORAGE_KEYS: SandboxStorageKeys = {
  usersDb: 'sandbox_users_db',
  currentUid: 'sandbox_current_uid',
  transactions: (uid: string) => `sandbox_tx_${uid}`,
  investments: (uid: string) => `sandbox_inv_${uid}`,
  trades: (uid: string) => `sandbox_trades_${uid}`,
};

/**
 * StorageSyncManager - Manages real-time storage synchronization
 */
export class StorageSyncManager {
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private isInitialized = false;

  /**
   * Initialize storage event listeners
   * Called once when the app boots in sandbox mode
   */
  initialize(): void {
    if (this.isInitialized) return;

    // Listen for storage changes from other tabs/windows
    window.addEventListener('storage', this.handleStorageChange.bind(this));

    // Listen for visibility changes to refresh data when tab becomes active
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    this.isInitialized = true;
  }

  /**
   * Subscribe to storage key changes
   * Usage: subscribe('sandbox_users_db', (data) => console.log('Users updated:', data))
   */
  subscribe(key: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  /**
   * Handle storage changes from other tabs/windows
   * This fires when localStorage is modified in another tab
   */
  private handleStorageChange(event: StorageEvent): void {
    if (!event.key) return;

    // Parse the new value
    let newData: any = null;
    try {
      newData = event.newValue ? JSON.parse(event.newValue) : null;
    } catch (e) {
      console.error('Failed to parse storage value:', e);
      return;
    }

    // Notify all listeners for this key
    this.listeners.get(event.key)?.forEach((callback) => {
      try {
        callback(newData);
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  }

  /**
   * Handle visibility changes
   * When the user switches back to the tab, refresh data to catch external changes
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      // Tab became visible - refresh all stored data
      this.refreshAllData();
    }
  }

  /**
   * Force refresh all user data from localStorage
   * Call this after an admin update to ensure consistency
   */
  private refreshAllData(): void {
    const usersDb = localStorage.getItem(STORAGE_KEYS.usersDb);
    if (usersDb) {
      try {
        const parsed = JSON.parse(usersDb);
        this.listeners
          .get(STORAGE_KEYS.usersDb)
          ?.forEach((cb) => cb(parsed));
      } catch (e) {
        console.error('Failed to refresh users data:', e);
      }
    }

    const currentUid = localStorage.getItem(STORAGE_KEYS.currentUid);
    if (currentUid) {
      const txKey = STORAGE_KEYS.transactions(currentUid);
      const invKey = STORAGE_KEYS.investments(currentUid);
      const tradesKey = STORAGE_KEYS.trades(currentUid);

      [txKey, invKey, tradesKey].forEach((key) => {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            this.listeners.get(key)?.forEach((cb) => cb(parsed));
          } catch (e) {
            console.error(`Failed to refresh ${key}:`, e);
          }
        }
      });
    }
  }

  /**
   * Cleanup listeners
   */
  destroy(): void {
    window.removeEventListener('storage', this.handleStorageChange.bind(this));
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    this.listeners.clear();
  }
}

/**
 * Utility function: Get current user data from localStorage
 */
export function getSandboxUserFromStorage(uid: string): User | null {
  try {
    const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.usersDb) || '{}');
    return Object.values(savedUsers).find((u: any) => u.id === uid) as User | null;
  } catch (e) {
    console.error('Failed to get user from storage:', e);
    return null;
  }
}

/**
 * Utility function: Get all sandbox users from localStorage
 */
export function getAllSandboxUsersFromStorage(): User[] {
  try {
    const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.usersDb) || '{}');
    return Object.values(savedUsers) as User[];
  } catch (e) {
    console.error('Failed to get users from storage:', e);
    return [];
  }
}

/**
 * Utility function: Update a specific user in localStorage
 * This automatically triggers storage events for other tabs/windows
 */
export function updateSandboxUserInStorage(uid: string, updates: Partial<User>): void {
  try {
    const savedUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.usersDb) || '{}');
    const emailKey = Object.keys(savedUsers).find((email) => savedUsers[email].id === uid);

    if (emailKey) {
      const updated = { ...savedUsers[emailKey], ...updates };
      savedUsers[emailKey] = updated;
      localStorage.setItem(STORAGE_KEYS.usersDb, JSON.stringify(savedUsers));
    }
  } catch (e) {
    console.error('Failed to update user in storage:', e);
  }
}

/**
 * Utility function: Get current user's transactions from localStorage
 */
export function getSandboxTransactionsFromStorage(uid: string): Transaction[] {
  try {
    const key = STORAGE_KEYS.transactions(uid);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    console.error('Failed to get transactions from storage:', e);
    return [];
  }
}

/**
 * Utility function: Get current user's investments from localStorage
 */
export function getSandboxInvestmentsFromStorage(uid: string): Investment[] {
  try {
    const key = STORAGE_KEYS.investments(uid);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    console.error('Failed to get investments from storage:', e);
    return [];
  }
}

/**
 * Utility function: Get current user's trades from localStorage
 */
export function getSandboxTradesFromStorage(uid: string): Trade[] {
  try {
    const key = STORAGE_KEYS.trades(uid);
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    console.error('Failed to get trades from storage:', e);
    return [];
  }
}

/**
 * Global singleton instance
 */
export const storageSyncManager = new StorageSyncManager();
