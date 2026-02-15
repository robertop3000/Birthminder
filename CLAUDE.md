# BirthdayCalendar App — Full Setup Guide & Project Brief

---

# HOW TO START — READ THIS FIRST

You are Claude Code, an AI agent. Your job is to build the BirthdayCalendar
app from scratch by following this file top to bottom.

Do the following in order:
1. Read this entire file before doing anything
2. Complete Part 1 (environment setup) fully before writing any app code
3. Build the app following Part 2, using the verification loop after every screen
4. Never skip a step or assume something is already done — verify everything

---

# PART 1: ENVIRONMENT SETUP

Complete every step in this section before writing any app code.

---

## STEP 1: Verify Node.js is installed

Run this in the terminal:
   node --version
   npm --version

Both must print a version number. If either fails, stop and tell the user:
"Node.js is not installed. Please go to https://nodejs.org, download the
LTS version, install it, then restart Antigravity and try again."

---

## STEP 2: Install global tools

Run these commands:
   npm install -g expo-cli eas-cli

Verify they installed:
   expo --version
   eas --version

Both must print a version number before continuing.

---

## STEP 3: Create the Expo project

Run:
   npx create-expo-app BirthdayCalendar --template blank-typescript

Then navigate into it:
   cd BirthdayCalendar

Verify the folder was created and contains a package.json file before continuing.

---

## STEP 4: Install all dependencies

Run these one by one, waiting for each to finish:

   npx expo install expo-router expo-notifications expo-image-picker
   npx expo install @supabase/supabase-js
   npm install date-fns
   npx expo install @expo-google-fonts/dm-sans expo-font
   npx expo install @react-native-async-storage/async-storage

After all installs finish, verify by checking that node_modules folder exists
and is not empty.

---

## STEP 5: Create the .env file

Create a file called exactly .env in the root of the BirthdayCalendar folder.

Paste this content into it:
   EXPO_PUBLIC_SUPABASE_URL=your-supabase-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

Then stop and tell the user:
"I have created the .env file. Please open it and replace the two placeholder
values with your real Supabase Project URL and anon/public API key.
You can find these in Supabase > Project Settings > API.
Type 'done' when you have pasted your real values and I will continue."

Wait for the user to confirm before moving to Step 6.

---

## STEP 6: Create the Supabase database tables

Tell the user:
"Please go to your Supabase project, click SQL Editor in the left sidebar,
paste the following SQL, and click Run. Then type 'done' when finished."

Show the user this SQL to run:

CREATE TABLE profiles (
  id uuid references auth.users primary key,
  display_name text,
  avatar_url text,
  notification_days_before int default 3,
  theme text default 'light',
  created_at timestamptz default now()
);

CREATE TABLE people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  birthday_day int not null,
  birthday_month int not null,
  birthday_year int,
  photo_url text,
  notes text,
  created_at timestamptz default now()
);

CREATE TABLE groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  color text,
  share_code text unique,
  created_at timestamptz default now()
);

CREATE TABLE person_groups (
  person_id uuid references people(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  primary key (person_id, group_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own profile only" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Own people only" ON people
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Own groups only" ON groups
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public can view shared groups" ON groups
  FOR SELECT USING (share_code IS NOT NULL);

CREATE POLICY "Own person_groups only" ON person_groups
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM people WHERE id = person_id)
  );

Wait for the user to confirm before moving to Step 7.

---

## STEP 7: Set up the folder structure

Create the following empty folders and placeholder index files:

/app
  /(auth)
  /(tabs)
  /person
  /group
  /shared
/components
  /ui
  /birthday
  /group
/hooks
/contexts
/lib
/assets
  /fonts
  /icons
  /images

---

## STEP 8: Confirm setup is complete

Tell the user:
"Setup is complete! Here is a summary of what was done:
- Expo project created with TypeScript
- All dependencies installed
- .env file created with your Supabase credentials
- Database tables created in Supabase
- Folder structure created

I will now start building the app. I will complete one screen at a time
and run a verification checklist after each one before moving on."

Then immediately begin Part 2.

---

# PART 2: APP SPECIFICATION

---

## Project Overview

A mobile app called BirthdayCalendar that helps users remember and organize
birthdays. Warm and personal in light mode, sleek and modern in dark mode.
Familiar social-app layout so users feel at home immediately.

---

## Tech Stack

- Framework: React Native with Expo (SDK 51+)
- Language: TypeScript — always, no plain .js files ever
- Navigation: Expo Router (file-based routing)
- Backend & Auth: Supabase
- Push Notifications: expo-notifications
- Image Storage: Supabase Storage
- Theme Storage: @react-native-async-storage/async-storage
- Target Platform: iOS only
- Build Tool: EAS Build (cloud, no Mac needed)

---

## Theme System — Dark and Light Mode

The app must support both modes with a toggle in the Profile tab.
Save the user preference using AsyncStorage so it persists between sessions.

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
- Create a ThemeContext that wraps the entire app
- Expose useTheme() hook for every component
- All components must use theme colors — never hardcode color values
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
- Fixed to bottom of screen
- Icons 24-28px
- Active tab uses Primary color #E07A5F
- Inactive tabs use Text Secondary color
- Small dot indicator below active icon
- Subtle top border using theme border color
- Solid background, no blur

Floating Action Button (FAB):
- Circular button bottom right corner above tab bar
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
- Optional action icon — RIGHT (filter on Birthdays, settings on Profile)
- Subtle bottom border using theme color, no heavy shadow

---

## Screens

### Auth Flow
- Splash Screen: logo centered, auto-redirects based on Supabase session
- Onboarding: 2-3 slides, skippable, dot pagination at bottom
- Sign Up: email, password, display name, optional profile photo
- Login: email, password, forgot password link
- Forgot Password: email input, triggers Supabase password reset

### Tab 1: Home
- Top bar: avatar left, BirthdayCalendar logo center
- If today is someone's birthday: full-width celebration card at top
  with confetti icon, their photo, name, and Send Wish button
- Feed of upcoming birthdays in next 30 days as cards
- Each card: circular avatar left, name, birthday date, days remaining
  as a badge, group tags as small colored pills
- Empty state: friendly illustration and "Add your first birthday!" text

### Tab 2: Search
- Full-width search bar at top, auto-focused when tab opens
- Results appear as cards as user types
- Each result: avatar, name, next birthday, groups
- Empty search state: all birthdays sorted alphabetically
- No results: friendly message with suggestion to add them

### Tab 3: Groups
- List of groups as cards
- Each card: color tag bar on left, group name, member count,
  share icon on right
- Tap to open group detail
- Empty state: "Create your first group!"

### Tab 4: Notifications
- List of upcoming birthday notifications
- Each row: avatar, name, notification type, date it will fire
- Toggle at top to enable/disable all notifications
- Preference selector: 1 day / 3 days / 1 week before

### Tab 5: Profile
- Large circular profile photo centered at top
- Display name and email below photo
- Dark/light mode toggle with sun and moon icons — prominent, not hidden
- Account settings: change name, email, password
- Sign out button
- App version number at very bottom in small secondary text

### Add/Edit Birthday Modal
- Slides up from bottom like Instagram new post screen
- Fields: name, birthday date picker, photo picker, groups multi-select, notes
- Save button top right, Cancel top left
- Photo shows as large circular preview once selected

### Person Detail Screen
- Large photo at top like an Instagram profile
- Name, next birthday, age they will turn, days remaining countdown
- Group pills
- Notes section
- Edit button top right, Delete in a menu

### Group Detail Screen
- Group name and color at top
- Member list as cards
- Share button prominent at top right
- Edit and delete in a menu

### Shared Group View (public)
- Read-only, no login required to view
- Banner: "[Name] shared their [Group Name] birthdays with you"
- List of birthday cards
- "Import to my BirthdayCalendar" button at bottom
- If not logged in, tapping Import goes to Sign Up

---

## Core Features

1. Accounts — email/password via Supabase Auth, private data per user
2. Birthdays — add/edit/delete, multi-group, photos in Supabase Storage
3. Groups — name and color, same person in multiple groups, deleting a
   group does not delete people
4. Notifications — local notifications on birthday date, advance reminders,
   re-schedule on every app launch
5. Shareable Groups — unique share_code, public read-only view, importable
   when logged in, only that group is shared
6. Dark/Light Mode — full theme support, persisted, toggled from Profile

---

## Rules

1. Always TypeScript — no .js files
2. Use @supabase/supabase-js for all backend work
3. Read credentials from .env — never hardcode them
4. Use Expo Router for all navigation
5. Use expo-image-picker for photos
6. Use expo-notifications for notifications
7. Use date-fns for all date math
8. Every component uses useTheme() — never hardcode colors
9. Bottom tab bar: icons only, no labels, active dot indicator
10. FAB: bottom right, primary color, only on Home/Search/Groups tabs
11. Top bar: avatar left, title center, action right on every main screen
12. Keep components small and reusable
13. Windows machine — never suggest Xcode or Mac-only tools
14. All iOS builds via: eas build --platform ios

---

## VERIFICATION LOOP — REQUIRED AFTER EVERY SCREEN

After building each screen or feature, stop and do all of the following
before moving on:

STEP 1 — DESCRIBE
Write a short summary of what was just built including:
- Which screen or feature was completed
- What the layout looks like
- Which theme colors were used
- Whether dark and light mode both work

STEP 2 — CHECKLIST
Check each item and mark YES or NO:
[ ] Bottom tab bar is icon-only with no text labels
[ ] Active tab shows primary color #E07A5F with dot indicator
[ ] FAB is visible and correctly positioned (if applicable)
[ ] Top bar has avatar left, title center, action right
[ ] All colors come from useTheme() — no hardcoded values
[ ] Dark mode and light mode both render correctly
[ ] Empty state is handled with friendly message or illustration
[ ] TypeScript — no type errors, no use of "any"

STEP 3 — FIX
If any item is NO, fix it before moving to the next screen.
Do not proceed until all items are YES.

STEP 4 — CONFIRM
Write exactly:
"Screen [name] is complete and verified. Ready for next step."
Then wait for user confirmation before building the next screen.

---

## Build Order

Build in this exact order, running the verification loop after each:

1. ThemeContext and useTheme hook
2. Supabase client (lib/supabase.ts)
3. Bottom tab bar component and FAB component
4. Top bar component
5. Splash screen
6. Onboarding screens
7. Sign Up screen
8. Login screen
9. Forgot Password screen
10. Home tab
11. Search tab
12. Groups tab
13. Notifications tab
14. Profile tab with theme toggle
15. Add/Edit Birthday modal
16. Person Detail screen
17. Group Detail screen
18. Shared Group View
19. Push notification scheduling logic
20. Final end-to-end test: create account, add birthday, create group,
    share group, toggle theme, receive notification

---

## Out of Scope for Version 1
- Android support
- In-app messaging
- Paid tiers or subscriptions

---

# PART 3: DEVELOPMENT WORKFLOW

---

## Simulator-less Testing Loop

This project is developed on a Windows machine with NO iOS simulator.
All testing happens via Expo Go on a physical iPhone.
Follow this 3-pillar loop after every change:

### Pillar 1 — Code Integrity
Run after every modification:
   npx tsc --noEmit
Must produce ZERO errors before moving on.

### Pillar 2 — Unit Validation
For every new component, hook, or screen:
1. Write a test file in a __tests__ folder next to the source
2. Use @testing-library/react-native with fireEvent for interactions
3. Run: npx jest --no-cache
4. Must reach 100% pass rate — fix failures yourself before continuing
5. Only tell the user "Ready for visual test" once headless tests pass

### Pillar 3 — Manual Feedback
The user tests on their iPhone via Expo Go.
Start the dev server with: npx expo start
The user scans the QR code and reports visual/functional issues.
Fix anything they report, then re-run Pillar 1 and 2.

---

## Git Branch Strategy

Create a snapshot branch at every significant milestone so we can
always roll back if something breaks.

### When to branch
- Before any major feature addition
- Before any refactor that touches 3+ files
- After a stable version is confirmed working on device
- Before handing off to another AI agent

### How to branch
   git checkout -b stable/vX.Y
   git push -u origin stable/vX.Y
   git checkout main

Branch naming: stable/v0.1, stable/v0.2, etc. matching CHANGELOG versions.

### Rules
- NEVER force-push to main or any stable/ branch
- ALWAYS commit to main first, then create the stable branch
- If main breaks, the latest stable/ branch is the recovery point
- Before any risky change, confirm a stable/ branch exists for the
  current working state

---

## Working with Multiple AI Agents

This project may be worked on by different AI agents (Claude Code,
Gemini, Sonnet, etc.) across sessions. Follow these rules:

1. NEVER replace a file with placeholder comments like "// ... existing code"
   — always write complete, working files
2. Read the full file before modifying it — understand what exists
3. Make surgical changes: add what is needed, do not rewrite surrounding code
4. After any agent handoff, run: npx tsc --noEmit && npx jest --no-cache
5. If errors are found, check git diff to see what the previous agent broke
6. Update CHANGELOG.md after every significant change

---

## Repository

- GitHub: https://github.com/robertop3000/Birthday-Calendar
- Remote: origin (main branch)
- Always push after committing stable changes