# Backlog

Task IDs use the `UMSC` project prefix. Issued IDs are permanent.

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
  29 workstation Node contracts, all three browser startup scenarios, live UMS
  browser rendering and official SDK build pass. Linux runner is offline;
  native shutdown/sleep wake, reconnect and preserved-state checks remain pending.

## M5: Library conventions and app polish

Work is deferred until the owner finishes the remaining DVD rips. These are
plans, not an agreed filesystem layout or permission to move existing media.

### UMSC-M5-001: Agree library layout and addition rules

- Status: PLANNED
- Goal: Define a stable film/series layout and naming, artwork, metadata and
  collection conventions that make new additions predictable and child-friendly.
- Next action: With permission, inspect the completed library read-only and
  propose rules from its actual contents, including exceptions and DVD extras.
- Acceptance: Owner agrees the layout, repeatable intake/validation rules and
  tagging/grouping contract. Any migration has a preview, recovery plan and
  separate approval. Preserve playback and existing media throughout.
- Boundary: No automatic recursive scan, rename or move is approved yet.

### UMSC-M5-002: Polish the TV library experience

- Status: PLANNED
- Depends on: UMSC-M5-001 and the remaining UMSC-M4-001 device checks.
- Goal: Refine the streaming-service-style shelves, grouped content, search,
  labels, artwork and visible remote focus around the agreed library contract.
- Acceptance: Agreed layout drives predictable grouping and new additions;
  navigation/search/playback/progress are tested on the actual TV, with bounded
  browsing and no regression to the existing VLC/DLNA layout.
- Next action: Agree a small visual/navigation design after the library rules,
  then implement and verify it. Do not redesign or deploy during the rip phase.
