# Handover

## Current task

UMSC-M3-001 is verifying on `feature/umsc-m3-001-folder-thumbnails`.
UMSC-M3-002 is the compatibility/branding follow-up, see its task report.
UMSC-M4-001 adds the Samsung TV frontend in `tv-app/`.

The implementation preserves explicit folder artwork, then falls back to real
artwork from the alphabetically first direct video file. It does not recurse
into nested folders and does not borrow generic video icons. The behaviour is
covered by five focused tests and an owner-triggered self-hosted Linux workflow.

## Current delivery state

- Source implementation: complete
- Workstation verification: all 12 focused custom-fork tests pass
- Linux runner: UMSC-M1-001 complete. Runner `gsvs-ums-custom` is online, idle
  and managed by an enabled user service with lingering.
- Linux verification: run `39638146430` at `a10969834` passed the separate
  12-test custom-fork step. Full suite: 532 tests, one reproduced baseline
  timeout failure, no errors, eight skips. Final cleanup passed.
- Runtime verification: isolated Windows startup, browsing, identical film and
  folder artwork, and HTTP 206 byte-range delivery passed.
- Pushed: source feature `5d745afc7`; runner and installation staging
  `a10969834`.
- Projects Hub: registered and pushed at Hub commit `b7cd71c`
- Merged: no
- Packaged: `ums-15.9.0-folder-artwork.jar`, see release record.
- Installed: yes, on 21 October 2026 after explicit owner shutdown confirmation.
  Installed jar hash matches the verified package. Live browsing, matching
  film/folder artwork and VLC direct-file HTTP 206 delivery passed.

Owner acceptance: Android VLC shows direct-film folder artwork. Samsung TV
does not show folder artwork, and both clients lost the Spidey discovery icon.
The previous jar comparison used a baseline that already lacked custom icons.
Private original artwork remains available. UMSC-M3-002 stages an external
profile icon loader and Samsung JPEG_SM/versioned-ID compatibility settings.
The live server has not been changed by this follow-up.

Latest request: build a small installable Samsung TV frontend. Target model is
known privately (2020 TU7100). Owner approved developer-mode network install.
App source and development build exist, with 14 passing Node contract tests.
Live UMS client browsing returned the root and kids library with artwork, and
subtree search returned matching titles. No live server restart was required.
18 Java regressions also pass on workstation JDK 21 compiling for Java 17.
Self-hosted run `39648265328` passed 18 Java custom tests and the app's 13 tests
and build. Full suite: 538 tests, only the previously reproduced Jetty timeout
failure, no errors, eight skips. Final cleanup passed.
Latest self-hosted run `39649720531` at `2c67c6add` passed 18 Java custom
regressions and the updated 14-test TV app checks/build. Full suite still has
only the known baseline timeout failure (538 tests, zero errors, eight skips).
Always-run cleanup passed.
Tizen baseline CLI is installed. Official SDB connected to the actual TV and
its capability response confirms Samsung TV, ARMv7 and Tizen 5.5, matching the
app target. Connection disappeared during standby, then returned when the
owner switched the TV back on. Developer Mode did not need re-enabling.
No signing profile exists yet. Certificate Manager is installed. The official
package manager stopped before the Samsung `cert-add-on` because it requires
explicit licence acceptance. The complete licence is open in a private local
file for the owner to review, and an acceptance question is pending. Do not
run `--accept-license` until the owner accepts that agreement. TV extension
tools and the Samsung certificate flow remain pending.
Signing requires a Samsung certificate for the TV, not an unsigned WGT.
No TV app installation is claimed.
Generic public app name: UMS TV Client. Owner-specific label and Spidey launcher
icon are configured only in ignored private build settings.
Do not flatten folders: the owner's conditional answer is a product discussion,
not approval for changing the existing DLNA layout.

Workstation fixture browser navigation/player/Back/search and live UMS rendering
passed using installed Chrome. All seven server discovery icons passed HTTP
byte comparisons in an isolated Windows instance, which has since been stopped.

The official `tizen build-web` command also passed against the private app
build; its output stays in ignored `tv-app/dist/.buildResult`. This is still
unsigned build validation, not installation or native playback acceptance.

Next: after explicit licence acceptance, finish official extension installation and the owner-assisted Samsung
certificate flow, sign and install, then verify actual playback/audio/seek. Private app
connection settings and original Spidey images stay out of Git. M3-002 remains
uninstalled and requires a separate UMS shutdown confirmation before deployment.

Detailed evidence: `docs/tasks/UMSC-M3-001-folder-thumbnails.md`,
`docs/tasks/UMSC-M1-001-linux-runner.md` and
`docs/releases/UMSC-M3-001-windows.md`.
