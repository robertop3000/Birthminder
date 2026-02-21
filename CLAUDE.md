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

- Framework: React Native with Expo SDK 54
- Language: TypeScript (strict mode) — no plain .js source files
- Navigation: Expo Router (file-based routing)
- Backend & Auth: Supabase (PostgreSQL + Auth + Storage)
- Push Notifications: expo-notifications (local scheduling)
- Image Rendering: expo-image (disk-cached, with retry)
- Image Processing: expo-image-manipulator (resize/compress on upload)
- Image Picking: expo-image-picker
- File I/O: expo-file-system (legacy import for base64 reads)
- Theme Storage: @react-native-async-storage/async-storage
- Date Math: date-fns
- Typography: DM Sans (400, 500, 700) via @expo-google-fonts/dm-sans
- JS Engine: Hermes
- Target Platform: iOS only
- Build Tool: EAS Build (cloud, no Mac needed)
- Testing: Jest + ts-jest + @testing-library/react-native

---

## Theme System — Dark and Light Mode

The app supports both modes with a toggle in the Profile tab.
User preference is persisted using AsyncStorage (key: @theme_mode).

Light Mode Colors:
- Background: #FAF8F5
- Surface/Cards: #F0EDE8
- Primary: #E07A5F
- Text Primary: #2D2D2D
- Text Secondary: #9E9E9E
- Accent: #F2C94C
- Bottom Bar Background: #FFFFFF
- Bottom Bar Border: #E8E3DE

Dark Mode Colors:
- Background: #000000
- Surface/Cards: #1A1A1A
- Primary: #E07A5F
- Text Primary: #FFFFFF
- Text Secondary: #6E6E6E
- Accent: #F2C94C
- Bottom Bar Background: #000000
- Bottom Bar Border: #2A2A2A

Theme Rules:
- ThemeContext wraps the entire app (in app/_layout.tsx)
- useTheme() hook exposes mode, colors, and toggleTheme()
- All components use theme colors — never hardcode color values
- Toggle lives in Profile tab as a sun/moon icon switch
- Default to light mode on first launch

---

## Navigation Layout — Bottom Tab Bar

5 icon-only tabs — no text labels under icons, exactly like X/Twitter.

Tab order left to right:
1. Home icon — Today and Upcoming birthdays
2. Search icon — Search all birthdays
3. Groups icon — All groups
4. Notifications icon — Notification history and settings
5. Profile icon — User profile

Bottom Bar Styling:
- Fixed to bottom of screen, 80px height with 20px bottom padding
- Icons 24-28px
- Active tab uses Primary color #E07A5F
- Inactive tabs use Text Secondary color
- Small dot indicator below active icon
- Subtle top border using theme border color
- Solid background, no blur

Floating Action Button (FAB):
- Circular button (56x56px) bottom right corner above tab bar
- Same style as X/Twitter compose button
- Color: Primary #E07A5F with white + icon
- Opens Add Birthday modal from anywhere
- Visible on Home, Search, and Groups tabs only
- Hidden on Notifications and Profile tabs

---

## Top Bar

Every main screen has a top bar:
- User circular profile avatar — top LEFT (tappable, opens Profile tab)
- Screen title or app logo — CENTER
- Optional action icon — RIGHT (gear on Profile, + on Groups)
- Subtle bottom border using theme color, no heavy shadow

---

## Screens (ALL IMPLEMENTED)

### Auth Flow
- Splash Screen: logo centered, auto-redirects based on Supabase session
- Onboarding: 3 slides, skippable, dot pagination, remembers completion in AsyncStorage
- Sign Up: email, password, display name, optional profile photo upload
- Login: email, password, forgot password link
- Forgot Password: email input, triggers Supabase password reset

### Tab 1: Home
- Top bar: avatar left, "Birthminder" center
- If today is someone's birthday: CelebrationBanner with confetti, photo, name
- Feed of upcoming birthdays in next 30 days as BirthdayCards
- Each card: circular avatar left, name, birthday date, days remaining badge, group pills
- Empty state: cake emoji and "Add your first birthday!" text
- Auto-schedules notifications on mount

### Tab 2: Search
- Full-width search bar at top, auto-focused when tab opens
- Results appear as BirthdayCards as user types (case-insensitive)
- Empty search state: all birthdays sorted alphabetically
- No results: friendly message with suggestion to add them

### Tab 3: Groups
- List of GroupCards
- Each card: group photo or color bar on left, group name, member count, share icon
- Create group via + icon in TopBar (modal with name, color picker, and photo)
- Share via native Share sheet with HTTPS landing page URL
- Empty state: "Create your first group!"

### Tab 4: Notifications
- SectionList grouped by month (rolling order: current month first, wraps to next year)
- Month sections displayed as uppercase headers
- Toggle at top to enable/disable all notifications
- Dropdown selector: 0 / 1 / 3 / 7 days before
- Rows clickable — navigate to person detail

### Tab 5: Profile
- Large circular profile photo centered at top
- Display name and email below photo
- Dark/light mode toggle with sun and moon icons — prominent
- Gear icon (top-right) navigates to Settings
- Sign out button
- App version number at very bottom in small secondary text

### Settings Screen
- Legal section: link to Privacy Policy & Terms of Service
- Danger zone: Delete Account with confirmation modal
- Delete flow: person_groups → people → groups → profiles → signOut

### Legal Screen
- Tabs: Privacy Policy | Terms of Service
- Privacy: data collection disclosure, Supabase storage, GDPR deletion
- Terms: Standard EULA, Apple EULA reference

### Add/Edit Birthday Modal
- Slides up from bottom
- Fields: name, month (custom modal picker), day, year (optional), photo, groups multi-select, notes
- Inline group creation: "+ New Group" chip with name input + 8 color presets
- Photo pipeline: Pick → ImageManipulator (resize 600px, compress 0.7, JPEG) → base64 → Supabase Storage → cache-busted URL
- Save button top right, Cancel top left

### Person Detail Screen
- Large photo at top
- Name, formatted date, stats cards (days until, age turning)
- Group pills
- Notes section
- Share, Edit, Delete actions in header
- Share generates share_code, opens native Share with deep link

### Group Detail Screen
- Group photo or color banner at top with member count
- Edit modal (pencil icon): change name, color, photo
- Member list as BirthdayCards
- Add button: modal shows available people not already in group
- Remove: tap X icon with confirmation alert
- Edit, Share, and Delete actions in header

### Shared Group View (public, no auth required)
- Fetches group by share_code (SECURITY DEFINER RLS policies)
- Banner: "Someone shared their [Group Name] birthdays with you" (shows group photo if available)
- Read-only birthday card list with all fields (name, date, year, photo, notes)
- "Import to my Birthminder" button
- Deduplication: detects if group was already imported (via source_share_code), offers "Update" option
- Person dedup: matches by name + birthday_month + birthday_day to avoid duplicates
- If not logged in, redirects to signup

### Shared Person View (public, no auth required)
- Fetches person by share_code
- Profile + stats display
- "Save to my Birthminder" button
- Import creates duplicate entry for logged-in user

---

## Core Features

1. Accounts — email/password via Supabase Auth, private data per user,
   profile auto-created by DB trigger + client-side ensureProfile() fallback
2. Birthdays — add/edit/delete, multi-group, photos optimized and stored in Supabase Storage,
   month-grouped rolling calendar view
3. Groups — name, 8 color presets, and optional photo; same person in multiple groups,
   deleting a group does not delete people, inline creation from birthday form, edit from detail screen
4. Notifications — local notifications on birthday date (8 AM), advance reminders
   (0/1/3/7 days before, 8 AM), re-scheduled on every app launch
5. Sharing — unique share_code per group or person, HTTPS share URLs via GitHub Pages
   landing page (OG meta tags for rich previews on WhatsApp/Telegram/iMessage),
   deep link redirect to birthminder:// scheme, import with deduplication
6. Dark/Light Mode — full theme support, persisted, toggled from Profile
7. Error Handling — ErrorBoundary class component, auth error recovery, photo upload retries
8. Legal — Privacy Policy + Terms of Service for App Store compliance

---

## Rules

1. Always TypeScript — no .js source files
2. Use @supabase/supabase-js for all backend work
3. Read credentials from .env — never hardcode them
4. Use Expo Router for all navigation
5. Use expo-image-picker for photo selection, expo-image-manipulator for processing
6. Use expo-image for rendering (with disk cache and retry)
7. Use expo-notifications for notifications
8. Use date-fns for all date math
9. Every component uses useTheme() — never hardcode colors
10. Bottom tab bar: icons only, no labels, active dot indicator
11. FAB: bottom right, primary color, only on Home/Search/Groups tabs
12. Top bar: avatar left, title center, action right on every main screen
13. Keep components small and reusable
14. Windows machine — never suggest Xcode or Mac-only tools
15. All iOS builds via: eas build --platform ios
16. Use expo-file-system/legacy for readAsStringAsync (Expo SDK 54 requirement)

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

**Last Updated:** 2026-02-21
**Current Version:** v1.3.0 (Stable — Developed using Gemini 3 Flash)
**Build Number:** 1.3.0
**Test Status:** 17 suites, 100 tests — all passing
**Build Status:** v1.3.0 tested via Expo Go, ready for production build
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
