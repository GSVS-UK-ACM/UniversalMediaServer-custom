# Handover

## Organisation migration, 24 October 2026

`GHM-M1-001`: the canonical repository is now
[`GSVS-UK-ACM/UniversalMediaServer-custom`](https://github.com/GSVS-UK-ACM/UniversalMediaServer-custom).
GitHub repository identity, four branch heads, fork parent and runner ID `2`
were preserved by transfer. The existing Windows checkout remains in place.
The private runner route is now manual-only, restricted to `xboxnuker-rgb`,
because organisation ownership is not a human actor and another organisation
administrator has access. See the updated [runner runbook](runbooks/SELF_HOSTED_CI.md).
No server installation, service, TV app or private media/configuration changed.
Transfer evidence and final link acceptance are recorded under `GHM-M1-001`
in the GSVS Projects Hub. On migration source `87159ee3a`, self-hosted run
`40095905542` executed on `gsvs-ums-custom`: custom Java regressions, TV app
checks/tests/build and final cleanup passed. The full Java suite ran 538 tests
with one failure, zero errors and eight skips: only the already recorded
`JettyStreamClientImplTest.testJettyClientConnectTimeout` baseline mismatch
(SocketException instead of SocketTimeoutException, UMSC-M1-002). No all-green
Java claim or new runtime deployment is made. The runner reconnected after a
transient post-transfer offline interval without re-registration or host edits.

## README and integration checkpoint, 24 October 2026

[M5-010](tasks/UMSC-M5-010-readme-integration.md): GSVS feature intro and image
placeholders added above preserved upstream README. Commit 4b6e460c8 is pushed
to the feature branch and merged/pushed to fork main by ordinary fast-forward.
Main tracks origin/main; GitHub CLI default is the fork, not upstream.
Fresh workstation syntax, 70 tests and build
pass. Runtime remains the earlier Linux-tested source, whose full Java baseline
failure is still recorded. No private assets, binaries or configuration in Git.
After publication and clean status, ask the owner whether the other chat has
been told to move the checkout, then resume private artwork work.

## Active artwork audit, 24 October 2026

Owner supersedes the hitlist limit: generate all 77 distinct family covers
across 78 existing role folders and install reviewed results progressively,
keeping old image backups privately. Base covers have no text. Film/Tv-Show/
Extras overlays follow AFTER family covers, not in this pass. M5-009 tracks
per-family delivery separately from physical-TV confirmation. No app redeploy.

Current private artwork checkpoint: 43 role-family covers installed and verified
by hash plus live Samsung-profile image HTTP 200 checks. The remaining 34
distinct families (35 role folders) retain existing covers and need attention.
Generation failures and the two rejected source-image edits are recorded.
Owner asks for unresolved images as a final list rather than endless retries.

[M5-009](tasks/UMSC-M5-009-artwork-photo-audit.md): owner confirms pictures now
show, but supplies 40 photos identifying 34 family fixes. Private PHOTO-AUDIT-03.md
maps every principal tile. Prefer large instantly recognizable main characters,
not scenery/plain-clothes/supporting cast. Normalize shape/size across ALL
images, not just rejected families; 16:9 proposed, not yet implemented. Ben 10
issue is primarily portrait composition. Generated crisp art is now preferred
for most replacements, especially animation. Ben 10 candidate quality approved
by the owner, image and exact prompt saved privately. First parallel sample run
failed moderation, no usable output. This earlier sample/hitlist checkpoint is
superseded by the all-family rollout above. Ben 10, Fireman Sam, Postman Pat,
Bluey and Gruffalo are now sidecar-installed with verified previous-image
backups. Live Samsung-profile browse recognises exactly one cover for each and
all five image URLs return HTTP 200. Not physical-TV verified. No app redeploy.

## Latest delivery: 0.3.0 family artwork, 23 October 2026

Owner authorised implementation, provisional images for every family, feature
push for Linux checks and an in-place TV update. Local 0.3.0 uses portable
family-cover.jpg/jpeg/png sidecars, nearest deeper overrides and parent-only
preview/refresh. See [M5-006](tasks/UMSC-M5-006-family-artwork.md). No merge,
public release, PIN reset, media rename or UMS restart.

Private Family-Artwork evidence: 67 kids covers seeded, one Ben 10 preserved,
10 adult covers seeded. Fresh Samsung-profile replay has all 158 kids tiles
and 15 adult catalogue entries with images; all 1,245 video/queue identities
match 0.2.3. All 78 image URLs return HTTP 200. This is not native TV acceptance.
70 contracts, online/offline/empty/recovery fixtures and live browser rendering
pass. Linux app/custom/cleanup pass; full Java has only the known M1-002 failure.
Official SDK in-place install/launch both passed. Source bfea788954c2c96880cc8aa1fc2a81e4d5f8ed12;
package SHA and full evidence are in M5-006. Private configuration and author
chain unchanged, no PIN reset. All media identities/queues retained. Next: owner
checks actual pictures, refresh navigation and retained state. Hub local-only.

## Latest delivery: TV 0.2.3 artwork/name fix, 23 October 2026

[M5-008](tasks/UMSC-M5-008-catalogue-artwork-diagnosis.md) is implemented, tested,
pushed and privately DEPLOYED. Official SDK install/launch both passed. Source
`d264c8b6d1c9a09a37f978595f6b53f3aafc0af9`; package SHA and full evidence are
in that task. Missing server year no longer falsely rejects matching artwork;
readable labels leave media/progress/collection IDs unchanged. A live preview
caught poisoned cached images, so 24 privately reviewed filename keys stay
blocked. No PIN reset/uninstall, media rename or UMS restart.

61 contracts, online/offline/empty fixtures, live browser render and private
catalogue identity comparison pass. Linux app/custom Java/cleanup pass; full
Java retains only M1-002 (538 tests, one failure, eight skips), not all-green CI.
869 child artwork links are restored; the same 158 kids tiles remain, with 41
collections now having image links. Some film posters and 12 series collections
remain blank intentionally rather than showing wrong pictures. Owner visual
acceptance and planned M5-006 inheritance are next. Hub row local-only.

Owner's next nine physical-TV photos confirm readable labels and recovered
series/bonus pictures. Private PHOTO-AUDIT-02.md deduplicates the remaining
visible blanks and poor frames separately. See M5-008 follow-up. Full catalogue,
playback and retained-state acceptance remain unverified; no new deployment.

## Latest diagnosis: blank artwork and catalogue freshness, 23 October 2026

See [M5-008](tasks/UMSC-M5-008-catalogue-artwork-diagnosis.md). No runtime or
deployment change. Samsung-profile SOAP/parser replay retains all 1,245 videos,
with zero MIME placeholders; the prior 165-placeholder finding is specific to
UnknownRenderer. Kids replay produces 158 tiles containing 1,163 videos.
This is not a physical-screen completeness claim.

Artwork guard is over-strict when UMS omits a year: 893 suppressed links have
matching normalised names. Genuine unrelated matches must remain blocked.
Owner's seven photos confirm widespread blank art and raw-slug collection
labels. Owner then closed/reopened and reports the same result, no repeat photos
needed. Freshness did not resolve the observed blank pictures.
Do not redo the whole photo audit or manually replace every blank poster first.
Family inheritance remains planned M5-006. Next: direction for scoped
guard/display-label fixes and separate candidate testing.

## Verified library merge and TV 0.2.2 delivery, 23 October 2026

Owner approved M5-001 production family/type layout, metadata completion,
clear adult routing, verified DVD moves and redundant-download removal after
replacement. Unresolved material stays outside UMS. Staging originals are
deleted only after full-file copy/hash verification, not retained as duplicates.
See [M5-001](tasks/UMSC-M5-001-library-merge.md). Private media inventories,
journals and path authority remain outside Git. Migration is verified: 530 DVD
videos imported, 23 replaced downloads removed, 35 unresolved existing videos
held outside UMS. Final share has 1,245 videos plus 93 companions. Final sweep
corrected 45 family placements and removed 97 genuinely empty directories.
No imported staging originals remain. All expected files appear uniquely in
the live catalogue; film/episode/extra served-byte checks pass.

Owner also approved [M5-007](tasks/UMSC-M5-007-library-index-refresh.md), 0.2.2
private index refresh in place after file reconciliation. Current-server
snapshot tests reproduce generic TV grouping with the old index and remove it
with the new exact-name index. Progress aliases retain pre-move identities.
Runtime JS/HTML/CSS is unchanged. Package/test/installed/acceptance states remain
separate. No PIN reset/recovery request, uninstall, server restart or artwork
work. Official SDK installed and launched 0.2.2 in place. Exact package identity
and test evidence are in M5-007. No fresh Linux run, no all-green Java CI claim.
Owner checks actual TV playback, PIN/progress retention and catalogue next.
The PC UnknownRenderer snapshot includes 165 transcode MIME placeholders that
the app parser omits in that diagnostic view. Do not call that TV acceptance
or silently change server policy. Four accented slugs use schema fallback.
No push, merge, public release or new Hub metrics authorised by this task.

## Planned family artwork, 23 October 2026

Owner agreed [M5-006](tasks/UMSC-M5-006-family-artwork.md): choose an image for
a family master folder and inherit it downward through films, series and bonus
content. Nearest explicit deeper-folder override wins. Master-image changes
update inheriting descendants without replacing deeper overrides. No per-file
tags required; scraping must not replace chosen art. Storage/selector details
remain open. This is PLANNED, not implemented in installed 0.2.1.

Finish intake, content audit/cleanup and approved UMS transfer before the photo
audit of the full library. Keep 5x3, large images and bottom text. This request
adds local planning notes only, not media changes, image fetching or deployment.

## Latest delivery: TV 0.2.1 installed, 23 October 2026

Owner-approved in-place update and SDK launch succeeded, source
`4ead7ea2f2786d7b8f370fad016b2deb41a967cd`. See
[M5-005](tasks/UMSC-M5-005-tv-feedback.md) for package/run identities and checks.
Default 5x3, visible year/type, remote-only size buttons/Save and modal isolation
are implemented. Valid saved sizes survive. OK during slow code verification
no longer cancels login and starts a film. Private package requests the approved
one-time code-only recovery, not a total wipe. No UMS restart or media changes.

54 contracts and online/offline/empty/recovery browser flows pass; live read-only
render passes. Linux custom Java/app/cleanup pass; full suite retains only known
M1-002 (538 tests, one failure, eight skips). Not all-green CI.

Owner now confirms 0.2.1 code reset and new-code re-entry, working size controls
and preferred 5x3 layout with large artwork/text at the bottom. See M5-005's
owner acceptance update. Missing labels/artwork go to the later visual/library
audit; their causes are not all verified. Do not collect the personal code.
0.2.0 dwell/playback starting are confirmed. Explicit scrollbar, audio/seek,
queues, old progress and wake checks remain. Private build recovery request
was removed after delivery; retain signed recovery packages. Hub row
local-only, no Android rebuild/publication. Keep DVD staging offline. This
supersedes older pending-install checkpoints below.
Latest owner acceptance notes are local only, not pushed. No runtime changes.

## Active follow-up: first TV feedback, 23 October 2026

See [M5-005](tasks/UMSC-M5-005-tv-feedback.md). Owner confirms 0.2.0 wall,
working dwell info, parental setup and real playback starting. Saved-code
re-entry failed; density inputs/Save and scrollbar bleed need fixes. 0.2.1
adds visible tile year/type, 5x3 fresh default, remote button sizing/Save,
modal isolation, a slow-code-check/OK guard and owner-requested code-only
recovery. No player/dwell rewrite, media changes or UMS restart.

Owner approved pushing these fixes for the existing self-hosted checks and an
in-place update after verification. Local checks are in progress. Installed TV
still 0.2.0 until the later deployment checkpoint explicitly says otherwise.
Do not collect the personal code or wipe viewing state. Keep DVD staging off UMS.

## Latest delivery: TV 0.2.0 installed, 23 October 2026

Owner approved the TV update after turning it on, then authorised UMS startup
if needed. The existing Windows service was already Running and its configured
device description returned HTTP 200. No restart, server upgrade, root rename
or media changes were needed. Offline DVD staging remains off UMS.

The verified signed 0.2.0 package was installed in place with the same app ID,
then launched successfully through the official SDK. No uninstall or storage
reset. Source remains `d2d59a7d1993c9664ba10449c25ed7ebb0a222bb`; package hash
and deployment commands are in [M5-004](tasks/UMSC-M5-004-kids-wall-parent-controls.md).
This supersedes the installation hold and installed-0.1.1 statements below.

Next: owner checks the actual wall, arrows/OK/Back, numeric setup, playback,
audio/seek and persisted state. SDK launch is not physical-device acceptance;
M5-004 remains VERIFYING. Bootstrap `12345` must prompt a new personal 5-10 digit
code twice on the TV. Do not collect the personal code in chat or source.
Recovery packages remain private. This delivery evidence and the updated Hub
row are local only, not pushed; no merge, public release or Hub viewer rebuild.

## Current checkpoint: family wall candidate, 22 October 2026

Owner approved implementation and a feature-branch CI push before DVD intake
finishes, superseding the earlier rip-phase deferral below. **Do not install on
the TV until the owner approves that step.** See
[UMSC-M5-004](tasks/UMSC-M5-004-kids-wall-parent-controls.md).

Candidate app 0.2.0 implements the fixed-centre mixed artwork wall, parent-only
odd grid sizing (default 7x5), dwell information, direct playback, ordered TV
queues with a rotating start and shuffled bonus queues. Fresh launch/resume
locks to kids. No kids search/settings. Bootstrap `12345` requires a personal
5-10 digit code entered twice; parent settings allow code change and Reset Home.
This supersedes the earlier six-digit-only idea, not server-wide access control.

Explicit filename type/year/source now beats conflicting UMS online metadata.
Wrong lookup artwork/plots are suppressed, including inherited collection art.
Private exact-name and unambiguous old-progress aliases stay outside Git.
The adult role displays as **Adults** independently of its physical folder.
Owner deferred the locked physical adult-root rename and declined a service
restart. No titles were relocated; child-suitability/artwork audit remains open.

51 Node contracts and final online/offline/empty browser integration pass,
including a live read-only kids catalogue/render check.
Official SDK build/signing produced 0.2.0 without any target/serial argument.
No TV install/uninstall, service restart, server upgrade or binary publication.
Linux custom Java and app checks pass at `d2d59a7d1993c9664ba10449c25ed7ebb0a222bb`.
The full suite retains the known Jetty timeout failure: 538 tests, one failure,
zero errors, eight skips. Cleanup passes, so this is not all-green CI. Signed
package/source-byte evidence and the exact run are in the task report.
Installed TV remains 0.1.1; numeric input, performance, real playback/progress,
wake and artwork acceptance remain physical-device checks.

Next: request TV installation approval, then perform the pending device checks.
Keep ongoing DVD staging offline; do not start the final bulk migration or
adult-content curation as part of this UI/name-schema implementation.

The Hub README row is prepared locally for the 0.2.0 candidate, not pushed.
No Hub Android viewer rebuild or observed refresh is claimed.

## Written context consolidation, 22 October 2026

The owner now wants server, TV app and offline DVD intake work continued in one
chat using durable records. Start with the portable
[consolidation record](tasks/UMSC-M5-003-context-handover.md). The private
`UMS-LIBRARY-HANDOVER.md` beside the DVD staging status links actual local paths,
batch evidence, retry notes and the supplied earlier-chat archive. Private
paths/logs remain outside Git. This checkpoint changes documentation only;
it grants no live deployment, service restart or production media migration.

Offline staging naming/sorting is owner-authorised and separately journalled.
It does not authorise production migration. The storage prefixes `(film)`,
`(tv show)`, `(trailers)` and `(extra content)` are agreed. Current app
`cleanTitle` does NOT hide these prefixes yet. Preserve them on disk and handle
clean visible titles explicitly in M5-001/002.

New UI intent: kids use arrows, Enter and Back only, with NO SEARCH. A secret
six-digit sequence entered on the app home screen swaps to a hidden adult
view. This is lightweight separation, not server-wide access control. Exact
code, numeric remote support, reset/exit/relaunch policy and per-TV defaults
are not settled or tested. Await the owner's reference/explanation/drawings
before designing the rest. See M5-002. No interface implementation is claimed.

## Current checkpoint: TV app 21 October, Windows service 22 October 2026

Latest change: UMSC-M4-002, TV app **0.1.1**, is signed and installed after owner
approval. It probes UMS first, uses the always-on FRITZ!Box to wake the intended
PC only when unreachable, then refreshes automatically. Wake retries are capped
at three and at least 30 seconds apart; five-second connection retries stop
when ready or hidden. No idle keepalives, Linux relay, router credentials or
power-policy changes. Phones remain the manual WoL backup.

Workstation: 30 Node contracts, online/offline/empty browser scenarios, read-only
live UMS rendering, official SDK build and package checks pass. Linux runner is
offline, so compatible CI remains pending. Native sleep/shutdown-to-wake and
TV-local state acceptance remain owner checks, not claimed from installation.
See [wake/reconnect evidence](tasks/UMSC-M4-002-wake-reconnect.md).

The UMS fork and **UMS TV Client** share this repository. Continue on
`feature/umsc-m3-001-folder-thumbnails`; installed app source checkpoint is
`61ba1dc8572e51b8b5597181f3fed8c2b2a7c832`. The older Java verification
checkpoint remains separately recorded below.

The owner confirmed the installed TV app opens, looks good and populates the
library after UMS starts. Initial disconnection was observed while UMS was not
running. Native video/audio, seek, persisted resume/watched and physical remote
acceptance still need explicit checks. Do not infer them from browsing success.

The owner is finishing roughly 100 more DVD rips. Leave the working setup alone.
Next product work is **UMSC-M5-001**, agreeing a library layout and repeatable
addition/tagging/grouping rules, followed by **UMSC-M5-002**, app polish based on
that agreed contract. Both are PLANNED in [BACKLOG.md](BACKLOG.md). This earlier
checkpoint did not authorise production reorganisation, migration or deployment.
The later offline staging authority is recorded above, not a production rollout.

Owner subsequently authorised UMSC-M1-003, moving the existing build to Windows
service startup. That migration is installed and running under LocalService in
session zero with delayed automatic startup. Settings and library are unchanged;
both UMS login shortcuts are recoverably disabled. Manage it through Windows
Services and the existing web settings, not a second desktop UMS process.
Owner subsequently reported independent pickup, but the TV app needed reopening;
M4-002 addresses that app reconnect gap. The complete shutdown-to-TV wake test
still needs the owner. See the
[service task/recovery record](tasks/UMSC-M1-003-windows-service.md).

## Delivery and outstanding work

- UMSC-M3-001 folder-artwork server build is installed. Owner confirms inherited
  film-folder artwork in VLC; Samsung built-in Sources did not display it.
- UMSC-M3-002 persistent server-icon/Samsung metadata candidate is implemented
  and isolated-tested, but **not installed**. The server discovery icon fix is
  separate from the working private Spidey TV launcher icon. A live UMS update
  still requires a separate shutdown/deployment approval.
- UMSC-M4-001 TV app 0.1.0 is privately signed and installed on the actual
  Tizen 5.5 TV. Launch and populated UI are owner-observed; remaining device
  acceptance keeps the task VERIFYING. See its [release record](releases/UMSC-M4-001-tv.md).
- Work is pushed on the feature branch, not merged or publicly released.
- Private branding, LAN configuration, signed packages and signing keys remain
  outside Git. Preserve the owner author certificate for future app updates.
  Do not uninstall just to update, since that removes TV-local progress.

## Verification and project manager

Latest source/tooling Linux run [39685477408](https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/actions/runs/39685477408)
at `d1c86e08a` passed the custom Java regression and TV app check/build steps
on `gsvs-ums-custom`. Final cleanup passed. Full Java suite: 538 tests, one
known baseline Jetty timeout assertion, zero errors, eight skips. This remains
UMSC-M1-002, not an all-green suite. Earlier runtime/browser evidence is in the
task and release reports; this checkpoint changes documentation only.

Projects Hub keeps one canonical project entry for the fork and app, with
direct links to the app, this handover and backlog. Its README-only checkpoint
does not require an Android viewer rebuild. Hub publication evidence is in the
TV release record; actual viewer refresh is not claimed.

## Exact next action

When the owner says the rips are done, read this file and the backlog, inspect
the real library read-only with permission, and propose the naming/layout and
intake rules before changing files or binding app behaviour to a layout.
Retain category shelves, search and remote-friendly focus as product goals.
Finish the pending native playback checks before calling the TV task DONE.

Superseding UI clarification: search is not a kids-view goal. Preserve the
owner's arrows/Enter/Back-only requirement and agree the new layout before
implementing it. Search may remain an adult-view capability, pending design.

Detailed evidence: [folder artwork](tasks/UMSC-M3-001-folder-thumbnails.md),
[server branding](tasks/UMSC-M3-002-samsung-artwork.md),
[TV app](tasks/UMSC-M4-001-tv-app.md),
[Windows server delivery](releases/UMSC-M3-001-windows.md), and
[Linux runner](tasks/UMSC-M1-001-linux-runner.md).
