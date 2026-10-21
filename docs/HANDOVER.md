# Handover

## Current task

UMSC-M3-001 is verifying on `feature/umsc-m3-001-folder-thumbnails`.

The implementation preserves explicit folder artwork, then falls back to real
artwork from the alphabetically first direct video file. It does not recurse
into nested folders and does not borrow generic video icons. Focused tests are
covered by five focused tests and an owner-triggered self-hosted Linux workflow.

## Current delivery state

- Source implementation: complete
- Workstation verification: all 12 focused custom-fork tests pass
- Linux runner verification: run `39594077028` queued, waiting for the new
  `ums-custom-ci` runner
- Pushed: source commit `5d745afc75775ff3b16d1af1eb0a4e26dfe80fe2`;
  verification head `5504b45a8b224a01289a52f390bab151211bc10a`
- Merged: no
- Packaged or installed: no

Do not change the live UMS installation until the owner confirms it is shut
down and explicitly approves installation.

Detailed evidence and remaining work are in
`docs/tasks/UMSC-M3-001-folder-thumbnails.md`.
