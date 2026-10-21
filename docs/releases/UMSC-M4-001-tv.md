# UMSC-M4-001: Private Samsung TV installation

## Package identity

- Version: 0.1.0, application `GSVSUMSTVC.TVClient`.
- Transport filename: `UMSTVClient.wgt`.
- App source checkpoint: `eba8299ff227de87aaeac5e9276f787f692b01ec`.
- SHA-256: `C05FB700F61BE51A3A0CFB59F51539A83F48A39D0489507E15435D394EE70670`.
- Target: actual Samsung ARMv7 television, Tizen 5.5.
- Toolchain: official Tizen CLI 2.5.25, SDK 10 baseline, Samsung certificate
  extension 2.0.75 and TV extension tools. Owner created the signing profile.
- Owner-selected app label, PNG icon and LAN connection are private build
  overlays, not public repository assets. They remain inside the local package.

Official commands: `tizen build-web -out .buildResult -- <private dist>`, then
`tizen package -t wgt -s <owner profile> -- <compiled directory>`. The resulting
archive contains author and distributor signatures, manifest, icon and private
connection configuration. All required entries were verified before delivery.

## Installed evidence and limitation

The first transfer used the SDK-generated filename containing spaces and a
shell metacharacter. Transfer succeeded but installation failed without a
useful platform error. Copying the identical signed bytes to `UMSTVClient.wgt`
produced a successful install, with matching SHA-256. This isolates the transport
name as the observed difference; the private display label did not change.

The actual device reported all install-progress stages through 100%,
`app_id[GSVSUMSTVC.TVClient] install completed`, and
`Tizen application is successfully installed`.

The subsequent launch command lost its SDB target. Reconnection failed and
both the developer and normal TV API ports were unreachable. The owner was
asked to switch the TV on and open the installed app manually. Launch, visible
UI, native AVPlay, audio, seek, resume and physical D-pad acceptance are not
claimed from installation alone.

## Verification and recovery

App contracts, browser UI and actual UMS browse/search evidence are in
`docs/tasks/UMSC-M4-001-tv-app.md`. Latest app code passed 15 Node contracts and
the official SDK web build. Linux run `39683747016` passed the custom Java and
app steps, with successful final cleanup. The full 538-test Java suite retains
only the known baseline Jetty timeout assertion, zero errors and eight skips.

The packaging helper now uses a safe transport filename and supports either a
named target or direct SDB serial. Its PowerShell syntax was checked locally;
the equivalent signing, safe-name installation and signature/archive checks
were exercised on the real device. Uninstall remains through the TV Apps menu,
which removes this app's local progress state, not the UMS library. Future
updates must reuse the owner author certificate. Do not uninstall merely to
update. No live UMS jar/profile was changed in this TV deployment.

Delivery: privately packaged and installed, not merged or publicly released.
The existing source-only Projects Hub entry remains appropriate. No public
binary, private branding, certificate or device identifier was published.

## Owner acceptance and saved checkpoint, 21 October 2026

The owner subsequently opened the installed app manually, confirmed its visual
appearance and reported that starting UMS populated the library perfectly.
The initial disconnected view occurred while UMS was stopped. Launch and
populated browsing are now owner-observed. Native video/audio, seek, persisted
resume/watched and full physical remote behaviour remain unverified.

Latest source/tooling run [39685477408](https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/actions/runs/39685477408)
at `d1c86e08af87db126ca79127d25b462208185ca3` passed the custom Java regression
and TV check/build steps on the existing self-hosted runner. Full Java suite
still reports 538 tests, the same single Jetty timeout assertion, zero errors
and eight skips; final cleanup passed. No tests were rerun for this docs-only
checkpoint. Workstation `git diff --check` is the proportional patch check.

The owner requested a saved/pushed handover and project-manager entry before
finishing the remaining DVD rips. Backlog M5 records library/intake rules first,
then app polish. No library changes or further deployment occurred.

Hub checkpoint: one canonical source-project row covers the UMS fork and its
TV app, with direct app, feature-branch handover and backlog links. GitHub API
checks on 21 October confirm a public repository, disabled issues and zero open
PRs. The old zero-issue badge is corrected to disabled. This is a README-only
catalogue change, not a public package release or Android device acceptance.

Hub update was pushed to `main` at
`38887d8333fac720d8aef6d213149c995eea9562`. The row has four table cells and
exactly one canonical project entry. No Android rebuild or viewer refresh was
performed. This checkpoint follows the GSVS continuity workflow: short current
handover, stable future task IDs, detailed acceptance evidence here.

The owner confirmed one consolidated repository and Hub entry for both
components. Hub commit `34724fe65db3462de378aee77a2603a5380fa537` is pushed on
`main` and expands the same row with server/app functionality, pending native
acceptance and deferred library/polish work. Canonical-row and table-cell
checks plus `git diff --check` passed; the Hub working tree is clean.
