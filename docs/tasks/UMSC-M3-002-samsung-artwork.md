# UMSC-M3-002: Samsung artwork and persistent server branding

- Status: IN_PROGRESS
- Branch: `feature/umsc-m3-001-folder-thumbnails`
- Baseline: `9aa187e9f`
- Owner: Codex, requested by repository owner on 21 October 2026.

## Scope and evidence

Owner reports inherited folder artwork works in Android VLC but not on the
Samsung UE50TU7100KXXU. Both clients lost the custom Spidey discovery icon.
The installed jar and previous custom playback jar both contain standard UMS
icons. The original private icon outputs and earlier jar backup still match.
The previous package comparison therefore checked the wrong visual baseline.

Restore branding through optional profile `server-icons/` files, with validation
and per-file bundled fallback. Keep private character artwork outside Git.
Use the existing newer Samsung-profile conventions in Samsung-UHD: a single
JPEG_SM album-art URI and versioned object IDs. Preserve codecs and seeking.
This is a compatibility candidate, not evidence of TV display acceptance.

Do not flatten folders without a separate owner choice. Keep one-level artwork
inheritance unchanged. No library/database reset or media-file mutation.

## Acceptance and verification

- Correct private PNG/JPEG icons served in all seven advertised sizes.
- Missing, corrupt, wrong-format and wrong-size overrides safely fall back.
- Samsung folder DIDL advertises one JPEG_SM album-art URI with a working image.
- Existing folder-artwork and playback regressions remain passing.
- Compatible tests execute on `gsvs-ums-custom`; retain known baseline failure.
- Isolated Windows runtime check before installation.
- Owner shutdown confirmation before installation, then physical TV retest.

Installation, push, merge and owner-observed TV acceptance are separate claims.
Rollback keeps the current jar, renderer profile and private icon directory.

## Current checkpoint

Source compiles and all 18 focused Java regressions pass on workstation JDK
21.0.11 compiling for Java 17. Five new icon-provider tests cover valid PNG/JPEG,
missing files, corrupt images, dimensions, MIME mismatch and oversized files.
A Samsung metadata test verifies one JPEG_SM album-art URI. No live change or
restart performed. Self-hosted verification is the next checkpoint.
Owner now requests a small Samsung TV app installable by USB, with rich rows,
categories and search as the intended direction. Official Samsung documentation
states ordinary WGT packages cannot be installed by USB. USB demo delivery uses
Seller Office packaging/licensing. Ask whether developer-mode network install
is acceptable before promising this delivery. Do not interpret the discussion
as approval for flattening the current DLNA folders.
