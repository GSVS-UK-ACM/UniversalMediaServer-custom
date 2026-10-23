# UMSC-M5-008: Post-merge catalogue and artwork diagnosis

IN_PROGRESS, owner authorised implementation, testing and in-place TV update.
Owner separately authorised committing/pushing only these fixes for Linux CI.
Baseline
`fe6c27782ebe07f98830c0ff4bc75e1c25ec40bc`, existing dirty feature branch
preserved. Installed 0.2.2 stays unchanged until the tested candidate is ready.
Private media/photo/log evidence stays outside Git. No server restart, encoding,
media rename/move, family-image inheritance, PIN recovery or storage wipe.

## Implemented 0.2.3 candidate

Absent reported year no longer contradicts an otherwise matching title. Both
known years must still agree. Different titles, sequels, episodes and edition
labels remain blocked; filenames stay authoritative and file dates are ignored.
Collection labels prettify canonical lower-case slugs only, preserving supplied
human casing/punctuation. Raw collection IDs, child filenames, progress keys
and saved rotation keys stay unchanged. Parent folder labels share that display
helper. No request broadening, periodic polling or MIME policy change.

Five new regression contracts were first run against the old implementation:
four failed as expected, one existing protection passed. After implementation,
all 59 contracts pass, as do syntax/build and the online Chrome fixture. The
browser fixture checks a matched missing-year artwork link loads, a readable
collection label appears and the original queue ID remains. Existing code,
progress, queue, density and audience-boundary fixture flows still pass.

Private Samsung snapshot replay retains every video and the same 158 kids tiles.
893 previously suppressed links now survive; 351 other conflicts remain blocked.
No assertion that every recovered link is the desired owner-selected poster.
Remaining browser scenarios, fresh live rendering, approved Linux CI and signed
package checks/install are required before calling this delivered.

### Live-preview correction before deployment

The first live preview exposed a stale wrong poster under a now-correct reported
title. That candidate was held, not installed. Matching names alone cannot
prove UMS replaced its cached artwork. A private image-byte audit of all 894
eligible links found 24 exact matches to that visually confirmed wrong poster.
The final candidate carries reviewed filename-key rejections scoped to the
indexed server. Those items remain playable but their stale artwork/plot stays
hidden. Keys/hash evidence remain private, not committed. No database wipe,
server restart, automatic image guessing or family-image implementation.

Final implementation adds two contracts for matching-title stale rejection and
server isolation, bringing the workstation count to 61. The browser also checks
the explicitly rejected image never paints. Expected restored links are now
869, not the earlier 893, while original file/progress/queue identities remain.
Private exact-name/progress/connection settings are unchanged except the new
reviewed rejection list. Final package/test identities supersede the held one.

## Findings

UnknownRenderer's PC SOAP snapshot advertises 165 transcode MIME placeholders
which the app excludes. A read-only Samsung model-header replay selects the
same Samsung LED UHD profile recognised for the physical TV. It advertises all
1,245 videos with zero placeholders. Installed core parser retains all 1,245;
kids catalogue contains 1,163 videos grouped into 158 tiles, not one tile per
episode. This is profile replay evidence, not a physical-screen completeness
claim. Actual UMS logs confirm TV recognition and some playback requests.

The title-identity artwork guard compares years literally. When UMS omits a
year, it suppresses artwork even if normalised names agree. Of 1,244 suppressed
links in the replay, 893 have matching names. Other conflicts include genuinely
wrong online matches, so removing the guard wholesale is not a safe fix.
Seven overlapping owner photos show many blank tiles and one working poster,
consistent with that result. They also show raw filesystem slugs as collection
labels. Filename correctness alone does not provide clean collection labels.

The app caches successful browses without expiry until a reconnect/Home clears
them. Kids reload reuses that cache. Foreground visibility reconnects; ready
state does not poll. Owner clarified the photos were before closing/reopening
and will repeat only that freshness test. Do not demand another full photo set.
Chosen family-image inheritance remains M5-006 PLANNED, not an installed feature.

## Verification and limits

Private diagnostic commands: `snapshot-dlna.ps1` with Samsung-model UserAgent,
then `node diagnose-samsung-catalogue.cjs` using the unmodified core parser and
family catalogue. Every expected video retained; no generic tv group.
The script reconstructs DIDL from captured SOAP fields, so it is a parser
replay, not actual TV DOM inspection. No native playback assertion.

Official SDB connection was present. No debug launch, uninstall, PIN/storage
read/reset, server policy change, restart, media change or deployment. Packet
monitor status was access-denied; no capture/filter started. No runtime source
changed, so Linux/build suites were not rerun for this diagnostic-only task.

## Next scoped work, not yet implemented

Owner closed/reopened and reports no visible change. No repeat photo set needed.
Freshness did not resolve these blank pictures. Obtain direction for a tested artwork-conflict
fix: absent year is unknown, not contradictory, while genuine title/edition
conflicts remain blocked. Add readable collection display labels independently
of filesystem slugs. Keep family inheritance under M5-006. Any refresh design
must preserve cancellation, kid/adult boundaries and foreground-only traffic.
TV installation requires applicable approval for the new candidate.
