# Backlog

Task IDs use the `UMSC` project prefix. Issued IDs are permanent.

Current physical-TV follow-up: **UMSC-M5-005**, VERIFYING. See
`docs/tasks/UMSC-M5-005-tv-feedback.md`. Owner confirms 0.2.0 parental bootstrap,
personal-code confirmation and saving, working dwell and playback starting.
Labels, remote settings and failed saved-code re-entry are fixed locally.
Owner approved 0.2.1 CI push and in-place update with code-only recovery after
checks. Actual device acceptance remains pending; preserve progress.

## M1: Build and verification infrastructure

### UMSC-M1-001: Provision the GSVS Linux runner

- Status: DONE
- Goal: Execute the fork's automated checks on a dedicated GSVS Linux runner.
- Progress: Runner `gsvs-ums-custom` is registered, online and managed by an
  enabled user systemd service with lingering. Java, Maven, FFmpeg and native
  media libraries are provisioned privately. Custom-fork tests pass and final
  cleanup is verified. The full suite preserves one reproduced baseline
  network-timeout failure, tracked below.
- Evidence: `docs/tasks/UMSC-M1-001-linux-runner.md`.

### UMSC-M1-002: Make the Jetty timeout test independent of LAN routing

- Status: PLANNED
- Goal: Exercise connection timeout deterministically without depending on an
  external unroutable address or weakening the asserted client behaviour.
- Evidence: The same assertion fails on baseline `9599bee06635a5653fe06f4c1aa3ed2b91dffcd9`
  and feature workflow `39638146430`. The LAN produces `SocketException`
  rather than the expected `SocketTimeoutException`.

### UMSC-M1-003: Run the existing custom build before Windows login

- Status: VERIFYING
- Goal: Use UMS's bundled Windows service wrapper to start the current custom
  jar and existing profile without an interactive login.
- Acceptance: Automatic service startup, explicit existing profile, preserved
  jar/settings/library identity, session-zero read-only browse/media checks,
  recoverable removal of duplicate login startup and documented recovery.
- Boundary: Owner authorised the service migration. No build upgrade, library
  reorganisation, database reset or PC reboot is included.
- Evidence: `docs/tasks/UMSC-M1-003-windows-service.md`.
- Delivery: Built-in LocalService service is running with delayed automatic
  startup. Session-zero browse, artwork and direct-file HTTP 206 checks pass;
  jar, main settings, shares and renderer modes/profiles are preserved. Both
  login shortcuts were recoverably disabled. Cold-boot/login-screen acceptance
  remains pending with the owner; no reboot was performed.

## M3: Child-friendly library browsing

### UMSC-M3-001: Inherit film artwork for real folders

- Status: VERIFYING
- Branch: `feature/umsc-m3-001-folder-thumbnails`
- Goal: When a real folder has no artwork of its own, show real artwork from
  the first direct video inside it.
- Acceptance:
  - Explicit folder artwork always wins.
  - Only direct video files are considered. Nested folders are not searched.
  - Selection is stable when more than one video exists.
  - A child's generic file icon is never reused as folder artwork.
  - Existing sidecar, embedded, cached and generated video thumbnails remain
    valid sources.
  - Regression tests cover precedence, one-level scope and stable selection.
  - Compatible automated checks pass on the dedicated GSVS Linux runner.
  - Live installation remains a separate owner-approved delivery step.
- Progress: Source and five focused regression cases are implemented. All 12
  custom-fork tests pass on Windows and Linux. An isolated Windows runtime
  check confirms matching film/folder artwork and working HTTP byte ranges.
  The full suite has only the reproduced baseline timeout failure. Installation
  completed after explicit owner shutdown confirmation. Live artwork and VLC
  direct-file byte ranges pass. Owner confirms VLC folder artwork; Samsung's
  built-in Sources does not show it. The custom TV app is now the preferred UI.

### UMSC-M3-002: Persistent server icon and Samsung folder artwork

- Status: IN_PROGRESS
- Goal: Restore private Spidey branding without future jar updates removing it;
  test Samsung single-JPEG/versioned-ID folder artwork compatibility.
- Evidence: `docs/tasks/UMSC-M3-002-samsung-artwork.md`.
- Delivery: 18 focused Java tests pass on Windows and Linux. Isolated HTTP checks
  verify all seven private server icons. Not installed. No folder flattening.

## M4: Samsung TV app

### UMSC-M4-001: Remote-friendly UMS frontend

- Status: VERIFYING
- Goal: A small installable Tizen app with artwork shelves, categories, search,
  native playback and TV-local progress. Network install is owner-authorised.
- Evidence: `docs/tasks/UMSC-M4-001-tv-app.md` and `tv-app/README.md`.
- Delivery: source app, 15 contracts, browser checks and official SDK build
  pass. Owner signing profile is created and private app installation succeeded
  on the actual TV. Owner confirms launch, visual appearance and populated
  library after starting UMS. Native playback/audio/seek, persisted progress
  and physical remote acceptance remain pending. See `docs/releases/UMSC-M4-001-tv.md`.

### UMSC-M4-002: Wake the media PC and reconnect automatically

- Status: VERIFYING
- Goal: Check UMS on app launch/resume, ask the always-on router to wake the
  configured PC only when unreachable, and populate the library without an app
  restart. Keep the low-uptime system and phone wake fallback intact.
- Acceptance: Bounded/spaced wake retries, serial connection probes, no wake
  when already online, no polling after ready, cancellation when hidden,
  friendly waiting UI, bounded empty-library retries, private identities kept
  outside Git, and real-device wake/reconnect checks.
- Boundary: No new Linux relay, power-policy change, router credentials,
  service restart or automatic TV boot launch. Installation needs owner approval.
- Evidence: `docs/tasks/UMSC-M4-002-wake-reconnect.md`.
- Delivery: 0.1.1 is signed, installed and remotely launched with approval.
  30 workstation Node contracts, all three browser startup scenarios, live UMS
  browser rendering and official SDK build pass. Linux runner is offline;
  native shutdown/sleep wake, reconnect and preserved-state checks remain pending.

## M5: Library conventions and app polish

Owner approved the family UI and existing non-rip filename-schema pass on
22 October while DVD intake continues, implemented under M5-004. Final rip
migration/curation remains deferred. This is not permission to migrate shares.
Separately authorised offline DVD staging has agreed filename prefixes and
journalled sorting. See the M5-003 consolidation record. Production layout,
bulk transfer and replacement still need a preview and owner approval.

### UMSC-M5-001: Agree library layout and addition rules

- Status: IN_PROGRESS
- Goal: Define a stable film/series layout and naming, artwork, metadata and
  collection conventions that make new additions predictable and child-friendly.
- Next action: With permission, inspect the completed library read-only and
  propose rules from its actual contents, including exceptions and DVD extras.
- Acceptance: Owner agrees the layout, repeatable intake/validation rules and
  tagging/grouping contract. Any migration has a preview, recovery plan and
  separate approval. Preserve playback and existing media throughout.
- Boundary: Owner approved filename-only schema changes to existing non-rip
  titles, with protected moves/recovery journals. No title relocation or rip
  bulk transfer. Physical adult-root rename is pending a Windows lock; owner
  declined a service restart. The app uses the adult role without that rename.
- Compatibility: Preserve the agreed storage type prefixes. Current app title
  cleanup does not hide them; agree visible title/grouping metadata explicitly.

### UMSC-M5-002: Polish the TV library experience

- Status: VERIFYING
- Depends on: UMSC-M5-001 and the remaining UMSC-M4-001 device checks.
- Goal: Refine the streaming-service-style shelves, grouped content, search,
  labels, artwork and visible remote focus around the agreed library contract.
- Acceptance: Agreed layout drives predictable grouping and new additions;
  navigation/search/playback/progress are tested on the actual TV, with bounded
  browsing and no regression to the existing VLC/DLNA layout.
- Next action: Candidate implementation/evidence is in M5-004. Finish checks,
  pause for owner TV-install approval, then verify on the real device. Final
  rip migration, artwork and suitability audit still remain separate work.

- Owner design inputs, 22 October: kids' view has NO SEARCH, only arrows,
  Enter and Back. A secret six-digit sequence on the app home screen switches
  to a hidden adult view, with no visible entry or directional unlock gesture.
  Adult content must not be assumed child-safe from file type or animation.
- Open: owner will describe/show the reference UI, possibly with drawings.
  Verify physical/virtual numeric input on the TV; agree partial-entry reset,
  exit/relaunch/default-view policy, per-TV/profile routing and progress scope.
  These are not implemented. Do not select or commit an actual secret code.
- Protection boundary: owner accepts lightweight hidden entry. UI hiding alone
  is not server-wide access control and does not restrict other DLNA clients.
  No enforced parental-control claim without separately implementing/testing it.
- Superseding design: default 7x5 parent-adjustable wall, dwell info/direct play;
  personal 5-10 digit code after forced replacement of bootstrap `12345`.
  TV series rotate their ordered full-cycle starting episode per selection.
  Bonus collections shuffle once. Returning from a queue preserves wall position.

### UMSC-M5-003: Consolidate server, TV app and DVD intake context

- Status: DONE
- Goal: Resume both workstreams from written evidence without relying on chat
  memory. Preserve the actual installed/source/acceptance distinctions.
- Delivery: Local documentation only, not committed, pushed or deployed.
- Evidence: `docs/tasks/UMSC-M5-003-context-handover.md` and private staging
  `UMS-LIBRARY-HANDOVER.md`, outside Git.
- Next action: Continue authorised offline intake; capture the owner's UI
  explanation, then use M5-001/002 for production layout and interface work.

### UMSC-M5-004: Implement kids wall, parental controls and schema integration

- Status: VERIFYING
- Goal: Deliver the owner-agreed simple kids interface and retain adult shelves,
  with a forced personal-code setup, Reset Home and filename-derived labels.
- Authority: Commit/push the feature branch for CI. Owner subsequently approved
  TV installation on 23 October and UMS startup if needed. No merge, binary
  release, title relocation or rip migration.
- Evidence: `docs/tasks/UMSC-M5-004-kids-wall-parent-controls.md`.
- Delivery: Verified signed 0.2.0 installed in place and SDK launch succeeded
  on 23 October. Existing UMS service was running and HTTP 200; no restart,
  uninstall or media change. Local evidence only, not pushed.
- Next action: Owner verifies actual TV input, wall performance, playback and
  persisted state. Keep previous author certificate and recovery package.
