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

The fork currently reports zero registered self-hosted runners. A dedicated
owner-only workflow, cleanup script and registration runbook are included. The
exact pushed commit, run URL, job ID, runner identity, labels and final cleanup
result remain required before this task can be marked done.

## Delivery boundary

The owner authorised pushing the feature branch. Merge and installation are
not authorised. The live UMS service must remain untouched until the owner says
it is shut down and approves installation.
