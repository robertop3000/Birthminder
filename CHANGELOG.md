# Changelog

All notable changes to Birthminder will be documented in this file.

---
 
## v1.5.2 - 2026-03-01
*Developed using Gemini / Claude Opus. Branch: 1.5.2 (Expo Version: 1.4.0, Build: 6).*

### Added
- **Per-Birthday Custom Reminders**: Each birthday now supports multiple reminder notifications (0–7 days before).
    - Default reminder is "Same day" for all existing and new birthdays.
    - Users can select any combination from "Same day" to "1 week before".
- **Remind Me Dropdown UI**: Replaced the 8-chip layout with a compact dropdown button + modal with checkboxes on both the person detail screen and the birthday creation/edit form.

### Fixed
- **Recovered Missing Components**: Restored `CalendarImportModal.tsx` and `ContactLinkButton.tsx` from git history — these were lost during a prior stash/merge operation.
- **Default Reminder Normalization**: Ensured `reminder_days` defaults to `[0]` at the data fetch layer for birthdays that have `null` in the database.

### Tests
- Added 2 new notification tests (null fallback + multi-day scheduling). Total: 8/8 passing.

### Known Issues
- **Change Password screen**: Has issues to be addressed in v1.5.3.

## v1.5.1 - 2026-02-28
*Developed using Gemini 3.5 Sonnet. Branch: 1.5.1 (Expo Version: 1.4.0, Build: 6).*

### Added
- **Group Management**: Improved the flow for adding birthdays to groups.
    - Added a search bar to filter existing people when adding to a group.
    - Added a "New Birthday" shortcut in the group modal that pre-selects the current group.
- Initialized branch 1.5.1 for new feature development.

## v1.5.0 — Auth & UX Refinement (Dev Branch)
*Developed using Gemini 3.5 Sonnet. Branch: 1.5.0 (Expo Version: 1.4.0).*

### 🔐 Authentication & Security
- **Internal Password Reset**: Added a dedicated `reset-password` screen accessible from within the app for signed-in users.
- **Improved Password Hooks**: Updated `useAuth` with `updatePassword` and `resetPassword` methods using Supabase.
- **Sign Up Cleanup**: Removed the 'Add picture' icon from the Sign Up page for a sleeker initial onboarding experience.
- **Forgot Password**: Perfectly working in the development build; successfully handles recovery links and deep linking to the `reset-password` screen with a multi-environment redirect logic.

## v1.4.1 - 2026-02-23 — Communication & UX Overhaul
*Developed using Gemini 3.5 Sonnet. Production build for TestFlight UAT.*

### 💬 Messaging & Communication Hub
- **Deep Link Integration**: Added direct WhatsApp and iMessage action buttons on birthday profiles.
- **"No-Build" App Detection**: Graceful handling of missing messaging apps with user alerts (via `Linking.openURL` try/catch).
- **E.164 Number Sanitization**: Automatically strips spaces/dashes from contacts for perfect WhatsApp formatting.
- **Pre-filled Greetings**: Default "Hey! Happy Birthday! 🎂" message populates automatically.

### 🔔 Notification System Refactoring
- **"Day-Of" Strategy**: Alerts now fire exclusively on the actual birthday (removed "2 days before" clutter).
- **8:00 AM Trigger**: Standardized, hardcoded alert time for all birthdays.
- **Sound Restoration**: Fixed "silent notification" bug (enabled `shouldPlaySound` and system defaults).
- **Auto-Migration**: AsyncStorage migration wipes "ghost reminders" and re-schedules for the new 8:00 AM slot.
- **UI Cleanup**: Removed "Remind Me" toggle; notifications are now intelligently automatic.

### 📅 Calendar Import & Logic Fixes
- **Unique Identity Fix**: Resolved duplicate key errors in lists by combining event IDs with indices in `keyExtractor`.
- **Select All Logic**: Fixed bi-directional toggle for clearing all selections.
- **Performance**: Optimized selection logic using `useMemo` and `useCallback` for zero-lag with large datasets.

### 🎨 Navigation & Interface Polish
- **Interactive Home Banner**: Celebration banner now navigates directly to the birthday profile.
- **Tab Consolidation**: Merged "Notifications" and "Search" into a single unified view.

## v1.4.0 - 2026-02-23
*Developed using Gemini 3.5 Sonnet.*

### Added
- **Link to Contact**: Ability to link birthdays to phone contacts for easy messaging.
- **Import from Calendar**: Integration to import friend birthdays directly from the iOS Calendar.
- **New Dependencies**: Added `expo-calendar` and `expo-contacts`.
- **Permissions**: Configured mandatory iOS privacy descriptions for Calendar and Contacts access.

## v1.3.2 - 2026-02-22
*Developed using Gemini 3.5 Sonnet.*

### Changed
- **UI Legibility**: Improved readability in the Notifications tab by increasing `lineHeight` to 20 for text content.

## v1.3.1 - 2026-02-21
*Developed using Gemini 3 Flash.*

### Fixed
- **UI Lag After Import**: Eliminated the 20-60s delay after importing shared groups by forcing an immediate context refetch.

## v1.3.0 - 2026-02-21
*Developed using Gemini 3 Flash.*

### Added
- **Removed diagnostic tools**: Removed the visible "Send Test Notification" button from the Home screen.
- **Hidden Diagnostic Tool**: Added a hidden bell icon in the Settings header for manual notification testing.
- **Reactive UI updates**: Group name and color changes now reflect immediately across all birthday cards and profiles without requiring a refetch.
- **Explicit Permission Bootstrap**: Added automatic notification permission request during initial app launch in `RootLayout`

### Fixed
- **Notification Scheduling**: Hardened local notifications to trigger at 8:00 AM local time
- **Unique Identifiers**: Assigned birthday UUIDs to notification identifiers to prevent scheduling conflicts
- **Foreground Notifications**: Enabled alert visibility even when the app is active
- **Reference Error**: Fixed missing `Notifications` import in `HomeScreen`

---

## v1.2.0 - 2026-02-19 (Stable — Group photos, edit groups, fix shared groups, OG previews)

### Added
- **Group photos**: Groups now support photo uploads (displayed in group cards and detail view)
- **Group editing**: Pencil icon in group detail header opens edit modal (name, color, photo)
- **Reusable upload utility**: Extracted `lib/uploadImage.ts` from modal.tsx for shared use
- **OG meta tag landing page**: `docs/index.html` served via GitHub Pages for rich link previews on WhatsApp, Telegram, iMessage
- **Import deduplication**: `source_share_code` column tracks import origin; re-importing shows "Already Imported" with Update option
- **Full field import**: Shared group imports now copy `birthday_year`, `notes`, and `photo_url`

### Fixed
- **Empty shared groups**: Root cause was circular RLS policy dependencies between `people` and `person_groups` tables. Replaced with `SECURITY DEFINER` helper functions (`is_person_in_shared_group`, `is_person_group_in_shared_group`) that bypass RLS internally
- **Share URLs**: Changed from `birthminder://` custom scheme (only works in iMessage) to `https://robertop3000.github.io/Birthminder/?code=X` (works on all platforms with OG previews)

### Changed
- **GroupForm component**: Now supports photo picker and `initialPhotoUrl` prop
- **GroupCard component**: Shows Avatar when group has photo, color bar otherwise
- **Share.share()**: Now includes both `message` and `url` fields for better iOS support
- **Git remote**: Updated from `Birthday-Calendar` to `Birthminder` (repo renamed)

### Database Migration (run in Supabase SQL Editor)
- `ALTER TABLE groups ADD COLUMN photo_url TEXT`
- `ALTER TABLE groups ADD COLUMN source_share_code TEXT`
- Two `SECURITY DEFINER` functions + two new RLS SELECT policies for shared group visibility

### Known Issues
- **Notifications**: Push notification scheduling needs review — may require users to toggle notifications off/on for changes to take effect. Will be addressed in a future version.

### Verified
- TSC: 0 errors | Jest: 16/16 suites, 97/97 tests passing
- Tested on physical iPhone via Expo Go — group editing, photos, and data loading all work correctly
- Friends' data restored after RLS policy fix

---

## v1.1.2 - 2026-02-18 (Security: Remove credentials from repo)

### Security
- **Removed `.env` from git tracking**: File was committed before `.gitignore` rule existed. Supabase credentials were exposed in git history. Now untracked — local file kept for dev, production uses EAS secrets.
- **Enhanced `.gitignore`**: Added patterns for `.env.*`, `*.secret`, `credentials.json`, `google-services.json`, `GoogleService-Info.plist`.

### Verified
- No sensitive data in any tracked files (scanned for API keys, tokens, credentials).
- `.env` confirmed untracked by git.

---

## v1.1.0 - 2026-02-18 (Critical: Fix Launch Crash)

Build number 4. Fixes SIGABRT crash on startup in TestFlight/App Store review.

### Fixed
- **Launch crash (SIGABRT)**: Root cause was missing Supabase environment variables in production EAS builds. `createClient()` received `undefined` for URL/key, crashing the native bridge and triggering Expo's `ErrorRecovery.swift` → `abort()`.
- **EAS Secrets**: Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` as project-scoped EAS secrets so production builds have the credentials baked in.
- **Supabase client hardening**: Replaced non-null assertions (`!`) with nullish coalescing (`??`). Wrapped `createClient()` in try/catch with fallback — app now shows login/error screen instead of crashing if credentials are missing.

### Changed
- **iPad compatibility**: Set `supportsTablet: true` in app.json (reviewer was on iPad Air M3).
- **Build number**: Bumped to "4".
- **Dependencies**: Added `@expo/ngrok` for tunnel-based dev testing.

### Verified
- TSC: 0 errors | Jest: 16/16 suites, 97/97 tests passing
- Tested on physical iPhone via Expo Go — app loads, login works, birthdays load correctly.

---

## v1.0.0 - 2026-02-18 (First App Store Production Release)

This is the first production release of Birthminder, corresponding to
repository version v0.11. App Store version 1.0.0, build number 3.

### Added
- **iOS Privacy Manifests**: Added `NSPrivacyAccessedAPITypes` entries for UserDefaults, FileTimestamp, and DiskSpace APIs (Apple 2025/2026 requirement).
- **iOS Permissions**: Added `NSPhotoLibraryUsageDescription` and `NSCameraUsageDescription` with user-friendly descriptions.
- **Build number**: Bumped `ios.buildNumber` to "3" in app.json.

### Changed
- **Production console cleanup**: All 17 `console.log/warn/error` calls wrapped in `__DEV__` guards so they are stripped from production builds.
- **Environment cleanup**: Deleted `node_modules_old/` and `node_modules_old_main/` (leftover from dependency upgrades).
- **`.gitignore`**: Added `node_modules_old/`, `node_modules_old_main/`, `.env`, and `*.bak` patterns.
- **app.json**: Removed stale `android` permissions block (iOS-only app).
- **Test fixes**: Added `useAuth` mock to modal test files; added `__DEV__` global to jest.setup.js.

### Removed
- Deleted `.bak` asset backup files.
- Removed `android.permissions` block from app.json.

### Pre-Flight Audit Results
- TSC: 0 errors
- Jest: 16/16 suites, 97/97 tests passing
- No TODOs, FIXME, Lorem Ipsum, or placeholder text in source
- No console statements in production builds
- All iOS permissions and privacy manifests configured
- Bundle ID: com.birthminder.app
- Ready for `eas build --platform ios --profile production`

---

## v0.11 - 2026-02-17

### Changed
- **Legal**: Updated contact email to deverobertt@gmail.com in both Privacy Policy and Terms of Service.
- **EAS config**: Added eas.json with development, preview, and production build profiles.
- **app.json**: Added EAS project ID, OTA updates config, and `ITSAppUsesNonExemptEncryption: false` for App Store compliance.
- **Dependencies**: Added expo-dev-client and expo-updates.

### Current Status
- TSC: 0 source errors | Jest: 16/16 suites, 97/97 tests passing
- No known bugs

---

## v0.10 - 2026-02-16 (First stable development release)

### Fixed
- Resolved "Invalid Refresh Token" error on app startup by handling auth session errors gracefully.
- Fixed photo upload failure by ensuring user authentication before upload.
- Resolved `expo-file-system` deprecation error by switching to legacy API.
- Updated app icon, adaptive icon, and splash screen with new "Birthminder Logo".

### Changed
- **Notifications Tab**: Redesigned to group birthdays by month (rolling order).
    - Birthdays are sorted by next occurrence.
    - Month sections are created dynamically (e.g., February 2026 separate from February 2027).
    - Items are now clickable and navigate to the person's detail view.

### Planned
- (None)

---

## v0.9.3 - 2026-02-16

### Improved
- **Notifications tab overhaul**: Replaced flat list with SectionList grouped by month. Months display as uppercase headers with birthdays sorted by day within each month.
- **Rolling month order**: Sections start from the current month and wrap around, so the most relevant birthdays are always at the top.
- **Clickable birthday rows**: Tapping a birthday in the Notifications tab now navigates to the person detail screen, matching Home and Search tab behavior.
- **No birthday limit**: Removed the 20-birthday cap — all birthdays are now shown.

### Current Status
- TSC: 0 errors | Jest: 16/16 suites, 97/97 tests passing
- No known bugs

---

## v0.9.2 - 2026-02-16

### Fixed
- **Avatar retry mechanism**: Replaced permanent failure state with auto-retry (up to 3 attempts with 2s delay). Fixes intermittent photo loading after upload when CDN is slow to propagate.
- **Jest test infrastructure**: Added missing mocks for `expo-image`, `expo-image-manipulator`, and `expo-file-system/legacy` that were introduced in v0.9.1 but never mocked.
- **e2e test suite**: Fixed empty test suite error.
- **Photo upload test**: Updated assertion to account for ImageManipulator processing step.

### Current Status
- TSC: 0 errors | Jest: 16/16 suites, 97/97 tests passing
- No known bugs

---

## v0.9.1 - 2026-02-15

### Improved
- **Image Pipeline Overhaul**:
    - Installed `expo-image` for high-performance, disk-cached image rendering.
    - Implemented automatic image optimization on upload (Resize to 600px, Compress 0.7, Convert to JPEG).
    - Added fade-in transitions for smoother UX.
- **Deep Linking**: Clarified that `birthminder://` links require development/production builds.

---

## v0.9.0 — 2026-02-15

### Added
- Group Sharing via native Share sheet (deep links).
- Birthday Sharing via native Share sheet (deep links).
- "Just the day of" notification option (0 days).
- Image upload optimization (quality reduced to 0.5).

### Fixed
- Reverted `Avatar` component to conditional rendering to fix list display issues.
- Fixed Group List share button to use native sharing.
- Unified database schema in `supabase-schema.sql`.

### Known Issues
- Avatar image loading is slow/unoptimized in some views. Needs performance investigation.

---

## v0.8 — 2026-02-15

### Significant Changes
- **Test Notification Button**: Added temporary "Test Notification (60s)" button on Home screen to verify push notifications work on device
- **Home Screen Fix**: Restored Home screen after Gemini 3 Pro destroyed it by replacing code with placeholder comments (`// ... existing imports`)
- **CLAUDE.md**: Added Part 3 (Development Workflow) — simulator-less testing loop, git branch strategy, multi-agent collaboration rules
- **Git Branch Strategy**: Introduced `stable/vX.Y` branches for rollback safety

### Current Status
- TSC: 0 errors
- Metro bundle: successful (1597 modules)
- No known bugs

---

## v0.7 — 2026-02-15

### Significant Changes
- **Photo Upload**: Robust file handling with validation and specific helpful error messages.
- **Photo Features**: Added ability to remove photos and fixed issue with images not updating immediately (cache busting).
- **Critical Fix**: Resolved issue where uploaded photos were blank (0 bytes) by switching to `expo-file-system` and base64 upload, replacing the unreliable `blob()` method.
- **Tests**:
  - `app/__tests__/modal_photo.test.tsx`: Verifies upload flow, removal, and cache busting.

### Current Status
- TSC: 0 errors | Jest: 15/15 suites, 95/95 tests passing
- No known bugs

---

## v0.6 — 2026-02-15

### Significant Changes
- **Robust Profile Creation**: Fixed an issue where new sign-ups resulted in empty profiles. Added a database trigger to auto-create profiles on user creation and a client-side fallback mechanism ensuring profile existence on sign-in.
- **Settings Fix**: Corrected a column name mismatch in the delete account logic (`user_id` instead of `created_by` for groups deletion).

### Current Status
- TSC: 0 errors | Jest: 14/14 suites, 94/94 tests passing
- No known bugs

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
