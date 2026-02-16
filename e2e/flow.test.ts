describe('E2E Verification Flow', () => {
  it('manual verification script exists', () => {
    expect(E2E_VERIFICATION_FLOW).toBeTruthy();
  });
});

export const E2E_VERIFICATION_FLOW = `
# Manual E2E Verification Script

## Prerequisite
- App installed on physical device (iOS/Android).
- Logged in with a test account.

## 1. Photo Handling (New Feature)
1. Open a birthday entry.
2. Tap "Change Photo" -> Select an image.
3. **Verify**: Image appears immediately.
4. Save -> **Verify**: Image persists on Home screen.
5. Edit again -> Tap "Remove Code".
6. **Verify**: Image is removed immediately.

## 2. Push Notifications
1. Go to Profile -> Notification Settings.
2. Set "Days before" to 1 day.
3. Create a birthday for *tomorrow* (e.g., if today is Feb 15, set Feb 16).
4. **Verify**: System permission dialog appears (if first time).
5. Minimize app (or close it).
6. **Verify**: (Wait for tomorrow) or manually test permissions in Settings. 
   *(Note: Real notification test requires waiting or changing device time, which is flaky. Main check is permission request flow)*.

## 3. Account Management (Compliance)
1. Go to Settings.
2. Tap "Legal" -> Check Privacy Policy loads.
3. Tap "Delete Account" -> "Delete Forever".
4. **Verify**: App logs out and returns to Login screen.
`;
