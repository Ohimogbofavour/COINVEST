## Bug Report: Admin Panel Changes Not Reflecting Across Devices

### Problem Description
Changes made in the admin panel to a user's account (balance, profits, referrals, KYC status) do not appear when that user logs in on another device.

### Root Cause Analysis

The issue stems from **multiple data synchronization failures**:

#### 1. **Sandbox Mode Data Isolation**
- **Location**: `DashboardContext.tsx` lines 215-232, 176-182
- **Issue**: In sandbox mode, user data is stored exclusively in browser localStorage with the key structure:
  - `sandbox_users_db` - stores user profiles by email
  - `sandbox_tx_${userId}` - transaction data
  - `sandbox_inv_${userId}` - investment data
  - `sandbox_trades_${userId}` - trade data

```tsx
// Example: User data is saved locally with no cross-device sync
useEffect(() => {
  if (isSandbox && user) {
    const savedUsers = JSON.parse(localStorage.getItem('sandbox_users_db') || '{}');
    savedUsers[user.email.toLowerCase()] = user;
    localStorage.setItem('sandbox_users_db', JSON.stringify(savedUsers));
  }
}, [user, isSandbox]);
```

**Problem**: localStorage is **per-device** only. Changes on Device A don't sync to Device B.

#### 2. **Incomplete Admin Update Propagation**
- **Location**: `AdminPanel.tsx` lines 215-246 (`handleDirectUpdateUser` function)
- **Issue**: When editing another user's account:
  - Updates are written to localStorage
  - BUT only the **currently active user** gets the context refreshed (line 228-230)
  - Other users' data doesn't trigger UI updates on other devices

```tsx
if (emailKey) {
  const uProfile = savedUsers[emailKey];
  const updatedProfile = { ...uProfile, ...fields };
  savedUsers[emailKey] = updatedProfile;
  localStorage.setItem('sandbox_users_db', JSON.stringify(savedUsers));
  
  // ONLY updates the active user context!
  if (user.id === uid) {
    adminUpdateUser(fields); // This doesn't affect other devices
  }
  refreshUsersList();
}
```

#### 3. **No Storage Event Listener for Cross-Tab/Device Sync**
- **Issue**: The app doesn't listen to `storage` events that could signal changes from other devices/tabs
- No mechanism exists to reload data when localStorage changes externally

#### 4. **Firebase Mode Relies on Real-time Listeners**
- **Location**: `DashboardContext.tsx` lines 230-311
- In Firebase mode (production), `onSnapshot` listeners automatically sync changes
- BUT in sandbox mode, these listeners are disabled, and manual sync is never implemented

### Impact
- **Scenario**: Admin updates user balance to $5,000 on Device A
- **Expected**: User sees $5,000 on Device B after logout/login
- **Actual**: User still sees old balance on Device B (reading cached localStorage)

### Solution Approaches

#### Option 1: Implement Storage Event Listener (Recommended for Sandbox)
```tsx
// In DashboardContext.tsx
useEffect(() => {
  if (!isSandbox) return;
  
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === 'sandbox_users_db' || event.key?.startsWith('sandbox_tx_')) {
      // Reload current user data from localStorage
      const currentUid = localStorage.getItem('sandbox_current_uid');
      if (currentUid) {
        const savedUsers = JSON.parse(localStorage.getItem('sandbox_users_db') || '{}');
        const updatedUser = Object.values(savedUsers).find((u: any) => u.id === currentUid);
        if (updatedUser) setUser(updatedUser as User);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, [isSandbox]);
```

**Limitation**: Only works for changes from OTHER TABS on the same device, not other devices.

#### Option 2: Switch to Firebase for Production + Real-time Sync
- Use Firebase's `onSnapshot` listeners in production
- Sandbox mode should also use Firestore if available
- This is the most robust solution

#### Option 3: Implement a Polling Mechanism
```tsx
// Poll localStorage periodically for external changes
useEffect(() => {
  if (!isSandbox) return;
  
  const lastHash = useRef('');
  const interval = setInterval(() => {
    const current = localStorage.getItem('sandbox_users_db') || '{}';
    if (JSON.stringify(current) !== lastHash.current) {
      lastHash.current = JSON.stringify(current);
      // Reload user data
    }
  }, 1000); // Check every second
  
  return () => clearInterval(interval);
}, [isSandbox]);
```

**Limitation**: High overhead, not real-time.

#### Option 4: Add Session Storage Check on App Resume
```tsx
// Detect when app comes to foreground
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // App became visible - refresh user data from storage
      const currentUid = localStorage.getItem('sandbox_current_uid');
      if (currentUid) {
        const savedUsers = JSON.parse(localStorage.getItem('sandbox_users_db') || '{}');
        const updated = Object.values(savedUsers).find((u: any) => u.id === currentUid);
        if (updated) setUser(updated as User);
      }
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### Recommended Fix Sequence

1. **Short-term (Sandbox Mode)**: Implement storage event listener for multi-tab sync on same device
2. **Medium-term**: Add visibility change handler to refresh data when switching between devices
3. **Long-term**: Migrate sandbox mode to use real Firebase collections for true cross-device sync

### Files to Modify
- `src/context/DashboardContext.tsx` - Add storage listeners and refresh logic
- `src/components/AdminPanel.tsx` - Ensure all user updates properly trigger context updates
- `src/utils/storageSync.ts` - Create utility for cross-device synchronization

### Test Cases
1. ✅ Edit user balance in admin panel on Device A, verify it updates on Device B after reload
2. ✅ Edit KYC status on Device A, check visibility on Device B immediately
3. ✅ Perform transaction as admin, verify balance reflects on other tabs of same user
4. ✅ Test with Firebase enabled (production) to verify cloud sync works
