# UMSC-M5-010: GSVS README and clean branch integration

- Status: DONE for README and authorised source integration
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

## Published outcome

PUSHED and MERGED by ordinary fast-forward on 24 October 2026. Integration
commit: 4b6e460c8c4b0d97d4cc65d47c74867694557593. The feature branch and fork
main both received that commit. No force push, history rewrite, PR, release,
tag or upstream push. Main now tracks origin/main rather than upstream/main;
the local GitHub CLI default is explicitly the owner's fork.

The staged change was Markdown only. Targeted credential, local-path and LAN-
address checks passed. New README local links exist. Its original upstream
section matches the prior README exactly after newline normalization. Fresh
syntax, all 70 Node contracts and unsigned build pass. The existing Linux source
evidence and full-Java baseline exception above remain the accurate runtime
verification record. No fresh Linux run is claimed for these documentation edits.

Hub checkpoint: the existing canonical Workshop row already describes 0.3.0.
That separate checkout has overlapping uncommitted README and Android work, so
it is not committed or published here. The source/TV/handover/backlog links can
now use main instead of feature/umsc-m3-001-folder-thumbnails. Pending targets:
https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/tree/main
https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/tree/main/tv-app
https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/blob/main/docs/HANDOVER.md
https://github.com/xboxnuker-rgb/UniversalMediaServer-custom/blob/main/docs/BACKLOG.md
No product version, download claim or Hub metric change follows this source
integration. Existing feature links remain valid because the branch is kept.
