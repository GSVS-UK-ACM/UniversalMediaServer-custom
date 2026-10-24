# UMSC-M5-010: GSVS README and clean branch integration

- Status: VERIFYING
- Date: 24 October 2026
- Baseline: feature/umsc-m3-001-folder-thumbnails at
  784c73201cd7afaa7e16868c9db70e7c308d0768.
- Target: main in xboxnuker-rgb/UniversalMediaServer-custom only.
- Authority: owner explicitly requests a clean push and merge, then a GSVS
  README introduction with image placeholders and the original README below.
  No upstream contribution, tag, public binary release or Hub push is implied.

## Scope

Use the referenced fork's idea of explaining custom work first, not its prose
or feature claims. The GSVS intro covers the actual server playback modes,
Samsung app, fixed-centre kids wall, queues, parental UI, family artwork,
metadata helpers, optional wake and verification limits. Keep original upstream
README text intact after an explicit divider. Screenshots remain labelled
placeholders, with no private family artwork or network details in Git.

Commit the reviewed project-continuity notes accumulated during the same
owner workflow. Private images, source files, inventories, logs, certificates,
connection configuration, generated builds and media remain outside the commit.
No application runtime code or server policy changes are part of this task.

## Verification and integration boundary

Fresh Windows workstation commands: npm run check, npm test (70 passed),
npm run build. Build output is ignored, unsigned and not installed.
git diff --check passes before staging. README preservation, local links and
commit privacy checks are required before publication.

Runtime code is unchanged from bfea788954c2c96880cc8aa1fc2a81e4d5f8ed12.
Existing approved Linux run 40015738405 on gsvs-ums-custom verifies app/custom
server tests and cleanup. The full Java suite retains the known M1-002 Jetty
timeout failure. Its overall result is failure, not all-green CI. No new Linux
runtime result is claimed for a documentation-only update.

The fork has no main branch protection or rulesets at inspection. Its main is
an ancestor of the feature branch. Use an ordinary non-forced fast-forward,
explicitly targeting origin/main. Keep the feature branch and all original
history. Do not push the upstream remote or change workflow governance.

## Handoff

After successful publication and a clean working tree, ask the owner:
"have you told the other chat to move it?"
Then return to the private family-artwork rollout. No repo directory move is
performed here. M5-009 remains in progress, with attention-needed art listed
privately and existing covers preserved where generation fails.

Delivery state and exact published commit are recorded after verification.
