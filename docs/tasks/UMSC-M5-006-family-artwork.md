# UMSC-M5-006: Owner-selected family artwork with folder inheritance

- Status: IN_PROGRESS
- Agreed: 23 October 2026.
- Depends on: M5-001 library layout and content audit; M5-004 family catalogue.
- Delivery: Local 0.3.0 implementation and first-pass sidecar seeding. Verification
  and approved Linux/TV delivery are in progress, not yet deployed.
- Authority: Owner now explicitly requests implementation, sensible first-pass
  images for all families and later visual correction. Separately approved
  pushing this feature for Linux checks and updating the TV in place. No merge,
  public release, media relocation, PIN reset or UMS restart.

## Implementation checkpoint, 23 October 2026

Baseline `3b1fedf7934b72c49f404ae4109ed17b3ae2c7aa`, existing feature branch.
Portable choice: exactly one family-cover.jpg/jpeg/png in the actual folder.
UMS already serves these as image resources. The TV recognises only this named
sidecar, prefers a same-server JPEG rendition, validates decoding, and inherits
downward within each selected role root. A broken/duplicate deeper cover fails
closed with a diagnostic, not a scraper fallback. Removing it restores parent
inheritance. Explicit cover changes do not alter the automatic plot/art guard.

Parents have a bounded preview/refresh panel. Refresh re-browses UMS, busts image
URLs and preserves wall ordering/selection, PIN/progress and queue identities.
No per-file tags, image URLs in localStorage, server binary change or restart.
The owner prefers initial automatic suggestions, then photo review; a TV image
picker is not required. Choices are made/replaced on the PC. Existing choices
must be backed up before manual replacement. The seed tool creates missing
sidecars exclusively and never overwrites an existing choice. Private source,
timestamp and hash journals support undo by exact new-file/hash comparison.

Initial live data: 67 kids sidecars created, one existing Ben 10 PNG preserved;
10 adult sidecars created. All 78 family folders now have a file. This alone
does not prove UMS serving or TV coverage. Provisional scenes come from actual
family videos; no scraped poster downloads. Scene visibility scoring cannot
guarantee an ideal character image. Private evidence is in the existing merge
workspace's Family-Artwork directory, never in Git.

Collection grouping is intentionally unchanged. If a series/bonus collection
spans several branches, its tile takes the first explicit available child image
in browse order; children retain their own overrides. Do not split collections
and reset queues merely to represent artwork branches.

Final local check/build and all 70 contracts pass, including three seed-tool
safety tests. Online/offline/empty/recovery browser fixtures pass inheritance,
parent-only refresh and retained personal code. Read-only Samsung-profile live
browser render passes. Fresh live SOAP comparison against 0.2.3 preserves every
video and queue identity: kids 1,163 videos / 158 tiles, adults 82 videos / 15
catalogue entries. Every tile has an image; 68 kids and 10 adult explicit covers,
all 78 image URLs HTTP 200, no folder-art errors. Contact sheet reviewed as a
provisional set, not owner approval. No supported folder rescan was needed.

Commands: `npm run check`, `node --test --test-reporter=dot test/*.test.cjs`,
`npm run build`; `node scripts/browser-check.cjs` with the documented scenario,
recovery and live renderer environment variables. `git diff --check` passes.
Private `Family-Artwork/verify.cjs` records live coverage and old/new identities.
Linux checks and package verification are next. No deployed 0.3.0 claim yet.

The original plan below is historical where superseded by this checkpoint.

## Agreed behaviour

The owner selects an image for a content family's master folder. All its
descendant content uses that chosen image, including films, series, bonus
collections and individual extras. Folder membership defines the family; no
per-file tagging or loose filename-substring matching is required.

A deeper folder can have its own chosen image, for example separate animated
and live-action branches. The nearest explicit owner-selected folder image
wins. Its descendants inherit it until a deeper explicit override applies.
Changing the master image updates all inheriting descendants but leaves deeper
overrides untouched. Removing an override restores parent inheritance.

This is a deliberate family image, not a scraper suggestion. Automatic UMS
metadata or generated thumbnails must not silently replace the owner's chosen
image. Keep title, evidenced year and Film/Series/Bonus content labels so shared
art does not make different content indistinguishable. Missing artwork without
any selected ancestor retains the existing safe fallback behaviour.

Preserve the owner-approved 5x3 wall, large images and bottom tile text. Artwork
inheritance must not change kids/adults routing or imply age suitability.

## Timing and photo audit

Finish DVD intake, audit/clean the content, then preview and approve copying the
completed library into UMS. The photo/artwork audit comes after that, not against
today's small partial library. Implementation timing can be agreed after the
folder layout is settled, before the full visual audit needs the selector.

During that later audit, the owner sends overlapping photos while scrolling.
Repeated tiles are expected. Consolidate sightings by actual title/year/type/
edition and record coverage plus missing/wrong/unclear art or labels. Owner
preferences populate one private hit list. Use a family-level fix where useful,
then deeper folder overrides for the exceptions. Do not mistake repeat photos
for duplicate media, or unseen content for accepted artwork.

## Implementation decisions still open

Choose the portable storage contract (folder sidecar artwork, an explicit index,
or another reviewed method), parent-only image selection flow and how the app
resolves those choices through UMS. Exact asset names, file formats and picker
mechanics are not selected yet. Explicit ownership/inheritance must survive
rescans and app restarts, with recoverable replacement of previous choices.

Keep private media paths, images and catalogue data out of source control. Scope
inheritance to the intended library root. A missing or invalid chosen image
needs a clear fallback/diagnostic, not an unrelated scraped poster. Refresh
affected caches so master changes reach descendants without wiping viewing
state or changing the wall arrangement unnecessarily.

This differs from M3-001's installed server feature, which inherits a direct
child's image upward to an otherwise empty folder. M5-006 is explicit selected
parent-to-descendant inheritance. Do not claim the former already implements
this design or silently broaden the server's existing one-level contract.

## Acceptance and verification plan

- One selected master image applies across mixed films, series and extras.
- A nested animation/live-action override wins and propagates only below it.
- Updating the master changes inheriting descendants, not overridden branches.
- Removing a nested override restores the inherited parent image.
- Scraping/rescans/relaunch do not overwrite selected choices; stale artwork
  refreshes and existing PIN/progress/queue/home state remains intact.
- Missing/corrupt images are handled visibly and safely, without wrong posters.
- Inheritance does not cross the configured root or change audience routing.
- Validate pure resolution/cache contracts and browser flows using synthetic
  data, then owner-observed image selection/update on the real TV after a
  separately approved build/deployment. Use the approved Linux runner for
  compatible automated checks, not hosted compute.

Next action: finish intake and agree the final content/folder layout. Then
inspect the current implementation and select the storage/selector contract
before implementing M5-006. No runtime checks were run for this plan-only edit.

Project continuity: existing canonical Hub entry remains the same project and
delivery state. No new package/public release or Hub metrics change is implied.
This plan and its handover/backlog links are local only, not pushed.
