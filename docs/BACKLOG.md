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
  awaits explicit shutdown confirmation after an automatic approval block.

## Future direction

A child-friendly web library with a streaming-service-style home page and
search is the next product direction. It is intentionally outside
UMSC-M3-001 and still needs its own scoped milestone.
