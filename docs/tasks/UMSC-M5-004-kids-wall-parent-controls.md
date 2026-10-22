# UMSC-M5-004: Kids wall and parental controls

- Status: VERIFYING
- Owner: Codex, 22 October 2026.
- Baseline: `479fa853de0fb312b2af130bbc1caa0895784727`.
- Branch: `feature/umsc-m3-001-folder-thumbnails`.
- Existing uncommitted M5-003 documentation is preserved and integrated.

## Owner-approved scope

Implement and test, commit/push the feature branch for approved self-hosted CI,
then STOP before TV installation. No merge or public binary release. No server
upgrade, restart or unrelated media migration. Preserve private signing identity.

Kids always start in a fixed-centre, moving artwork wall. Grid dimensions are
configurable on the parent side, initially 7x5 odd dimensions. Spread franchises
and content types, shuffle once per wall session, and preserve spatial history
while browsing. Wrap across the whole collection, not just seven/five entries.
No kids navigation/settings/search beyond arrows, Enter, Back and the invisible
parental number sequence. Dwell reveals information in place; Enter plays directly.

Default bootstrap code is `12345`. First use requires a NEW 5-10 digit code
entered twice before granting parental access. Change it in parental settings.
The earlier six-digit-only proposal is superseded. Never commit the personal
replacement code. Existing parent shelves/search remain, add Reset Home, kids
density settings and explicit return to kids. App UI separation is not a UMS
server access-control boundary.

TV collections play an ordered full-cycle queue: first selection starts at
episode 1, second at 2, third at 3, wrapping once and returning to the wall.
Persist the next start per collection on this TV. Bonus collections shuffle
through once and return. Back stops the queue. Do not silently flatten every
episode into a top-level tile. Keep existing individual resume/watched state.

Naming work applies to existing non-rip production titles only. Preserve
quality/source evidence and sidecar relationships; journal reversible changes.
Owner removed the copied initial-review folder; exclude it even if it reappears.
Rename the adult root as requested, but NO relocation of individual titles.
Deadpool currently in the kids root is a known post-rip curation issue, not
permission to move it or claim that the kids folder is child-safe.

## Acceptance and verification plan

Pure contracts for filename metadata, mixed stable wall mapping, bounded scoped
catalogue, queue rotation/shuffle, bootstrap/confirmation/change validation,
storage failure and attempt timing. Browser integration for fixed-centre arrows,
dwell, direct playback, Back/finished queue restoration, no kids settings/search,
forced initial code change, parent controls and Reset Home. Preserve startup
online/offline/empty recovery tests and native player adapter contracts.

Run workstation syntax/unit/build/browser checks and approved Linux feature CI.
Build/sign only if tooling/private profile are available, with no target/serial
argument. Hardware numeric input, TV performance/artwork, native codecs/audio,
seek, wake and persisted state remain owner-supervised installation acceptance.

## Recovery and next action

Keep media-name journal and private inventory outside Git. Preserve prior TV
package and all local progress/certificate data. No uninstall, server rebuild,
power-state test or service restart. Document exact verification and package
identity before requesting installation approval.

## Implemented and workstation evidence

App candidate 0.2.0 retains the application/signing identity and existing player
and startup contracts. New `family.js` owns testable wall/spacing/catalogue/queue
and parental-code contracts; `family-ui.js` owns the view/gate. Parent shelves
and search remain. Role labels do not depend on the physical directory name.

`npm run check`, `npm test` and `npm run build` pass on Node 26.5.0 / npm 11.17.0.
51 contracts cover the original player/startup cases plus schema parsing,
grid/window bounds/reversibility, franchise spacing, ordered rotating starts,
bonus shuffle, catalogue limits/cancellation, personal-code confirmation/hash,
bootstrap rejection after setup, corrupt-record fail-closed and attempt cooldown.
Filename planners are tested against release parentheses, episode/season names,
unknown metadata and preserved existing labels. PowerShell rename preflight and
protected apply were exercised on the authorised private inventory.

Chrome 155 workstation fixture uses `TV_CHROMIUM_PATH` with
`node scripts/browser-check.cjs`. Online passes the full UI flow, queue finishes
1..6 then 2..6,1 and third selection starts at 3. Mismatched confirmation and
synthetic storage-full errors do not grant access. Personal-code change,
unambiguous rename-resume migration, Reset Home, parent search, density and
lock on hide/relaunch are covered. Final online/offline/empty and live read-only
runs are recorded below as they finish; no native TV acceptance is inferred.

## Naming integration and recovery

773 existing non-rip video filenames and 14 matching sidecar/subtitle names
were changed with writer-denying handles, exact snapshot timestamps and stable
NTFS volume/file identity. All 787 renames verified; no media bytes/tracks were
rewritten, no source files remained and no destination was missing. No title
relocation, duplicate deletion or DVD staging import. Quality/year hints were
retained from existing names, not claimed independently verified metadata.

The requested adult-root rename failed with Windows access denial both inside
and outside the workspace restriction. Owner explicitly deferred it and declined
a service restart. The app displays Adults but uses the unchanged physical root
through ignored private role paths. Do not retry by stopping UMS implicitly.

Live DIDL inspection found online lookups misidentifying some prefixed filenames.
The app now takes explicit filename labels from the resource URL before scraped
titles. A private 773-name overlay restores exact punctuation, with conservative
slug parsing for later additions. Conflicting plots/posters are suppressed;
collection artwork is selected only from validated children, not inherited bad
folder artwork. Release years never come from UMS file-modification dc:date.

770 old-title/parent aliases were recovered from pre-rename DIDL. Three ambiguous
matches remain recorded privately. Resume migration only applies to the intended
server, preserves newer state and refuses ambiguous edition matches. Actual
installed-TV migration acceptance is still pending. Kids/adult progress share
the TV-local store but adult Continue Watching does not show kids records.

Private inventory, CSV plan, exact-name overlay, before/after DIDL, JSONL rename
journal, current paths and pending-root record are held together outside Git.
Recover names by the journal's Source/Destination/Identity, accounting for the
explicit pending root state. Never overwrite an existing target or rerun a stale
apply plan. This pass is not the final content, artwork, duplicate or suitability
audit. Adult material known to remain in the kids root is deferred by the owner.

Official references checked for the hardware acceptance plan:
[numeric remote registration](https://developer.samsung.com/smarttv/develop/guides/user-interaction/remote-control.html)
and [Web Cryptography support](https://developer.samsung.com/smarttv/develop/faq/security.html).
These support implementation choices, not a claim of actual-device testing.

## Delivery checkpoint

Owner authorised committing/pushing this feature branch for its private Linux
CI. No merge or binary release. Linux run identity/results and final signed
package/source-byte evidence will be added after completion. Installed TV still
runs 0.1.1. STOP here for installation approval after checks, update in place
with the existing author certificate, and preserve the previous signed package.
