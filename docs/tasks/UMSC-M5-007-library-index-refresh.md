# UMSC-M5-007: Post-merge TV name and progress index refresh

VERIFYING physical-TV acceptance; PACKAGED and DEPLOYED 23 October 2026. Baseline commit
`fe6c27782ebe07f98830c0ff4bc75e1c25ec40bc`. Version 0.2.2 refreshes private
metadata; runtime JS/HTML/CSS is unchanged. Owner approved testing and in-place
installation when TV reachable, not Git push/merge/publication.

Sanitised resource slugs lose title separators, so non-season-coded episodes
in generic type folders fall back to a shared tv collection. Existing exact-name
overlay restores the separators without a runtime rewrite. Current read-only
server snapshot reproduces the generic group with the old index and removes it
with the prepared index. This is not physical-TV/artwork acceptance.

Generate private exact names from the frozen move plan and progress aliases from
pre-move DIDL parent/title identities. Retain earlier aliases transitively. Do
not guess ambiguous matches or include private workstation paths in the app.

Use the existing official Samsung signing profile, app ID and author certificate.
No uninstall, recovery nonce, PIN collection, storage reset, server restart or
artwork changes. Developer TCP reachability and official SDB reconnect passed.

Verify syntax/unit contracts, private snapshot grouping, fixture browser flows,
final read-only live catalogue, package version/signatures, runtime-byte equality
and author-chain equality against installed 0.2.1. Package, installed and owner
acceptance states stay separate. Keep previous signed rollback packages.

The approved Linux workflow/runbook was read. Runtime source is unchanged from
the earlier Linux-tested implementation. Private catalogue tests run locally;
do not upload private media data to public CI or substitute hosted compute.
Any fresh Linux version-manifest check not run remains explicitly unverified.

Canonical Hub row found. Update local delivery wording only after actual
deployment, preserving unrelated README edits/metrics. No Hub publication.
## Delivery and evidence

M5-001 file reconciliation passed before installation. Version 0.2.2, app ID
`GSVSUMSTVC.TVClient`, SHA-256
`40088388793F496CAB002C4F886B56100A11A3EED358853E2B0D8A4A1AA59179`.
Official Tizen SDK install and launch both returned zero. Author chain matches
0.2.1; both signatures present. Eight runtime JS/HTML/CSS files match installed
0.2.1 byte-for-byte. Manifest, npm manifest and lockfile versions agree.
Private overlay has 1,245 exact names and 2,205 progress aliases. Three ambiguous
pre-move mappings remain unguessed. No recovery nonce or workstation index path
is embedded. No uninstall, PIN collection, storage reset or server restart.

Workstation commands: `npm run check`, `node --test --test-reporter=dot
test/*.test.cjs` (54 pass), `npm run build`; `node scripts/browser-check.cjs`
under Chrome for online, offline and empty fixture scenarios (all pass).
Private package checks verify signatures, author chain and runtime equality.
Final live catalogue check finds every expected video at its family/type path;
private exact-name parsing removes the generic tv collection. Three direct
resource byte-range checks match their local film/episode/extra files.
`git diff --check` passes. No fresh Linux run or public push. Known prior Java
full-suite Jetty timeout remains, not an all-green CI claim.

PC SOAP uses UnknownRenderer. It advertises 165 transcode MIME placeholders
that the installed parser omits in that diagnostic view. Actual TV renderer
behaviour is not established by this snapshot. Four accented episode slugs
use schema fallback rather than the exact punctuation overlay. Neither is a
missing file. Preserve these follow-ups in M5-005's device checks; do not deploy
an untested server compatibility change as part of a filename migration.

Next: owner checks actual TV catalogue, playback, retained PIN and old progress.
Artwork remains a later audit. Local Hub row updated, not published. No commit,
push, merge, public release or Android rebuild.
