## v1.7.7 - 2026-03-28
*Developed using Claude Sonnet 4.6. Branch: 1.7.7 (Expo Version: 1.7.2, Build: 12).*

### Calendar Import & UI Fixes

#### Per-Group Select/Deselect All
**File:** `components/birthday/CalendarImportModal.tsx`
- Added "Select All" / "Deselect All" button for each calendar group
- Users can now select/deselect all events within a group independently
- Global "Select All" at top remains unchanged
- Restructured header row to separate expand/collapse from group selection logic

#### Consolidate Duplicate Birthday Names
**File:** `hooks/useCalendarImport.ts`
- Strip common birthday suffixes during import: `'s 1st Birthday`, `'s Birthday`, `Birthday`
- Transforms "Adrian YO's 1st Birthday" → "Adrian YO", "Claudio Costantini's 47th Birthday" → "Claudio Costantini"
- Deduplication now works on cleaned names — multiple year variants of same person appear as one entry
- Applies to display name and dedup matching against existing birthdays

#### Add-to-Group List Full Screen
**File:** `app/group/[id].tsx`
- Removed `maxHeight: 400` constraint on FlatList in "Add People to Group" modal
- List now fills available screen space, enabling scrolling through large groups

#### Hide Dark Mode Toggle
**File:** `app/(tabs)/profile.tsx`
- Removed "Appearance" section and ThemeToggle component from Profile screen
- Theme context and underlying dark mode functionality remain intact
- Can be re-added later without code changes

#### Tests
- Updated `useCalendarImport` test expectations for cleaned birthday names
- All 115 tests passing (17 suites)

---

## v1.7.6 - 2026-03-14
*Developed using Claude Haiku 4.5. Branch: 1.7.6 (Expo Version: 1.7.2, Build: 12).*

### Contact Photo Refetch — iOS Picker Image Fallback

#### Problem
iOS `presentContactPickerAsync()` does not include image data in its response. When users linked a contact, the picker returned `null` for the image field, so auto-imported photos never arrived.

#### Solution
Added fallback refetch logic in `pickContact()`:
- After picker returns, if `imageUri` is null, request contacts permission
- Refetch the contact via `getContactsAsync()` with `Contacts.Fields.Image`
- Extract the image URI from the refetched contact data
- Works silently — if permission denied or fetch fails, continues without image
- **Files:** `hooks/useContactLink.ts`, `app/person/[id].tsx`, `hooks/__tests__/useContactLink.test.tsx`

#### Tests
- Updated `pickContact extracts phone` test to mock permission denial for image refetch
- Added new test: `pickContact refetches image when picker does not return it`
- Added dev-mode logging in `person/[id].tsx` for photo import failures
- All 115 tests passing (17 suites)

---

## v1.7.5 - 2026-03-14
*Developed using Claude Opus 4.6. Branch: 1.7.5 (Expo Version: 1.7.2, Build: 12).*

### Contact Linking Fix + Contact Photo Auto-Import

#### Contact Linking — iOS Permission Compatibility Fix
**Files:** `hooks/useContactLink.ts`, `components/birthday/ContactLinkButton.tsx`, `contexts/BirthdaysContext.tsx`, `app/person/[id].tsx`
- **Root cause**: App called `getContactsAsync()` (requires permissions) after linking via `presentContactPickerAsync()` (no permissions needed)
  - On older iOS or with limited permissions, `getContactsAsync()` would fail or return empty
  - Users saw "Contact not found" error and messaging failed
- **Solution**: Store contact data at pick time
  - Added `contact_phone` and `contact_name` columns to `people` table
  - `LinkedContact` interface now includes `phone` field extracted from picker response
  - `ContactLinkButton` displays stored name directly; graceful fallback to "Linked contact" instead of error
  - Messaging uses stored phone first; fallback to API only for legacy contacts
- **Backward compatibility**: Legacy contacts with only `contact_id` still work via fallback re-fetch

#### Contact Photo Auto-Import
**Files:** `app/person/[id].tsx`, `components/birthday/BirthdayForm.tsx`
- When linking a contact, auto-import contact's profile photo to birthday
- Only imports if birthday has no existing photo
- Uses existing `uploadImage()` utility for consistent processing
- Works silently — import failure doesn't block contact linking

#### Database Changes
**File:** `supabase-schema.sql`
- Added `contact_phone TEXT` to `people` table
- Added `contact_name TEXT` to `people` table
- Run SQL migration in Supabase dashboard to add columns (backward compatible)

### Tests
- Added test: `pickContact extracts phone when contact has phone numbers`
- Updated tests for new `phone` field in `LinkedContact`
- All 114 tests passing (17 suites). TypeScript: 0 errors.

---

## v1.7.3 - 2026-03-14
*Developed using Claude Haiku 4.5. Branch: 1.7.3 (Expo Version: 1.7.3, Build: 13).*

### CelebrationBanner — Mascot GIF Background Cleanup

#### White Background Removal
**File:** `assets/mascot-jumping.gif`
- User manually cleaned up remaining white background pixels between mascot legs and around edges
- Refined GIF with improved transparency in both light and dark mode
- File size: 2.9MB → 2.0MB (30% reduction)
- All 120 frames processed with better edge and pocket cleanup

### Version Bump
- Bumped version to 1.7.3, build number to 13 (`app.json`, `package.json`)

### Tests
- All 112 tests passing (17 suites). TypeScript: 0 errors.

---

## v1.7.4 - 2026-03-14
*Developed using Claude Opus 4.6. Branch: 1.7.4 (Expo Version: 1.7.4, Build: 14).*

### Calendar Import — Multi-Calendar Support with Collapsible UI

#### Feature Enhancement
**Files:** `hooks/useCalendarImport.ts`, `components/birthday/CalendarImportModal.tsx`
- **Multi-calendar support**: Import from ALL calendars, not just iOS Birthdays calendar
  - Users can now import birthdays saved in Personal, Work, or any custom calendar
- **Grouped UI**: Collapsible calendar sections
  - Birthdays calendar pinned first, others alphabetically
  - Each section shows calendar name + event count
  - Tap to expand/collapse; expanded by default for Birthdays calendar
  - Selection count shown per section
- **Smart date ranges**:
  - Birthday calendar: 2000–current+2 years (catches all historical birthdays)
  - Other calendars: ±1 year from today (captures recurring annual events without noise)
- **Maintained deduplication**: Deduplicates by name within each calendar + detects duplicates against existing birthdays

#### UI Improvements
- Section headers with chevron icon indicating expand/collapse state
- Events indented under their calendar for visual hierarchy
- Summary shows total events and number of calendars
- Select All / Deselect All works across all calendars

### Tests
- Added test for skipping calendars with 0 events
- Updated all existing tests for new grouped structure
- All 113 tests passing (17 suites). TypeScript: 0 errors.

---

 ## v1.7.2 - 2026-03-13
*Developed using Gemini. Branch: 1.7.2 (Expo Version: 1.7.2, Build: 12).*

### CelebrationBanner — Animated Mascot Redesign

#### Animated Mascot GIF with Transparent Background
**Files:** `components/birthday/CelebrationBanner.tsx`, `assets/mascot-jumping.gif`
- Converted `mascot-jumping.mp4` → `mascot-jumping.gif` using pixel-level flood-fill BFS background removal (120 frames processed individually)
- Only edge-connected white pixels removed → frosting, candle, hat details preserved
- Installed `expo-av` for video playback; switched to `expo-image` for GIF rendering
- GIF plays once on tab focus (`useFocusEffect` + key-based remount), replays on mascot tap
- Animation is muted, non-looping

#### Banner Layout
**File:** `components/birthday/CelebrationBanner.tsx`
- Side-by-side layout: animated mascot left, person info right
- Two 🎉 emojis flanking person avatar on each side
- Banner height tightened to match animation height (`paddingVertical: 0`)
- Mascot display area: 172×172px

#### Assets
- `assets/mascot-jumping.gif` — 2.9MB, 325px wide, 15fps, transparent background

### Version Bump
- Bumped version to 1.7.2, build number to 12 (`app.json`, `package.json`)

### Tests
- All 112 tests passing (17 suites). TypeScript: 0 errors.

---

 ## v1.7.1 - 2026-03-13
*Developed using Gemini. Branch: 1.7.1 (Expo Version: 1.7.1, Build: 11).*

### Profile Tab — Layout & Mascot Polish

#### 1. Mascot Circular Frame
**File:** `app/(tabs)/profile.tsx`
- Added circular container around profile mascot with purple (`#512D85`) border
- Fixed light background (`#FAF8F5`) inside circle — consistent in both light and dark mode
- Mascot enlarged by 20% over original base size

#### 2. Layout Spacing Improvements
**File:** `app/(tabs)/profile.tsx`
- Moved all content up — removed flex stretch on header section
- Increased spacing between Appearance toggle, Sign Out button, and version label
- Section gaps increased (16→28px), version margin (8→16px), header bottom gap set to 40px

### Version Bump
- Bumped version to 1.7.1, build number to 11 (`app.json`, `package.json`)

### Tests
- All 112 tests passing (17 suites).
- TypeScript: 0 errors

---

 ## v1.7.0 - 2026-03-13
*Developed using Claude Haiku 4.5. Branch: 1.7.0 (Expo Version: 1.7.0, Build: 10).*

### UI Polish — Tester Feedback Batch 1 (5 Improvements)

#### 1. Birthday Profile Stat Boxes Reorganized
**File:** `app/person/[id].tsx` (lines 220-240)
- Swapped stat card layout: label now appears on top, value below
- "years old" label renamed to "Turning" for clarity
- Stat boxes now show: "Days left" / "51" and "Turning" / "26" (instead of "51" / "days left")
- Improved visual hierarchy and consistent labeling with person detail screen

#### 2. Profile Avatar Removed from Tab TopBars
**Files:** `app/(tabs)/index.tsx`, `app/(tabs)/search.tsx`, `app/(tabs)/groups.tsx`
- Removed circular profile avatar from top-left of all main tab screens
- Avatar appears only in Profile tab (bottom) to avoid redundancy
- Added `showAvatar={false}` prop to TopBar components
- Removed unused avatar fetch logic from Home tab

#### 3. Birth Year 200-Year Validation
**File:** `components/birthday/BirthdayForm.tsx` (lines 174-181)
- Added validation: rejects birth years more than 200 years in the past
- Also rejects future years (year > current year)
- Error message: "Invalid Year"
- Prevents invalid data entry in birthday form

#### 4. Add Birthday Button Moved to TopBar
**Files:** `app/(tabs)/index.tsx`, `app/(tabs)/search.tsx`
- Replaced floating action button (FAB) at bottom-right with top-right "+" icon in TopBar
- Matches Groups tab interaction pattern
- `rightAction` prop on TopBar displays green `add-circle-outline` icon (size 26)
- Deleted unused `components/ui/FAB.tsx` and `FAB.test.tsx` (3 tests removed)

#### 5. Action Icon Order Consistency
**File:** `app/group/[id].tsx` (lines 178-191)
- Reordered action icons in group detail: Share → Edit → Delete
- Matches person detail screen icon order
- Both screens now use consistent size (22) and gap (18)
- Person detail already had correct order; group detail updated

### Tests
- All 112 tests passing (17 suites).
- TypeScript: 0 errors
- Note: 3 tests removed with deleted FAB component (was 115 tests in v1.6.4)

---

## v1.6.4 - 2026-03-09
*Developed using Claude Opus 4.6. Branch: 1.6.4 (Expo Version: 1.6.4, Build: 9).*

### QA Production-Readiness Audit & Fixes

#### Account Deletion Overhaul
- **Edge Function**: Reworked account deletion flow to use Supabase Edge Function (`supabase/functions/delete-user/index.ts`) + CASCADE instead of manual client-side data deletion, eliminating partial-deletion risk
- **Storage Cleanup**: Added photo cleanup (profiles, people, groups) before account deletion (`app/settings.tsx`)
- **Notification Cleanup**: Added `cancelAllScheduledNotificationsAsync` before account deletion (`app/settings.tsx`)
- **Graceful Sign-Out**: Wrapped `signOut()` in try/catch to handle post-deletion sign-out failures (`app/settings.tsx`)
- **HTTP 405 Guard**: Added method guard to Edge Function, rejecting non-POST requests (`supabase/functions/delete-user/index.ts`)

#### Code Quality & Production Polish
- **DEV Guards**: Guarded all `console.log`/`console.warn` with `__DEV__` in production paths (`app/_layout.tsx`, `hooks/useNotifications.ts`)
- **Dark Mode Flash Fix**: Fixed dark mode flash on loading/splash screens using `Appearance.getColorScheme()` (`app/_layout.tsx`, `app/index.tsx`)
- **Theme Compliance**: Replaced all hardcoded colors in `app/index.tsx` and `app/settings.tsx` with `useTheme()`
- **Type Safety**: Removed `as any` cast in `modal.tsx` error handling, uses proper type narrowing (`app/modal.tsx`)
- **Dynamic Version**: `APP_VERSION` now reads dynamically from `expo-constants` instead of hardcoded string (`lib/constants.ts`)
- **Legal Dates**: Updated Privacy Policy and Terms of Service dates to March 8, 2026 (`app/legal.tsx`)
- **Label Fix**: Fixed person detail label from "turning" to "years old" (`app/person/[id].tsx`)
- **Button Font**: Added `fontFamily: 'DMSans_700Bold'` to Button component (`components/ui/Button.tsx`)
- **Deep Link Fallback**: Added App Store fallback redirect in deep link handler (`docs/index.html`)
- **Dead Code Removal**: Removed dead FAB import and unused `showFAB` property from tabs layout (`app/(tabs)/_layout.tsx`)
- **TypeScript Config**: Excluded `supabase/` from TypeScript compilation (`tsconfig.json`)
- **Version Bump**: Bumped version to 1.6.4, build number to 9 (`app.json`, `package.json`)

### Tests
- All 115 tests passing (18 suites).
- TypeScript: 0 errors

---

## v1.6.3 - 2026-03-04
*Developed using Claude Opus 4.6 + Haiku 4.5. Branch: 1.6.3 (Expo Version: 1.4.0, Build: 6).*

### UI/UX Improvements

#### Shared Group Import Deduplication
**File:** `app/shared/[code].tsx:239-254`
**Improvement:** When a user receives a shared group they already own, the app now detects the duplicate and shows an alert with three options:
- **Cancel** — dismiss and return to group list
- **Update** — refresh the existing group with latest members from the share link
- **Duplicate** — create a separate copy with a new group name

**Detection:** Checks for existing imports by:
1. `source_share_code` (groups imported from this exact share link before)
2. Group name (as fallback, catches manually-created groups or pre-tracking imports)

#### Brand Rebrand: Primary Color Orange → Green
**Files:** 17 files across code, tests, HTML, and assets
**Change:** Updated primary color from `#E07A5F` (orange) to `#4CAF50` (green)
- **Theme:** `lib/theme.ts` (light & dark modes)
- **Components:** `ErrorBoundary.tsx`, `BirthdayForm.tsx`, `GroupForm.tsx`, `Button`, `ThemeToggle`
- **Screens:** `app/index.tsx`, `app/_layout.tsx`, `app/settings.tsx`
- **Tests:** 4 test files
- **Assets:** Icon recoloring (icon.png, adaptive-icon.png, splash-icon.png, og-image.png)
- **Docs:** `docs/index.html`
- **Error UI:** "Remove Photo" button changed to semantic red (`#DC3545`) for better UX

### Tests
- All 115 tests passing (18 suites).
- TypeScript: 0 errors

---

## v1.6.2 - 2026-03-04
*Developed using Claude Opus 4.6. Branch: 1.6.2 (Expo Version: 1.4.0, Build: 6).*

### Security — RLS Policy Hardening

#### SEC-01: Shared Data Over-Exposure via Blanket RLS Policies
**Severity:** HIGH
**Issue:** The RLS policies "Public can view shared people" and "Public can view shared groups" granted SELECT access to ALL rows where `share_code IS NOT NULL`. Anyone with the Supabase anon key could enumerate every shared person and group in the database without knowing any share codes.

**Fix — Database Changes:**
- Dropped 4 insecure RLS policies: "Public can view shared people", "Public can view shared groups", "Public can view people in shared groups", "Public can view person_groups in shared groups"
- Dropped 2 old helper functions: `is_person_in_shared_group()`, `is_person_group_in_shared_group()`
- Created 3 new SECURITY DEFINER RPC functions:
  - `get_shared_person(p_share_code)` — returns shared person only if share_code matches
  - `get_shared_group(p_share_code)` — returns shared group only if share_code matches
  - `get_shared_group_members(p_share_code)` — returns group members only if share_code matches

**Fix — App Code Changes:**
- `app/shared/person/[code].tsx`: Replaced direct `.from('people').select().eq('share_code', code)` with `supabase.rpc('get_shared_person', { p_share_code: code })`
- `app/shared/[code].tsx`: Replaced nested join query with two RPC calls: `get_shared_group()` + `get_shared_group_members()`
- Removed `notes` from `SharedPerson` interface in both shared view files (private data never exposed to unaware callers)
- Removed `notes` from import logic in both files (not available from RPC functions)

**Security Improvement:** Shared data can now only be accessed by providing the exact share code. No more blanket enumeration of all shared records.

### Tests
- All 115 tests passing (18 suites).
- TypeScript: 0 errors

---

## v1.6.1 - 2026-03-03
*Developed using Claude Opus 4.6 + Haiku 4.5. Branch: 1.6.1 (Expo Version: 1.4.0, Build: 6).*

### Critical Bug Fixes

#### BUG-01: Invalid Dates Accepted (Feb 31, Apr 31, etc.)
**File:** `components/birthday/BirthdayForm.tsx:162-181`
**Severity:** CRITICAL
**Fix:** Implemented month-specific day limits. February max 29 (with leap year detection), April/June/Sept/Nov max 30, others max 31. Validation now rejects Feb 31, Apr 31, etc. with proper error messages.

#### BUG-02: getAge() Returns Wrong Age (Off by +1)
**File:** `lib/dateHelpers.ts:47-60`
**Severity:** CRITICAL
**Fix:** Changed from computing "turning" age to actual current age. Now checks if birthday has passed this calendar year and subtracts 1 if not yet occurred.

#### BUG-03: Feb 29 Birthdays Never Show Celebration Banner (3 of 4 Years)
**File:** `lib/dateHelpers.ts:62-75`
**Severity:** CRITICAL
**Fix:** Added special case handling in `isBirthdayToday()`. Feb 29 birthdays now match Feb 28 in non-leap years, allowing the celebration banner to display correctly.

#### BUG-04: Group Assignment Lost When Editing Birthday via Group Screen
**File:** `components/birthday/BirthdayForm.tsx:79`
**Severity:** CRITICAL
**Fix:** Changed state initialization from if/else (one wins, other discarded) to preserving existing groups and adding preselected group if not already present.

#### BUG-05: Avatar Image Retry Timer Causes Memory Leak
**File:** `components/ui/Avatar.tsx:23-50`
**Severity:** HIGH
**Fix:** Implemented `useRef` to track timeout, cleared on unmount. Prevents setState on unmounted component and React warnings during fast navigation.

#### BUG-06: Notification Reminders Fire on Wrong Day for Feb 29 (Leap Year Issue)
**File:** `hooks/useNotifications.ts:84-107`
**Severity:** HIGH
**Fix:** Removed `repeats: true` from notification trigger for Feb 29 birthdays. Now uses `getNextBirthday()` to compute correct date for each year, handling leap year edge case properly.

### Tests
- All 115 tests passing (18 suites).
- No regressions from bug fixes.

### Verification
- TypeScript: 0 errors
- Jest: 115/115 tests passing
- Manual testing: All 6 bugs verified fixed on iOS device

---


All notable changes to Birthminder will be documented in this file.

---
 
## v1.6.0 - 2026-03-01
*Developed using Claude Haiku + Sonnet. Branch: 1.6.0-production-readiness (Expo Version: 1.4.0, Build: 6).*

### Production Readiness — Performance & Security

#### Performance
- **Notification scheduling batching**: Replaced sequential `await` loop with `Promise.all` chunked in batches of 50. Prevents UI thread blocking when scheduling 300+ birthday notifications.
- **Orphaned notification cleanup**: Deleting a birthday now cancels all its scheduled notifications before removing from database.
- **Image caching fix**: Removed `?t=${Date.now()}` cache-busting query parameter from uploaded image URLs. `expo-image` disk cache now works correctly since each upload already gets a unique filename.

#### Security
- **Upload file size validation**: Added client-side 5 MB file size check before image processing and upload to Supabase Storage.
- **RLS policy optimization**: Denormalized `user_id` onto `person_groups` junction table, replacing correlated `EXISTS` subqueries with direct `auth.uid() = user_id` index lookups (O(1) vs O(n) per row).

#### Schema Changes (Supabase SQL Editor)
- Added `user_id UUID NOT NULL` column to `person_groups` table (backfilled from `people.user_id`)
- Added `idx_person_groups_user` index
- Replaced 3 RLS policies on `person_groups` with direct `user_id` checks
- Documented `reminder_days INTEGER[] DEFAULT '{0}'` in `supabase-schema.sql` (column already existed in live DB)

#### Code Changes
- All `person_groups` insert/upsert calls now include `user_id` (7 locations across 3 files)
- `useNotifications.ts`: new `cancelNotificationsForPerson()` function exported
- `person/[id].tsx`: calls `cancelNotificationsForPerson` before `deleteBirthday`
- `uploadImage.ts`: returns clean URL without cache-buster; validates file size before processing

### Tests
- All 115 tests passing (18 suites).
- Updated `modal_photo.test.tsx` mock to include `getInfoAsync` and removed `?t=` URL expectation.

---

## v1.5.4 - 2026-03-01
*Developed using Claude Haiku. Branch: 1.5.4 (Expo Version: 1.4.0, Build: 6).*

### Fixed
- **Sharing & Deep-Linking Audit**: Fixed critical sharing and deep-linking issues.
  - **Double-Link Bug**: Removed duplicate `url` parameter from `Share.share()` calls. Previously, both `message` and `url` contained the same link, causing it to appear twice in iMessage/WhatsApp share sheets.
  - **Missing Shared Person Route**: Created `app/shared/person/[code].tsx` to handle shared individual birthday deep links. Previously, clicking a shared person link showed "Unmatched Route" error.
  - **Route Declaration**: Added `shared/person/[code]` route declaration to `app/_layout.tsx`.
- **Edit Group Modal Positioning**: Fixed Edit Group modal overlapping with iOS dynamic island by adding `paddingTop: insets.top`.
- **Version Metadata**: Updated `lib/constants.ts` `APP_VERSION` from `1.0.0` to `1.5.3`.
- **Error Color Consistency**: Changed error text color from brand orange (`#E07A5F`) to semantic red (`#DC3545`) in all auth screens for better UX clarity.

### Tests
- Multi-agent conflict scan performed — no code conflicts detected.
- All 115 tests passing (18 suites).

### Verification
- Sharing: Single link now appears in share sheets (person + group + groups tab).
- Deep-linking: Shared person links now navigate correctly to `birthminder://shared/person/CODE` route.
- Edit Group: Modal content no longer overlaps with dynamic island on iPhone 14+.
- Tests: No regressions from new shared person route.

## v1.5.3 - 2026-03-01
*Developed using Gemini / Claude Opus. Branch: 1.5.3 (Expo Version: 1.4.0, Build: 6).*

### Fixed
- **Change Password / Reset Password screen**: Fixed issue where the screen was not showing properly. Screen now displays and functions correctly.

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
