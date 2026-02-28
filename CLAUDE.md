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

## Navigation & UI
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
Must reach 100% pass rate. Current baseline: 17 suites, 100 tests.
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
4. Must reach 100% pass rate — fix failures before continuing
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

**Last Updated:** 2026-02-23
**Current Version:** v1.5.0 (Development — Gemini 3.5 Sonnet)
**Build Number:** 7
**Test Status:** 17 suites, 100 tests — all passing
**Build Status:** v1.4.1 (Build 6) stable, production build in TestFlight UAT. v1.5.0 in Development.
**Pre-Flight Audit:** PASSED
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
    │   │   └── forgot-password.tsx   # Email → Supabase reset
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
| person_groups | Junction (many-to-many) | person_id (FK), group_id (FK) |

---

## Next Steps

1. **TestFlight testing** — Verify 1.3.0 notification scheduling on device via diagnostic button
2. **Production build** — Run: `eas build --platform ios --profile production` for v1.3.0
3. **App Store submission** — Prepare screenshots (6.9" display: 1320x2868) and metadata
4. **Scrub git history** — Remove `.env` from commit 49681c3

### Out of Scope for v1
- Android support
- In-app messaging
- Paid tiers or subscriptions
