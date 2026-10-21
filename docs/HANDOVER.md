# Handover

## Current checkpoint: TV app 21 October, Windows service 22 October 2026

The UMS fork and **UMS TV Client** share this repository. Continue on
`feature/umsc-m3-001-folder-thumbnails`; source/tooling checkpoint is
`d1c86e08af87db126ca79127d25b462208185ca3` before this documentation update.

The owner confirmed the installed TV app opens, looks good and populates the
library after UMS starts. Initial disconnection was observed while UMS was not
running. Native video/audio, seek, persisted resume/watched and physical remote
acceptance still need explicit checks. Do not infer them from browsing success.

The owner is finishing roughly 100 more DVD rips. Leave the working setup alone.
Next product work is **UMSC-M5-001**, agreeing a library layout and repeatable
addition/tagging/grouping rules, followed by **UMSC-M5-002**, app polish based on
that agreed contract. Both are PLANNED in [BACKLOG.md](BACKLOG.md). No media
reorganisation, migration, scan or deployment is authorised by this checkpoint.

Owner subsequently authorised UMSC-M1-003, moving the existing build to Windows
service startup. That migration is installed and running under LocalService in
session zero with delayed automatic startup. Settings and library are unchanged;
both UMS login shortcuts are recoverably disabled. Manage it through Windows
Services and the existing web settings, not a second desktop UMS process.
Cold-boot/login-screen acceptance still needs the owner. See the
[service task/recovery record](tasks/UMSC-M1-003-windows-service.md).

## Delivery and outstanding work

- UMSC-M3-001 folder-artwork server build is installed. Owner confirms inherited
  film-folder artwork in VLC; Samsung built-in Sources did not display it.
- UMSC-M3-002 persistent server-icon/Samsung metadata candidate is implemented
  and isolated-tested, but **not installed**. The server discovery icon fix is
  separate from the working private Spidey TV launcher icon. A live UMS update
  still requires a separate shutdown/deployment approval.
- UMSC-M4-001 TV app 0.1.0 is privately signed and installed on the actual
  Tizen 5.5 TV. Launch and populated UI are owner-observed; remaining device
  acceptance keeps the task VERIFYING. See its [release record](releases/UMSC-M4-001-tv.md).
- Work is pushed on the feature branch, not merged or publicly released.
- Private branding, LAN configuration, signed packages and signing keys remain
  outside Git. Preserve the owner author certificate for future app updates.
  Do not uninstall just to update, since that removes TV-local progress.

## Verification and project manager

Latest source/tooling Linux run [39685477408](https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/actions/runs/39685477408)
at `d1c86e08a` passed the custom Java regression and TV app check/build steps
on `gsvs-ums-custom`. Final cleanup passed. Full Java suite: 538 tests, one
known baseline Jetty timeout assertion, zero errors, eight skips. This remains
UMSC-M1-002, not an all-green suite. Earlier runtime/browser evidence is in the
task and release reports; this checkpoint changes documentation only.

Projects Hub keeps one canonical project entry for the fork and app, with
direct links to the app, this handover and backlog. Its README-only checkpoint
does not require an Android viewer rebuild. Hub publication evidence is in the
TV release record; actual viewer refresh is not claimed.

## Exact next action

When the owner says the rips are done, read this file and the backlog, inspect
the real library read-only with permission, and propose the naming/layout and
intake rules before changing files or binding app behaviour to a layout.
Retain category shelves, search and remote-friendly focus as product goals.
Finish the pending native playback checks before calling the TV task DONE.

Detailed evidence: [folder artwork](tasks/UMSC-M3-001-folder-thumbnails.md),
[server branding](tasks/UMSC-M3-002-samsung-artwork.md),
[TV app](tasks/UMSC-M4-001-tv-app.md),
[Windows server delivery](releases/UMSC-M3-001-windows.md), and
[Linux runner](tasks/UMSC-M1-001-linux-runner.md).
