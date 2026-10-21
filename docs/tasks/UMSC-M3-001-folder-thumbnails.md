# UMSC-M3-001: Direct-film folder thumbnails

## Objective

Make filesystem folders easier for children to recognise. If a folder has no
explicit artwork, UMS should use real artwork from a video directly inside it.

## Scope and decisions

- Existing `folder.jpg`, `folder.png`, album art and folder media metadata keep
  first priority.
- Only direct readable video files are candidates. The implementation never
  searches grandchildren.
- Candidate filenames are compared case-insensitively and then by their exact
  names so selection is repeatable on Windows and Linux.
- Sidecar artwork is tried before media parsing. If none exists, UMS reuses the
  normal media database and thumbnail-generation path.
- `RealFile` exposes a real-artwork-only stream. This prevents containers from
  mistaking its generic media icon for actual artwork.
- Missing or broken child artwork falls through to the next direct video and
  finally the standard folder icon.

## Acceptance evidence

Regression coverage:

1. A folder inherits artwork from a direct video.
2. Explicit folder artwork has priority.
3. Multiple videos use stable filename order.
4. A nested video's artwork is not inherited.
5. A media-art lookup with no real art returns `null`, not the generic video
   icon.

## Verification

Workstation, Windows 11, 21 October 2026:

```powershell
mvn -Dtest=RealFolderThumbnailTest test
```

Result: PASS. Five tests ran with no failures, errors or skips. Main and test
sources compiled with Java 17. `git diff --check` also passed.

The final focused custom-fork regression set also passed:

```powershell
mvn '-Dtest=RealFolderThumbnailTest,RendererPlaybackModeTest,RendererConfigurationTest' test
```

Result: PASS. Twelve tests ran with no failures, errors or skips: five folder
thumbnail cases, four playback-mode cases and three renderer-configuration
cases.

The first sandboxed Maven attempt stopped before Java compilation because its
redirected Corepack cache path did not exist. Repeating the same command with
the normal user Corepack cache passed. This was a workstation sandbox issue,
not a source or test failure.

At the initial checkpoint the fork had no registered self-hosted runners. A
dedicated owner-only workflow, cleanup script and registration runbook were
added. The source implementation was pushed as
`5d745afc75775ff3b16d1af1eb0a4e26dfe80fe2`. The verification and evidence
head is `5504b45a8b224a01289a52f390bab151211bc10a`. Linux run `39594077028`, job
`119202005136`, is queued against that head. The earlier source-only run
`39593844565` was cancelled after the verification head superseded it, avoiding
two full jobs on the same runner. Runner identity, labels, result and final
cleanup evidence remain required before this task can be marked done.

### Superseding Linux and runtime checkpoint

UMSC-M1-001 provisioned the dedicated runner. Final workflow `39638146430`
passed all 12 custom-fork tests, then ran the full 532-test suite with one
reproduced baseline Jetty timeout failure, no errors and eight skips. Final
cleanup passed. Detailed runner and baseline evidence is recorded once in
`docs/tasks/UMSC-M1-001-linux-runner.md`.

The packaged Windows runtime also passed startup against a cloned existing
profile, real UPnP browsing, identical HTTP image responses for a film and its
direct parent folder, and HTTP 206 byte-range delivery. Package identity,
rollback and deployment state are in `docs/releases/UMSC-M3-001-windows.md`.

The canonical fork is registered in the GSVS Projects Hub as a source-only
project. The verified 0-issue, 0-PR snapshot was pushed in Hub commit
`b7cd71c` on 21 October 2026.

## Delivery boundary

The owner authorised pushing the feature branch and later authorised runner
setup and installation. Automatic approval review blocked the installation
command because the earlier explicit shutdown-confirmation condition was still
retained. No installation command executed. The requested confirmation is
pending. Merge is not authorised.
