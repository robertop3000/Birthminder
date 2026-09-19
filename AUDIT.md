# Birthminder — Web/PWA Program Audit Log

This file records the findings of each checkpoint of the web/PWA program
(branch `1.8.0`). No secrets are recorded here; project references and
hostnames are not secrets.

---

## Checkpoint 1 — Repository and live Supabase audit (2026-09-19)

### Repository

| Item | Finding |
|------|---------|
| Working clone | `Birthminder/Birthminder/` (inner folder, has `node_modules` and `.env`) |
| Remote | `github.com/robertop3000/Birthminder` |
| Base commit | `5206958e` (merge of `1.7.8` into `main`) |
| New branch | `1.8.0` |
| `npx tsc --noEmit` | 0 errors |
| `npx jest --no-cache` | 18 suites, 126 tests, all passing |
| Tooling | Node 24.13.1, npm 11.11.0, Supabase CLI 2.117.0 (logged in, linked), Vercel CLI 59.23.2 (logged in as `robertop3000-7064`, team `deve-robert`), eas-cli 18.0.1 |

Observations:

- The outer folder `Birthminder/` is a second clone of the same repository
  (same remote, at `5206958e`). Its `package-lock.json` has been overwritten
  with an empty 96-byte lockfile (uncommitted). Nothing was changed there; it
  should be restored with `git checkout -- package-lock.json` in that folder.
- `supabase/.temp/` (CLI-generated link state) was tracked in git. It is now
  ignored and untracked; the files remain on disk.
- `app.json` declares `platforms: ["ios"]` only. `react-native-web` is not a
  dependency. There is no `metro.config.js`, `public/` folder, manifest, or
  service worker. Web has never been built.
- A stale `dist/` from an iOS `expo export` (2026-04-12) exists and is
  git-ignored.
- `SHARE_BASE_URL` points at the GitHub Pages redirector
  (`robertop3000.github.io/Birthminder`), which deep-links to the iOS app
  and falls back to the App Store.

### Supabase (read-only)

| Item | Finding |
|------|---------|
| Project | `Birthminder`, ref `hxneyspamnixvlesqlbm`, region `us-east-1`, Postgres 17 |
| Organization | free plan |
| Status | **INACTIVE (paused)** |
| Linked ref (CLI) | matches `hxneyspamnixvlesqlbm` |
| `.env` project URL | matches `hxneyspamnixvlesqlbm` |
| MCP `restore_project` | failed twice: "Failed to retrieve project" |
| CLI | no restore/resume subcommand exists in 2.117.0 |

Because the project is paused, none of the following could be verified yet:
Auth user count, row counts, backup status, live schema vs application
queries, advisors, edge function deployment state. These are the first
actions of Checkpoint 2 once the project is resumed from the dashboard.

Free-plan projects can be resumed with one click for 90 days after pausing;
after that the dashboard only offers a backup download. The last known
activity on this project was April 2026, so the 90-day window may have
lapsed. The dashboard will show which case applies.

### Application query inventory (what the live schema must satisfy)

Tables: `profiles` (display_name, avatar_url), `people` (all columns incl.
`reminder_days`, `contact_id`, `contact_phone`, `contact_name`,
`share_code`), `groups` (incl. `reminder_days`, `source_share_code`,
`share_code`), `person_groups` (person_id, group_id, user_id).

Nested selects: `people` → `person_groups(group_id, groups(id, name, color))`;
`groups` → `person_groups(count)`.

RPCs: `get_shared_person(code)`, `get_shared_group(code)`,
`get_shared_group_members(code)`.

Storage: bucket `avatars` (public), paths `people/*`, `groups/*`, profile
avatars.

Edge Functions: `delete-user` (source in `supabase/functions/delete-user`).

Auth: email/password sign-up with `display_name`/`avatar_url` metadata,
`resetPasswordForEmail` with a custom-scheme redirect, `updateUser`.

### Web-compatibility blockers found in source

- `Alert.alert` is used in 12 files (33 call sites). `react-native-web`
  implements `Alert` as a no-op, so every confirmation and error dialog
  would silently do nothing on web.
- `Share.share` is used in 3 files; on web it only works where
  `navigator.share` exists (mobile browsers), and throws elsewhere.
- `expo-notifications` local scheduling (`hooks/useNotifications.ts`,
  `app/_layout.tsx`, `app/settings.tsx`) is unavailable on web.
- `expo-file-system/legacy` (`lib/uploadImage.ts`) is unavailable on web.
- `expo-calendar` (`hooks/useCalendarImport.ts`) and `expo-contacts`
  (`hooks/useContactLink.ts`) are unavailable on web.
- `RECOVERY_REDIRECT_URL` is a custom URL scheme; web needs an `https`
  redirect and a Site URL configured in Supabase Auth.

---

## Checkpoint 3 — Web compatibility and PWA (2026-09-19)

### Changes

- **Web platform enabled**: `app.json` now lists `web` with the Metro
  bundler and `output: "single"` (client-rendered SPA). `react-native-web`
  and `@expo/metro-runtime` added as dependencies.
- **PWA shell**: `public/index.html` (Expo uses it as the HTML template),
  `public/manifest.json`, `public/sw.js` (app-shell cache, Web Push
  `push`/`notificationclick` handlers) and generated icons in
  `public/icons/` (192, 512, 180 apple-touch, 32 favicon).
- **Alerts**: new `lib/alert.ts` `showAlert()` replaces every `Alert.alert`
  call (12 files). Native behaviour is unchanged; on web the request is
  rendered by `components/ui/AlertHost.tsx`, a themed modal mounted in the
  root layout, with a `window.confirm`/`alert` fallback.
- **Sharing**: new `lib/share.ts` `shareText()` uses the system sheet on
  iOS, the Web Share API where available, and otherwise copies the message
  to the clipboard and tells the user.
- **Photos**: `lib/uploadImage.ts` gained a web path (fetch → size check →
  canvas resize via expo-image-manipulator → upload) since
  `expo-file-system` is native-only.
- **Notifications**: `hooks/useNotifications.ts` tracks the browser
  permission on web and makes local scheduling a no-op there (Web Push is
  delivered by the server, checkpoint 5). Root layout and Settings skip the
  native notification APIs on web.
- **Native-only features on web**: calendar import button hidden, contact
  linking replaced by a hint, WhatsApp links use `wa.me`.
- **Layout**: on web the app renders in a centred 600px column with the
  surface colour outside it; the tab bar is 64px tall on web.
- **Config**: `lib/config.ts` derives the password-recovery redirect from
  the web origin on web. `vercel.json` added (SPA rewrite, service-worker
  and immutable-asset cache headers, security headers).
- **Verification**: `npx expo export --platform web` succeeds (2.37 MB
  bundle); `npx tsc --noEmit` 0 errors; Jest 22 suites, 143 tests passing
  (17 new tests for alert, share, messaging links and web permission).

### Vercel

- Project `birthminder` created and linked under team `deve-robert`
  (`.vercel/` and `.env.local` are git-ignored). Not deployed yet.
