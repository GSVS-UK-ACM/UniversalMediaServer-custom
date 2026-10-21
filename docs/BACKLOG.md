# Backlog

Task IDs use the `UMSC` project prefix. Issued IDs are permanent.

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
- Progress: Source, five focused regression cases and the dedicated runner
  workflow are implemented. Workstation tests pass. Linux verification is
  waiting for the new repository runner instance to be registered on the GSVS
  box.

## Future direction

A child-friendly web library with a streaming-service-style home page and
search is the next product direction. It is intentionally outside
UMSC-M3-001 and still needs its own scoped milestone.
