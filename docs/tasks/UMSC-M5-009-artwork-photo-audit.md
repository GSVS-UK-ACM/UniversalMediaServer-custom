# UMSC-M5-009: Character-first artwork and consistent thumbnail format

- Status: IN_PROGRESS
- Date: 24 October 2026
- Depends on: deployed M5-006 family-cover inheritance, app 0.3.0.
- Scope: owner photo hitlist, generated replacement candidates and consistent
  image composition/shape across the library. Preserve title/queue/progress
  identities and child/adult boundaries. No server binary or media migration.
- Delivery: audit/candidate preparation, not a new deployed app or published art.

## Owner decisions

Superseding scope, 24 October: owner explicitly replaces the photo-hitlist-only
approach with generated character-first covers for EVERY existing family folder,
installing each reviewed result as work proceeds. Inventory: 78 role folders,
77 distinct family keys (Spider-Man occurs in both roles). Preserve recoverable
old bytes, prompts and per-install hashes privately. Do not generate repeated
child covers yet. After family covers are sorted, add neat Film, Tv-Show and
Extras overlays per child type. Base images remain text-free. No app package
installation or server restart is required or implied by sidecar updates.
Earlier 34-family scope and preview-only boundary below are historical.

Owner approves the displayed early batch as spot on, and requests varied
family-appropriate backgrounds rather than one repeated setting. When built-in
generation rejects a subject, the owner now authorises finding good source
artwork and editing its framing/canvas as needed. Preserve source URLs and
original files. Use the image tool for requested visual edits, inspect sources
first, and record any further failures instead of attempting to evade blocks.

The owner confirms the wall now has artwork, then supplies an initial set of
40 close-up photos. The principal photographed tiles reduce to 34 families.
A photo showing only extras still flags its shared family image. Do not read
the selected tile type literally or count overlapping photos as duplicate files.
Private PHOTO-AUDIT-03.md contains every photo-to-family mapping and brief.

Recognition, not merely a successfully decoded picture, is the acceptance
criterion. The main character/cast must be large and obvious at normal tile
size: Spider-Man in costume, not ordinary clothing or a back-of-head shot.
Avoid scenery, supporting characters and obscure dialogue frames. Garfield and
some Toy Story images are positive examples, not blanket rejection targets.

All images need consistent landscape shape, dimensions and subject scale,
including otherwise accepted pictures. Proposed standard is 16:9; exact output
pixel dimensions and the implementation of whole-library normalization are
still to be verified. Never stretch characters or retain DVD-case borders.
Ben 10's objection is its portrait shape/size, not an expressed rejection of its
character design. Recompose or replace without misrepresenting that preference.

Owner first allowed image generation as fallback, then asked for most covers
to be generated if crisp, especially animated subjects. Built-in imagegen is
the chosen route, no API key or paid CLI fallback requested. Generated art is
illustrative library artwork, not an official still or new metadata evidence.
Keep prompts/source provenance and private images outside Git.

## Work and acceptance

Latest checkpoint: all requested family generations have been processed,
including the earlier samples. 43 distinct covers are now installed across
43 role folders. Their candidate/previous-image hashes verify, each role folder
has one recognised sidecar, and all 43 Samsung-profile image URLs return HTTP
200. All currently installed generated outputs are 1672 x 941. This is near
16:9 and consistent across these outputs, not a claim of exact whole-library
normalization or physical-TV acceptance.

34 distinct families across 35 role folders remain unresolved, with original
covers retained. 32 have explicit generation errors; Spider-Man and Cinderella
remain unresolved from the initial combined rejected sample. Cars and Big Hero
6 also failed a legitimate source-image presentation edit after source review.
Owner requests a final attention-needed list and will investigate leftovers
later. Do not label an original retained cover as a new completed replacement.

Current rollout checkpoint: Ben 10, Fireman Sam, Postman Pat, Bluey and Gruffalo
are installed as family sidecars. Owner confirms the first displayed set is
spot on. All five candidate/original hashes match their private installation
journals and backups. Read-only live Samsung-profile browse recognises exactly
one cover each, and each image URL returns HTTP 200. This is server/client
contract verification, not a claim of seeing the new images on the TV.
Private ROLLOUT.md, inventory.json, installed journals, exact prompt files and
live-verification.json are the rollout evidence. No server or app code changed.
The earlier preparation-only statements below are historical, not current.

All 40 photos manually inspected, private family hitlist recorded. Prepare
representative quality candidates before the broad generation pass. The first
Spider-Man/Cinderella attempt failed output moderation with no usable result;
the response did not identify which subject caused rejection. A separate Ben 10
candidate succeeded and the owner approved its crisp character-first quality.
The selected image and exact prompt are saved in the private audit workspace,
with the original output retained. No live replacement yet. This is a quality
checkpoint, not a guarantee that every generated subject will pass unchanged.
Judge recognizability, fidelity, crispness, simple composition,
consistent landscape canvas and absence of unwanted words/borders. Preserve
existing cover bytes before any later live replacement. Deeper folder overrides
remain available for animated/live-action or character-version differences.

No runtime source changed, images downloaded, live covers replaced or TV package
installed for this checkpoint. No CI rerun for documentation/image review.
Owner's new generation request authorises candidate artwork, not another
unspecified application deployment or public asset release. Do not claim that
global normalization is implemented merely because its standard is recorded.

Next: inspect generated samples, record paths/prompts and quality outcome, then
continue the 34-family artwork batch at the agreed quality. A second owner photo
pass follows replacements. Existing Hub identity/delivery remains 0.3.0; no new
release boundary or metrics change from the audit alone.
