# UMSC-M5-001: Family library layout and verified move

DONE for the authorised file migration, 23 October 2026. Baseline commit
`fe6c27782ebe07f98830c0ff4bc75e1c25ec40bc`, existing feature branch.
Private media inventories/paths/journals stay outside Git. This is not a server
build/deployment or public release.

Owner approved family roots with films, tv and extras beneath kids and new
adult placement. Physical adult-root rename is still deferred. Clear 15+
material goes to Adults; designated grown-up films can also be curated there
without pretending they have a 15 certificate. Unresolved files stay off UMS.

Only identified metadata-ready DVD files with successful saved-packet reads
are eligible. Replacements need exact film/year or named series/episode evidence.
Combined/split and compilation overlaps stay held. Cross-volume moves use a
partial extension, full-file source/destination SHA-256 equality, publication,
then locked-source deletion. No long-term staging duplicates. Same-volume moves
preserve NTFS identity. Delete an old download only after its specific DVD
replacement is verified. Owner expressly does not want backup duplicates.

Frozen input inventories and per-file intent/completion journals underpin final
path/count/byte reconciliation and source-removal checks. Current DVD index
updates after each import. Historical intake reports become dated snapshots,
not apply plans. Reverse verified paths only after identity/hash and vacancy
checks. Deleted redundant downloads are not backed up; unresolved files are.

No encoding, track stripping, artwork work, database wipe or service restart.
Readable saved packets are not full decoding/watching or whole-disc recovery.
Metadata naming does not certify every title as suitable for young children.

Read-only catalogue testing found the new layout also needs a private app name
index refresh. Owner separately approved testing/in-place TV update, M5-007.
Preserve PIN/progress storage and record old-parent/title aliases privately.
Finish/reconcile transfers and empty old directories before that deployment.
No Git push/merge or publication authorised.

## Verified outcome

530 DVD videos moved, 808 existing files relaid out, 35 unresolved existing
videos preserved outside the share and 23 specifically replaced downloads
deleted. Final share has 1,245 videos and 93 companions. All 1,396 primary
operations reconcile against frozen inventories, paths, sizes and journals.
565 cross-volume moves passed full-file SHA-256 comparison before source
deletion. Same-volume identities passed again at their final destinations.

The owner requested a post-update naming sweep. A separate 45-file journal
consolidates seven family roots without changing filenames or media bytes.
97 genuinely empty old directories were removed, non-recursively. All 1,245
videos pass type/year/title naming and family/type layout checks. All appear
uniquely at the expected path in the final live SOAP catalogue. A film, episode
and extra each returned HTTP 206 with bytes matching the published local file.

83 newly eligible saved files passed complete packet reads, in addition to
earlier saved evidence. This is not full decoding, watching or disc recovery.
Metadata ambiguity, missing mains, optional extra labels and unknown original
source quality remain in private audit notes, not invented in filenames.

The supported adult-folder scan was accepted but did not refresh the client
view. Refreshing only that directory's modified timestamp invalidated its
stale listing. No media timestamp/content change, service restart or database
reset. Private current index/catalogues and immutable journals are authority;
older intake reports are preserved as pre-merge snapshots.

M5-007 is now DEPLOYED. Physical-TV acceptance is separate. The local PC's
UnknownRenderer diagnostic exposes a transcode MIME placeholder on some older
files, which the app parser omits in that view. Confirm the actual TV before
changing compatibility policy. This is not missing media or a rerip finding.
