# UMSC-M4-001: Private Samsung TV installation

## Package identity

- Version: 0.1.0, application `GSVSUMSTVC.TVClient`.
- Transport filename: `UMSTVClient.wgt`.
- App source checkpoint: `eba8299ff227de87aaeac5e9276f787f692b01ec`.
- SHA-256: `C05FB700F61BE51A3A0CFB59F51539A83F48A39D0489507E15435D394EE70670`.
- Target: actual Samsung ARMv7 television, Tizen 5.5.
- Toolchain: official Tizen CLI 2.5.25, SDK 10 baseline, Samsung certificate
  extension 2.0.75 and TV extension tools. Owner created the signing profile.
- Owner-selected app label, PNG icon and LAN connection are private build
  overlays, not public repository assets. They remain inside the local package.

Official commands: `tizen build-web -out .buildResult -- <private dist>`, then
`tizen package -t wgt -s <owner profile> -- <compiled directory>`. The resulting
archive contains author and distributor signatures, manifest, icon and private
connection configuration. All required entries were verified before delivery.

## Installed evidence and limitation

The first transfer used the SDK-generated filename containing spaces and a
shell metacharacter. Transfer succeeded but installation failed without a
useful platform error. Copying the identical signed bytes to `UMSTVClient.wgt`
produced a successful install, with matching SHA-256. This isolates the transport
name as the observed difference; the private display label did not change.

The actual device reported all install-progress stages through 100%,
`app_id[GSVSUMSTVC.TVClient] install completed`, and
`Tizen application is successfully installed`.

The subsequent launch command lost its SDB target. Reconnection failed and
both the developer and normal TV API ports were unreachable. The owner was
asked to switch the TV on and open the installed app manually. Launch, visible
UI, native AVPlay, audio, seek, resume and physical D-pad acceptance are not
claimed from installation alone.

## Verification and recovery

App contracts, browser UI and actual UMS browse/search evidence are in
`docs/tasks/UMSC-M4-001-tv-app.md`. Latest app code passed 15 Node contracts and
the official SDK web build. Linux run `39683747016` passed the custom Java and
app steps, with successful final cleanup. The full 538-test Java suite retains
only the known baseline Jetty timeout assertion, zero errors and eight skips.

The packaging helper now uses a safe transport filename and supports either a
named target or direct SDB serial. Its PowerShell syntax was checked locally;
the equivalent signing, safe-name installation and signature/archive checks
were exercised on the real device. Uninstall remains through the TV Apps menu,
which removes this app's local progress state, not the UMS library. Future
updates must reuse the owner author certificate. Do not uninstall merely to
update. No live UMS jar/profile was changed in this TV deployment.

Delivery: privately packaged and installed, not merged or publicly released.
The existing source-only Projects Hub entry remains appropriate. No public
binary, private branding, certificate or device identifier was published.
