# Changelog

All notable changes to Birthminder will be documented in this file.

---

## v0.5 — 2025-02-14

### Significant Changes
- **Global ErrorBoundary**: Class component wrapping root layout catches lifecycle errors and shows themed error screen with "Restart App" button
- **Asset & Config Optimization**: Verified all icon/splash PNGs are valid and compressed; added `jsEngine: "hermes"` to `app.json` for optimal iOS performance
- **Legal Compliance**: Created `app/legal.tsx` with tabbed Privacy Policy and Terms of Service (data collection disclosure, Supabase storage, Apple Standard EULA reference, contact email for data deletion)
- **Profile tab**: Added tappable "Privacy Policy & Terms of Service" link at bottom

### Current Status
- TSC: 0 errors | Jest: 14/14 suites, 94/94 tests passing
- No known bugs

---

## v0.4 — 2025-02-14

### Significant Changes
- **Inline Group Creation**: Users can now create a new group directly from the Add Birthday form via a "+ New Group" chip with name input and color picker
- **Auto-select**: Newly created groups are automatically selected for the birthday being added
- **Groups section always visible**: Even when no groups exist yet, the section shows with the creation option

### Current Status
- No known bugs

---

## v0.3 — 2025-02-14

### Significant Changes
- **Groups Tab**: Removed FAB (birthday-add button) from the Groups tab
- **Add People to Groups**: Group detail screen now has an "Add" button that opens a modal to add existing saved people to the group
- **Remove from Group**: Can remove people from groups with confirmation dialog
- **Reactive Member Count**: Converted `useGroups` to shared `GroupsContext` so member counts update immediately across all screens
- **Refetch on Save**: `modal.tsx` now calls `refetchGroups()` after saving a birthday so group counts stay in sync

### Current Status
- No known bugs

---

## v0.2 — 2025-02-14

### Significant Changes
- **Immediate UI Updates**: Created `BirthdaysContext` for shared birthday state — new birthdays appear in the list instantly without app restart
- **iOS Permissions**: Added `expo-image-picker` plugin to `app.json` with photo library permission description to prevent crashes on iOS

### Current Status
- No known bugs

---

## v0.1 — 2025-02-14

### Significant Changes
- **Initial full app build**: Completed all 20 steps from CLAUDE.md build order
- **Auth**: Sign up, login, password reset with Supabase
- **Birthdays**: Add/edit/delete birthdays with photo upload, date picker, notes
- **Groups**: Create/delete groups, share codes, assign people to groups
- **Profile**: Theme toggle (light/dark), sign out, version display
- **Notifications**: Push notification scheduling for upcoming birthdays
- **Testing**: 14 test suites, 94 tests passing

### Current Status
- Birthday list did not update immediately (fixed in v0.2)
