# Birthminder — Project Guide & Reference

---

# HOW TO START — READ THIS FIRST

You are an AI agent working on Birthminder. The app is **feature-complete**
and has been built through versions v0.1 to v0.10. All screens, features,
and tests are implemented and working.

Do the following in order:
1. Read this entire file before doing anything
2. Read CHANGELOG.md for detailed version history
3. Run `npx tsc --noEmit` and `npx jest --no-cache` to verify code health
4. Understand the existing architecture before making any changes
5. Never replace a file with placeholder comments — always write complete code

**The project root is `Birthminder/Birthminder/` (the inner folder is the
Expo project). The outer folder contains this CLAUDE.md and the app logo.**

---

# PART 1: ENVIRONMENT SETUP (COMPLETED)

All setup steps below have been completed. This section is kept as
reference only. Do NOT re-run these steps.

- Node.js and npm: installed
- Global tools: expo-cli, eas-cli installed
- Expo project: created with TypeScript template, renamed to Birthminder
- All dependencies: installed (see package.json for full list)
- .env file: created with Supabase credentials (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)
- Supabase database: tables, RLS policies, triggers, and storage configured
- Folder structure: fully built out
- EAS project: linked (projectId: f094907d-a438-4375-aec5-3fe9329d380c)

### To restore from a fresh clone:
```
cd Birthminder
npm install
```
Then create `.env` with Supabase credentials before running.

---

# PART 2: APP SPECIFICATION

---

## Project Overview

Birthminder is a mobile app that helps users remember and organize
birthdays. Warm and personal in light mode, sleek and modern in dark mode.
Familiar social-app layout so users feel at home immediately.

---

## Tech Stack
- **Framework**: Expo SDK 54 (React Native), TypeScript, Expo Router.
- **Backend/Auth**: Supabase (PostgreSQL + Auth + Storage).
- **Native APIs**: `expo-notifications`, `expo-calendar`, `expo-contacts`, `expo-image`, `expo-image-manipulator`, `expo-image-picker`.
- **Utilities**: `date-fns`, `AsyncStorage`, `Hermes`.
- **Testing**: Jest + @testing-library/react-native.

## Guiding Principles

### Git & Branching
- **Branch Preservation**: ALWAYS keep individual version branches (e.g., `1.5.0`, `1.5.1`) active and push them to GitHub.
- **Merge Flow**: Commit changes to the feature/version branch FIRST, push to origin, and then merge into `main` only when instructed.
- **Versioning**: Maintain Expo version (marketing version) and build numbers accurately in `app.json` and `package.json` regardless of the technical Git branch name.
- **History**: GitHub should reflect the full project history with all development branches preserved as save points.

### Navigation & Routing
- **Layout**: 4 icon-only tabs (Home, Search/Notifications, Groups, Profile) with X/Twitter-style FAB (Home/Search/Groups).
- **Theme**: Light (#FAF8F5) and Dark (#000000) modes, persisted and toggled in Profile.
- **Rules**: Icons only in tabs, active dot indicator, 80px height, TopBar on all screens (Avatar Left | Title Center | Action Right).

---

## Top Bar

Every main screen has a top bar:
- User circular profile avatar — top LEFT (tappable, opens Profile tab)
- Screen title or app logo — CENTER
- Optional action icon — RIGHT (gear on Profile, + on Groups)
- Subtle bottom border using theme color, no heavy shadow

---

### Screens
- **Auth Flow**: Splash, Onboarding (3 slides), Sign Up (with photo), Login, Forgot Password.
- **Home**: Today's celebration banner + feed of upcoming birthdays (30 days).
- **Search**: Live search with auto-focus and alphabetical fallback.
- **Groups**: List of groups with inline creation (+ icon/modal) and native sharing.
- **Notifications**: SectionList grouped by month (rolling order) for all birthdays.
- **Profile & Settings**: Theme toggle (dark/light), legal links, and account deletion.
- **Modals & Details**: 
  - Add/Edit Birthday: Full form, photo pipeline (pick/optimize/upload), inline group creation.
  - Person/Group Details: Stats, photo, notes, and management actions (Edit, Share, Delete).
  - Shared Views: Public landing pages for importing shared persons or groups with dedup.

---

### Core Features
- **Accounts**: Supabase Auth, private data, automated profile creation.
- **Birthdays**: CRUD with optimized photo storage and rolling calendar view.
- **Messaging (v1.4.1)**: WhatsApp/iMessage deep links with number sanitization and pre-filled greetings.
- **Notifications (v1.4.1)**: Automated 8:00 AM local time day-of alerts with sound.
- **Import (v1.4.1)**: Zero-lag iOS Calendar import with deduplication logic.
- **Sharing**: Unique share codes for groups/persons with HTTPS/OG landing pages.
- **Theme**: Full light/dark mode support throughout the app.

### Development Rules
- **Tech**: Strict TypeScript, Supabase, Expo Router, `expo-image` (cache).
- **Environment**: Use `.env` (never commit), Windows-based dev (no local iOS simulator).
- **UI**: Icons-only tabs, active dot indicator, FAB on Home/Search/Groups, TopBar on all.
- **Workflow**: `npx tsc` and `npx jest` required before any commit/visual test.
- **Versioning**: Sync `app.json` (version/buildNumber) and `package.json` for all releases.

---

## VERIFICATION LOOP — REQUIRED AFTER EVERY CHANGE

After building any screen, feature, or fix, do all of the following
before moving on:

STEP 1 — CODE INTEGRITY
Run: npx tsc --noEmit
Note: Errors from node_modules_old/ are false positives (leftover folder).
Source code must produce ZERO errors.

STEP 2 — UNIT TESTS
Run: npx jest --no-cache
Must reach 100% pass rate. Current baseline: 17 suites, 112 tests (v1.7.0).
Fix any failures before continuing.

STEP 3 — CHECKLIST
Check each item:
[ ] All colors come from useTheme() — no hardcoded values
[ ] Dark mode and light mode both render correctly
[ ] TypeScript — no type errors, no use of "any"
[ ] Empty states handled with friendly message
[ ] No console.log left in production code

STEP 4 — CONFIRM
Write: "Change [description] is complete and verified."
Then wait for user confirmation before continuing.

---

# PART 3: DEVELOPMENT WORKFLOW

---

## Simulator-less Testing Loop

This project is developed on a Windows machine with NO iOS simulator.
All testing happens via Expo Go on a physical iPhone.

### Pillar 1 — Code Integrity
Run after every modification:
   npx tsc --noEmit
Source code must produce ZERO errors. Ignore errors from node_modules_old/.

### Pillar 2 — Unit Validation
For every new component, hook, or screen:
1. Write a test file in a __tests__ folder next to the source
2. Use @testing-library/react-native with fireEvent for interactions
3. Run: npx jest --no-cache
4. Must reach 100% pass rate (currently 112/112 tests) — fix failures before continuing
5. Only tell the user "Ready for visual test" once headless tests pass

### Pillar 3 — Manual Feedback
The user tests on their iPhone via Expo Go.
Start the dev server with: npx expo start
The user scans the QR code and reports visual/functional issues.
Fix anything they report, then re-run Pillar 1 and 2.

---

## Versioning Workflow — SINGLE SOURCE OF TRUTH

All version numbers must stay synchronized across three systems:
app.json (Expo/Apple), package.json (npm), and Git (tags/branches).

### The three version locations:
1. `app.json` → `expo.version` (marketing version shown to users)
2. `app.json` → `expo.ios.buildNumber` (Apple internal build number)
3. `package.json` → `version` (npm manifest)

### Version bump procedure (run for every release):
When bumping to version X.Y.Z:

1. **Update files:**
   - `app.json`: set `expo.version` to `"X.Y.Z"`
   - `app.json`: set `expo.ios.buildNumber` to `"X.Y.Z"`
   - `package.json`: set `version` to `"X.Y.Z"`

2. **Git automation:**
   - Check for uncommitted changes. If dirty, commit or stash first.
   - Commit the version changes: `chore: bump version to X.Y.Z`
   - Create git tag: `git tag vX.Y.Z`

3. **Verification:**
   - Confirm all three files reflect the same version.
   - Confirm the git tag exists locally: `git tag --points-at HEAD`

4. **Update CHANGELOG.md** with a new section for `vX.Y.Z`.

### Branch naming (from v1.0.0 forward):
- `1.0.0`, `1.0.1`, `1.0.2`, etc. — version branches for testing
- `main` — primary branch, only receives merges after user testing
- Tags: `v1.0.0`, `v1.0.1`, etc. — point to the commit on each branch

### Workflow:
1. Create branch `X.Y.Z` from main
2. Make all changes on that branch
3. User tests via `npx expo start` on physical device
4. If approved → merge to main and push
5. If issues found → fix on branch, re-test, then merge

---

# PART 4: CURRENT PROJECT STATE

**Last Updated:** 2026-03-28
**Current Version:** v1.7.7 (Branch: main)
**Build Number:** 12 (dev build, 1.7.6)
**Test Status:** 17 suites, 115 tests — all passing
**Build Status:** Calendar UI fixes & name consolidation (v1.7.7). Merged to main. Runtime version 1.7.6 for EAS update compatibility.
**Pre-Flight Audit:** PASSED (v1.6.4)
**EAS Secrets:** EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY configured
**GitHub Pages:** Enabled — serves OG landing page at https://robertop3000.github.io/Birthminder/

---

## Complete File Structure

```
Birthminder/                          # Outer folder
├── CLAUDE.md                         # This file
│
└── Birthminder/                      # Expo project root
    ├── app.json                      # Expo config (bundleId: com.birthminder.app)
    ├── eas.json                      # EAS Build config
    ├── package.json                  # Dependencies
    ├── tsconfig.json                 # Strict TS, extends expo/tsconfig.base
    ├── jest.setup.js                 # Comprehensive mocks (RN, Expo, Supabase)
    ├── supabase-schema.sql           # Complete DB schema (canonical reference)
    ├── supabase/
    │   └── functions/
    │       └── delete-user/
    │           └── index.ts          # Edge Function for Apple-compliant account deletion
    ├── CHANGELOG.md                  # Detailed version history
    ├── .env                          # Supabase credentials (NOT committed)
    ├── docs/
    │   ├── index.html                # GitHub Pages OG landing page (share link redirector)
    │   └── og-image.png              # Preview image for social sharing
    │
    ├── app/
    │   ├── _layout.tsx               # Root Stack + providers + font loading
    │   ├── index.tsx                 # Splash/loading screen
    │   ├── modal.tsx                 # Add/Edit Birthday (photo pipeline)
    │   ├── settings.tsx              # Legal links + Delete Account
    │   ├── legal.tsx                 # Privacy Policy + ToS
    │   ├── (auth)/
    │   │   ├── _layout.tsx           # Auth Stack navigator
    │   │   ├── index.tsx             # Session check + redirect
    │   │   ├── onboarding.tsx        # 3 slides, skippable
    │   │   ├── login.tsx             # Email + password
    │   │   ├── signup.tsx            # Name, email, password, photo
    │   │   ├── forgot-password.tsx   # Email → Supabase reset
    │   │   └── reset-password.tsx    # Change/reset password (settings + recovery)
    │   ├── (tabs)/
    │   │   ├── _layout.tsx           # Bottom tabs + FAB visibility
    │   │   ├── index.tsx             # Home (today + upcoming 30 days)
    │   │   ├── search.tsx            # Live search, auto-focused
    │   │   ├── groups.tsx            # Group list + create modal
    │   │   ├── notifications.tsx     # Month-grouped SectionList
    │   │   └── profile.tsx           # Avatar, name, theme toggle
    │   ├── person/
    │   │   └── [id].tsx              # Person detail + share
    │   ├── group/
    │   │   └── [id].tsx              # Group detail + member management
    │   └── shared/
    │       ├── [code].tsx            # Public shared group view
    │       └── person/
    │           └── [code].tsx        # Public shared person view
    │
    ├── components/
    │   ├── ErrorBoundary.tsx          # Class component, catches render errors
    │   ├── ui/
    │   │   ├── Avatar.tsx             # expo-image with 3-retry + fallback icon
    │   │   ├── Button.tsx             # primary/secondary/text variants
    │   │   ├── Card.tsx               # Generic pressable container
    │   │   ├── FAB.tsx                # Floating Action Button (56x56, bottom-right)
    │   │   ├── TopBar.tsx             # Avatar | Title | Action
    │   │   └── ThemeToggle.tsx        # Sun/Moon animated toggle
    │   ├── birthday/
    │   │   ├── BirthdayCard.tsx        # Avatar + name + date + groups + days badge
    │   │   ├── BirthdayForm.tsx        # Full form with inline group creation
    │   │   └── CelebrationBanner.tsx   # Today's birthday celebration card
    │   └── group/
    │       ├── GroupCard.tsx           # Photo/color bar + name + count + share
    │       ├── GroupForm.tsx           # Name + 8 color presets + photo picker
    │       └── MemberList.tsx          # Renders list of BirthdayCards
    │
    ├── contexts/
    │   ├── ThemeContext.tsx            # Mode + colors + toggleTheme, persisted
    │   ├── BirthdaysContext.tsx        # CRUD + refetch, fetches people + person_groups
    │   └── GroupsContext.tsx           # CRUD + sharing + member mgmt, fetches with counts
    │
    ├── hooks/
    │   ├── useTheme.ts                # Re-exports ThemeContext
    │   ├── useAuth.ts                 # Session, signUp/In/Out, ensureProfile
    │   ├── useBirthdays.ts            # Re-exports BirthdaysContext
    │   ├── useGroups.ts               # Re-exports GroupsContext
    │   └── useNotifications.ts        # Permission, scheduling, preferences
    │
    ├── lib/
    │   ├── supabase.ts                # Client init (AsyncStorage session persistence)
    │   ├── theme.ts                   # ThemeColors type + light/dark color objects
    │   ├── dateHelpers.ts             # Birthday math (leap year handling, Feb 29→28)
    │   ├── uploadImage.ts              # Reusable image upload (resize → base64 → Supabase Storage)
    │   └── constants.ts               # APP_NAME, APP_VERSION, storage keys, notification options, SHARE_BASE_URL
    │
    └── assets/
        ├── icon.png                   # Custom Birthminder logo (1024x1024)
        ├── adaptive-icon.png          # Android adaptive icon
        └── splash-icon.png            # Splash screen logo
```

---

## State Management Architecture

Provider order in app/_layout.tsx:
ErrorBoundary → ThemeProvider → BirthdaysProvider → GroupsProvider

| Context | State | Key Methods |
|---------|-------|-------------|
| ThemeContext | mode (light/dark) | toggleTheme() |
| BirthdaysContext | people[] with person_groups | addBirthday, updateBirthday, deleteBirthday, generatePersonShareCode, refetch |
| GroupsContext | groups[] with member counts | addGroup, updateGroup, deleteGroup, generateShareCode, addPersonToGroup, removePersonFromGroup, refetch |

---

## Supabase Database Schema

Canonical reference: `supabase-schema.sql` in project root.

### Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| profiles | User profile (extends auth.users) | id (PK/FK), display_name, avatar_url, notification_days_before |
| people | Birthday entries | id, user_id (FK), name, birthday_day, birthday_month, birthday_year?, photo_url, notes, share_code |
| groups | Organizing people | id, user_id (FK), name, color, photo_url, share_code, source_share_code |
| person_groups | Junction (many-to-many) | person_id (FK), group_id (FK), user_id (FK — denormalized for O(1) RLS) |

---

## v1.7.7 Changes (Current — Calendar Import UI Fixes)

**Calendar Import — Per-Group Select All (2026-03-28):**
- Added "Select All" / "Deselect All" button for each calendar group header
- Users can toggle all events in a group without affecting other groups
- Restructured header layout to prevent expand/collapse triggering on group select

**Calendar Import — Consolidate Duplicate Names (2026-03-28):**
- Strip birthday suffixes from event titles: `'s 1st Birthday`, `'s 2nd Birthday`, etc.
- "Adrian YO's 1st Birthday" and "Adrian YO's Birthday" now appear as single "Adrian YO" entry
- Applies to display name AND dedup matching against existing birthdays
- File: `hooks/useCalendarImport.ts`

**Add-to-Group — Full Screen List (2026-03-28):**
- Removed `maxHeight: 400` cap on FlatList in "Add People to Group" modal
- List now fills available screen space, allows full scrolling
- File: `app/group/[id].tsx`

**Dark Mode Toggle — Hidden (2026-03-28):**
- Removed "Appearance" section and ThemeToggle from Profile tab
- Theme context and functionality remain intact for future re-enabling
- File: `app/(tabs)/profile.tsx`

**All tests passing:** 17 suites, 115 tests.

---

## v1.7.6 Changes (Contact Photo Refetch)

**Contact Photo Refetch — iOS Picker Image Fallback (2026-03-14):**
- iOS `presentContactPickerAsync()` does not return image data; photos were not auto-importing
- Added fallback refetch logic in `pickContact()`:
  - If picker returns null for image, request contacts permission
  - Refetch contact via `getContactsAsync()` with `Contacts.Fields.Image`
  - Extract image URI from refetched data
  - Works silently if permission denied or fetch fails
- **Files:** `hooks/useContactLink.ts`, `app/person/[id].tsx`, `hooks/__tests__/useContactLink.test.tsx`
- Added dev-mode logging for photo import failures

**All tests passing:** 17 suites, 115 tests.

---

## v1.7.5 Changes (Contact Linking Fix)

**Contact Linking iOS Compatibility (2026-03-14):**
- Fixed "Contact not found" error by storing contact phone and name at link time (from `presentContactPickerAsync()`)
- No longer depends on re-fetching via `getContactsAsync()`, which requires permissions and fails on some iOS versions
- Added `contact_phone` and `contact_name` columns to `people` table
- `ContactLinkButton` displays stored name directly, graceful fallback to "Linked contact"
- Messaging uses stored phone; fallback to API for legacy contacts only
- Backward compatible: existing contacts (contact_id only) still work via fallback

**Contact Photo Auto-Import (2026-03-14):**
- When linking a contact, auto-import contact's profile photo if birthday has no existing photo
- Uses existing `uploadImage()` utility
- Works silently — doesn't block contact linking if import fails

**All tests passing:** 17 suites, 114 tests.

---

## v1.6.4 Changes (QA Audit & Production Polish)

**Account Deletion Overhaul (2026-03-09):**
- Reworked deletion flow to use Edge Function + CASCADE instead of manual client-side data deletion
- Added Supabase Edge Function `delete-user` for Apple-compliant `auth.users` deletion
- Added storage photo cleanup (profiles, people, groups) before account deletion
- Added notification cancellation before account deletion
- Wrapped `signOut()` in try/catch for graceful post-deletion handling
- Added HTTP 405 method guard to Edge Function

**Code Quality & Production Polish (2026-03-09):**
- Guarded all `console.log`/`console.warn` with `__DEV__` in production paths
- Fixed dark mode flash on loading/splash screens using `Appearance.getColorScheme()`
- Replaced all hardcoded colors in `app/index.tsx` and `app/settings.tsx` with `useTheme()`
- Removed `as any` cast in `modal.tsx` error handling -- uses proper type narrowing
- `APP_VERSION` now reads dynamically from `expo-constants`
- Updated Privacy Policy and Terms of Service dates to March 8, 2026
- Fixed person detail label from "turning" to "years old"
- Added `fontFamily: 'DMSans_700Bold'` to Button component
- Added App Store fallback redirect in deep link handler
- Removed dead FAB import and unused `showFAB` property from tabs layout
- Excluded `supabase/` from TypeScript compilation
- Bumped version to 1.6.4, build number to 9

**All tests passing:** 18 suites, 115 tests.

---

## v1.6.3 Changes (UI/UX & Brand)

**Shared Group Import Deduplication (2026-03-04):**
- Fixed duplicate detection when user receives a shared group they already own
- Detection now checks both `source_share_code` (exact import match) and group name (fallback for manually-created or pre-tracking imports)
- Alert shows three options: Cancel, Update (refresh existing), or Duplicate (create new copy)
- File: `app/shared/[code].tsx:239-254`

**Brand Rebrand: Primary Color Orange → Green (2026-03-04):**
- Primary color changed from `#E07A5F` (orange) to `#4CAF50` (green)
- Updated in 17 files: theme.ts, components, screens, tests, HTML, and 4 PNG assets
- Error/destructive actions use semantic red (`#DC3545`) instead of brand color
- Files: `lib/theme.ts`, `ErrorBoundary.tsx`, `BirthdayForm.tsx`, `GroupForm.tsx`, `app/index.tsx`, `app/_layout.tsx`, `app/settings.tsx`, 4 test files, `docs/index.html`, 4 icon PNG assets

**All tests passing:** 18 suites, 115 tests.

---

## v1.6.2 Changes (Security)

**RLS Policy Hardening (2026-03-04):**
- SEC-01: Fixed shared data over-exposure via blanket RLS policies
  - Dropped 4 insecure "Public can view..." RLS policies from people/person_groups
  - Created 3 new SECURITY DEFINER RPC functions: `get_shared_person()`, `get_shared_group()`, `get_shared_group_members()`
  - Updated app to use RPC calls instead of direct table queries for shared views
  - Removed private notes from shared views (data security improvement)
  - Shared data now requires exact share_code — no more enumeration

**Code Changes:**
- `app/shared/person/[code].tsx`: Uses `get_shared_person()` RPC instead of direct query
- `app/shared/[code].tsx`: Uses two RPC calls (`get_shared_group()` + `get_shared_group_members()`) instead of nested join
- Both files: Removed `notes` field and import logic

All 115 tests passing.

---

## v1.6.1 Changes (Recent)

**Critical Bug Fixes (2026-03-03):**
- BUG-01: Invalid dates (Feb 31, Apr 31, etc.) now rejected with month-specific day limits
- BUG-02: getAge() fixed to return current age, not "turning" age
- BUG-03: Feb 29 birthdays show celebration banner on Feb 28 in non-leap years
- BUG-04: All group assignments preserved when editing from group screen
- BUG-05: Avatar retry timeout cleaned up on unmount to prevent memory leak
- BUG-06: Notification leap year handling fixed for Feb 29 (removed repeats:true, use getNextBirthday())

All 115 tests passing.

---

## v1.6.0 Changes (Recent)

**Production Readiness — Performance & Security:**
- Notification scheduling now batched with `Promise.all` in chunks of 50 (was sequential await)
- Deleting a birthday cancels its notifications first (prevents orphaned notifications)
- Image uploads validated at 5 MB client-side before processing
- Removed `?t=` cache-busting from image URLs — `expo-image` disk cache now works correctly
- Denormalized `user_id` onto `person_groups` for O(1) RLS (was correlated subquery per row)
- All `person_groups` inserts now include `user_id`
- Schema file updated with `reminder_days` column and `person_groups.user_id`

**All tests passing:** 18 suites, 115 tests.

---

## Next Steps

1. **Version bump** — Update `app.json` + `package.json` for submission build.
2. **Production build** — Run: `eas build --platform ios --profile production`
3. **TestFlight testing** — Verify notifications, deep links, and sharing on device.
4. **App Store submission** — Prepare screenshots (6.9" display: 1320x2868) and metadata.

### Out of Scope for v1
- Android support
- In-app messaging
- Paid tiers or subscriptions
