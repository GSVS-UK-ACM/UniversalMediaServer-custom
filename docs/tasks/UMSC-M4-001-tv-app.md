# UMSC-M4-001: Kids TV Samsung frontend

- Status: IN_PROGRESS
- Owner: Codex, authorised by repository owner on 21 October 2026.
- Branch: `feature/umsc-m3-001-folder-thumbnails`
- Baseline: `9aa187e9f`, with UMSC-M3-002 source work retained separately.

## Product and architecture

Small packaged Tizen 5.5 web application for the owner's 2020 Samsung TV.
Owner accepts developer-mode network installation instead of USB. UI owns its
artwork shelves, category/folder navigation, search and player. UMS remains the
media source and decides direct play/transcoding using the TV renderer. No
Samsung built-in Sources UI replacement, media relocation or global flattening.

The client uses existing read-only UPnP ContentDirectory HTTP APIs. No new
unauthenticated server API, external relay, cloud account or library scan.
Connect using a private device-description URL; keep deployment configuration
outside Git. Browse paginates and renders server-provided artwork itself.
Search uses the server's subtree Search action, not a client recursive scan.
Home previews read at most six direct child collections sequentially.

Samsung AVPlay is the production playback adapter; an HTML video fallback is
only for workstation UI development. TV-local progress and watched status are
not phone/account synchronisation. The app never writes media or the UMS DB.

## Acceptance

- D-pad, OK and Back navigate, with visible focus and no keyboard dependency.
- Artwork shelves and folder categories use real UMS browse results.
- Search finds titles in the selected Home library via server Search.
- Native AVPlay opens a playable URL, handles errors and returns to browsing.
- TV-local resume/watched markers survive app restart.
- Validate parsing, pagination, XML escaping, URL restrictions and player state.
- Run compatible automated checks on the existing GSVS runner.
- Package with the Samsung certificate for this TV. Keep keys/certs private.
- Actual TV install, native playback, audio, pause, seek and restart require
  device evidence, not browser mocks or an unsigned ZIP.

## Delivery boundary

Network install is authorised. Owner must enable Developer Mode. SDK and
Samsung certificate setup may require account interaction; do not accept new
legal terms or expose credentials on their behalf. Live UMS restart is still
separately owner-controlled. UMSC-M3-002 remains pending verification/deployment.

## Platform references

- https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html
- https://developer.samsung.com/smarttv/develop/guides/multimedia/media-playback/using-avplay.html
- https://developer.samsung.com/smarttv/develop/guides/user-interaction/remote-control.html
- https://developer.samsung.com/smarttv/develop/faq/application-installation.html

## Workstation checkpoint

Node 26.5.0: `npm ci --ignore-scripts`, `npm run check`, `npm test` and
`npm run build` pass. Thirteen contracts cover XML and pagination, same-server
URL policy, search, progress identity and mocked AVPlay lifecycle/error handling.
These are not native media playback evidence.

The same DLNA client connected to the live existing UMS instance, browsed two
root entries and 19 kids entries with artwork, and subtree search returned two
matching results. Requests are read-only and do not trigger a library rescan.
Actual addresses/titles are kept out of this portable report.

Official baseline SDK docs now deprecate the old Eclipse Tizen Studio IDE.
Use the current CLI installer, TV extension and Samsung certificate tooling:
https://github.com/Samsung/tizen-docs/blob/master/docs/sdk-tools/baseline-sdk/setup/install-sdk.md

## Verification and private branding

Self-hosted run `39648265328`, job `119389492166`, commit `7bd319bd8` passed
the app's 13 tests, syntax checks and development build using Node 22. The
existing full Java suite retains only the known Jetty timeout failure (538
tests, one failure, zero errors, eight skips). Always-run cleanup passed.
No hosted-compute fallback was used.
The current generic-branding build adds a fourteenth contract for late native
events after a stream is stopped. The run above predates that extra test.

Installed Chrome workstation checks passed fixture navigation, player entry,
Back and search. Read-only live UMS rendering also passed. The downloaded
Playwright Chromium could not launch (`spawn UNKNOWN`); using installed Chrome
resolved that environment issue. A browser-test wait incorrectly expected a
hidden player to be visible; it was corrected to assert `state: hidden`.
Neither browser check proves Samsung native decoding or physical D-pad use.

Owner requested a personal app label and their original Spidey launcher icon,
with generic Git naming. The public component is **UMS TV Client**. Private
ignored build configuration supplies the installed label and PNG. Packaged icon
bytes were compared to the supplied private original and match. Personal names,
LAN settings, icon paths and character artwork are not committed.

Official Tizen SDK 10 CLI installer downloaded from Samsung-linked
`download.tizen.org`, SHA-256
`AD373548A261B4383B6F74D4A74EB853B439C726CECA331A451D89081B7F7920`.
It has no Authenticode signature. It was opened after explicit owner approval
to display its licence/setup UI. No licence was accepted by the agent. Samsung
certificate setup and TV connection remain pending. TV is online on its remote
information port but actively refused developer SDB port 26101 at the latest
check. Owner is cold-rebooting it; no device install is claimed.

Projects Hub checkpoint: the canonical UMS fork remains registered as a
source-only project. This local development build is not a public app release
and does not require a second Hub entry.

## Signing/deployment continuation

Owner explicitly authorised installation after confirming the developer
connection. Official SDB connected successfully to the actual TV. Its capability
response confirms Samsung TV profile, ARMv7 CPU and Tizen 5.5. After standby the
connection disappeared, then returned when the owner switched the TV back on.
The base CLI is installed (Tizen CLI 2.5.25), but `security-profiles list` is
empty. Certificate Manager, Samsung `cert-add-on` 2.0.75 and TV extension tools
are missing and are being installed through the official package manager.
No licence was accepted automatically and no certificate or app install exists
at this checkpoint. Device identifiers and capability output are private.

Packaging review corrected the local connection-file policy: the packaged
app's explicit `connect-src` must include `'self'` as well as HTTP(S). The
workstation HTTP preview alone would not catch a file-origin deployment
failure. A fifteenth Node contract now guards this manifest requirement and
the actual device's Tizen 5.5 target.

Final source run `39649720531`, job on the same `gsvs-ums-custom` runner,
commit `2c67c6add`, passed 18 Java custom regressions and all 14 app tests,
syntax checks and development build. Full suite remains 538 tests, one known
baseline Jetty timeout assertion, zero errors, eight skips. Cleanup passed.
