# Handover

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
