# Handover

## Current task

UMSC-M3-001 is verifying on `feature/umsc-m3-001-folder-thumbnails`.

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

Next: owner refreshes VLC/TV browsing and checks artwork and playback on those
devices. Device acceptance is not yet claimed. No further restart is needed.

Detailed evidence: `docs/tasks/UMSC-M3-001-folder-thumbnails.md`,
`docs/tasks/UMSC-M1-001-linux-runner.md` and
`docs/releases/UMSC-M3-001-windows.md`.
