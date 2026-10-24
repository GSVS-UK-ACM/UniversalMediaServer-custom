<div align="center">

> **New repository home:** This project moved from `xboxnuker-rgb` to
> [GSVS-UK-ACM/UniversalMediaServer-custom](https://github.com/GSVS-UK-ACM/UniversalMediaServer-custom).
> Existing GitHub links redirect here. Keep using this checkout and update its
> `origin` URL to the organisation address.

# GSVS · UMS Custom + TV Client

### Your library. Your artwork. Your remote.

A custom Universal Media Server fork and a Samsung TV companion built for a
proper home library, from a simple kids' artwork wall to the parents' collection.

[![GSVS](https://img.shields.io/badge/GSVS-Custom_Build-8250df?style=for-the-badge)](https://github.com/xboxnuker-rgb/GSVS-Projects-Hub)
[![TV client](https://img.shields.io/badge/TV_Client-0.3.0-0969da?style=for-the-badge)](tv-app/README.md)
[![Samsung Tizen](https://img.shields.io/badge/Samsung-Tizen_5.5-1428a0?style=for-the-badge)](tv-app/README.md#samsung-developer-mode-and-signing)
[![Licence](https://img.shields.io/badge/Licence-GPL_v2-238636?style=for-the-badge)](LICENSE.txt)

[**TV app & setup**](tv-app/README.md) · [**Server changes**](CUSTOM_FORK.md) ·
[**Testing**](docs/TESTING.md) · [**Current handover**](docs/HANDOVER.md) ·
[**Original README**](#original-readme)

</div>

> 🖼️ **Hero image placeholder**
>
> Wide GSVS banner: the TV artwork wall, server and remote together.
> No private family names, media filenames or network details in the final image.

## One library, two ways in

The server shares the media. The TV app gives it a front end designed around
the remote, without relying on the television's basic DLNA folder browser.

| For the kids | For the parents | On the server |
| --- | --- | --- |
| A character-first artwork wall with a fixed centre selection. Arrows, OK and Back. | A separate library, search, Home controls and parental settings. | Per-device playback modes, folder artwork and the existing UMS streaming tools. |

This is an independent GSVS fork of
[Universal Media Server](https://github.com/UniversalMediaServer/UniversalMediaServer),
not an official UMS or Samsung release. Upstream authorship and credits remain
below. The upstream project still does the heavy lifting for media serving.

## 🍿 The TV side

### Explore by character, not by folder

- **A moving artwork wall.** The selected tile stays in the centre while the
  library moves around it. The whole catalogue wraps, with a mixed arrangement
  that stays stable while you browse.
- **A remote-first layout.** Fresh installs start at 5×3. Parents can choose
  other supported odd grid sizes with the arrows and Save. Valid saved sizes
  survive app updates.
- **Pause to read, press to watch.** Staying on a tile for a second shows its
  information. OK starts the film or collection directly.
- **Readable names.** Storage prefixes and source-quality details stay out of
  the title. Captions show the evidenced year and content type when available.
- **A familiar way back.** Playback completion or Back returns to the same wall
  position instead of rebuilding a different selection.

### Collections that do more than restart at episode one

- **TV shows play a full ordered cycle.** Each new selection advances the
  starting episode by one, wraps through the rest, then returns to the wall.
- **Extras shuffle.** Bonus-content collections get a shuffled playthrough.
- **Resume and watched markers stay on the TV.** Recent entries resolve their
  media URLs again before playback. This is local viewing state, not a cloud
  account or cross-device sync system.
- **Native playback.** Samsung AVPlay opens the media from UMS. OK pauses or
  plays, Left/Right seek 30 seconds, and Back stops playback.

> 🖼️ **Screenshot placeholders**
>
> 1. Kids' 5×3 wall with large character artwork and bottom captions.
> 2. Dwell information over the fixed centre tile.
> 3. Playback controls and the return to the selected tile.

## 🎨 One good image for the whole family

Choose a picture once for a film or character family. Its films, shows, extras
and queued clips inherit that artwork without needing a separate image per file.

```text
library/
  kids/
    character-family/
      family-cover.png
      films/
      tv/
      extras/
  adults/
    another-family/
      family-cover.jpg
      films/
```

- Keep exactly one `family-cover.jpg`, `.jpeg` or `.png` in the chosen folder.
- A nearer cover can override the master for a different series, adaptation or
  character design. Updating the master preserves those deeper choices.
- Parents can preview coverage and refresh pictures from UMS. The refresh
  clears artwork/browse caches, not viewing progress, the code or queue starts.
- Broken or ambiguous choices show a readable fallback and a diagnostic instead
  of an unrelated scraped poster. Cover images never enter playback queues.
- Bring your own selected artwork. The app does **not** generate images or
  include a collection of copyrighted character pictures in this repository.

Character-first cover refinement is ongoing. Separate **Film**, **Tv-Show** and
**Extras** artwork overlays are planned after the family masters, not a shipped
feature of 0.3.0.

## 🔐 Parents have their own controls

The app starts in kids' mode, including when it returns to the foreground.
The parents' side provides library browsing, search, saved Home selection,
**Reset Home to adult library**, grid controls and family-artwork refresh.

Initial parental entry uses the documented starter sequence `12345`, then asks
for a personal 5–10 digit code twice. That replaces the starter sequence. Code
records use salted PBKDF2 in TV-local storage. Updates should keep the same app
identity and signing certificate to preserve codes, Home and viewing data.

> [!IMPORTANT]
> The parental gate separates the app's interfaces. It is not server-side DLNA
> access control or an automatic age-rating filter. Parents still curate which
> titles belong in each library. Uninstalling the app clears its TV-local state.

> 🖼️ **Parents' screen placeholder**
>
> Library browsing beside the remote-only grid controls and artwork preview.
> Use synthetic settings, never a personal code or home-network address.

## 🖥️ The server side

### Pick playback behaviour per device

The desktop Status tab adds a playback selector to each renderer card without
replacing the device's renderer profile:

| Mode | Behaviour |
| --- | --- |
| **Automatic** | Standard UMS playback policy. |
| **Local · Direct play** | Serve the original file without transcoding or automatic bandwidth tests. The device must support it. |
| **Remote · 8 Mbps** | Direct play compatible media within the limit; transcode higher-bitrate or incompatible media with the selected cap. |
| **Remote · 4 Mbps** | The same policy with a lower bandwidth cap. |

Selections persist per renderer. Device-format compatibility still comes from
its UMS profile. Remote modes also check the bitrate cap when an extension list
would otherwise force streaming.

### Make the library easier to serve and maintain

- **Real folder artwork.** Where no explicit image exists, a real folder can
  inherit artwork from the alphabetically first direct video. Nested folders
  and generic video icons are not used as substitutes.
- **Samsung artwork handling.** Focused server/profile changes support the
  companion's artwork browsing. The TV app draws its own tiles and captions.
- **Filename-led metadata.** Film, episode, trailer and extra prefixes support
  grouping. Evidenced file names take priority over conflicting scraped titles;
  an unknown year is not invented from a file's modification date.
- **Careful library helpers.** Name planning, companion/progress aliases and
  first-pass artwork seeding have dry-run or explicit apply boundaries.
  Inventories and generated output stay private, outside Git.
- **Windows service operation.** The working installation can run without an
  interactive desktop window. Deployment and recovery evidence are documented
  separately from portable source setup.

> 🖼️ **Server screenshot placeholder**
>
> Renderer cards showing Automatic, Local and Remote playback choices.
> Hide device addresses and personal library paths.

## ⚡ Open the app, reconnect to the library

The TV app checks UMS first and retries a temporarily unavailable server while
it is in the foreground. Optional FRITZ!Box integration can request PC
Wake-on-LAN without an always-on relay or a separate Linux helper. Retries are
bounded; hiding the app cancels wake/reconnect work. There are no background
keepalive polls after a successful connection.

The PC and router still need compatible wake settings. Opening the app is the
trigger, not TV power-on by itself. A successful router request does not prove
that a sleeping or shut-down PC woke. Keep router credentials out of the app.

## 🛠️ Build your own setup

1. **Start with the server.** Read [the custom-fork notes](CUSTOM_FORK.md) and
   [test guidance](docs/TESTING.md). Server development uses Java 17 and Maven.
2. **Build the companion.** [The TV app guide](tv-app/README.md) covers Node 22+,
   private connection settings, Samsung Developer Mode and official SDK signing.
3. **Connect your own library.** Set the kids/adults paths privately, add chosen
   family covers and use the parents' controls for Home and grid size.
4. **Update in place.** Keep the app ID and author certificate. Do not uninstall
   or reset storage just to install an update.

Media, family branding, connection addresses, certificates and parental records
are not included. This is source code and a documented private test setup, not
a TV-store app or a newly published GSVS installer.

## 🚧 What is verified, and what is still being refined?

TV client **0.3.0** has been signed, installed in place and launched on the
tested Samsung setup. Node contracts, browser fixtures and the GSVS self-hosted
Linux app/custom-server checks have passed. These are different checks, not a
claim that every Samsung model or media format is supported.

The full Java suite still has a separately recorded upstream-baseline Jetty
timeout failure. Do not read the focused passes as all-green CI. Native
audio/seek, wake cycles and some retained-state checks remain device acceptance
work. Family-picture refinement and the later type overlays remain in progress.

| Follow the work | Where |
| --- | --- |
| Current checkpoint and exact next action | [Handover](docs/HANDOVER.md) |
| Features, open tasks and stable task IDs | [Backlog](docs/BACKLOG.md) |
| Commands, runner policy and verification limits | [Testing](docs/TESTING.md) |
| TV build, signing, controls and configuration | [TV app guide](tv-app/README.md) |
| Other GSVS projects | [GSVS Projects Hub](https://github.com/xboxnuker-rgb/GSVS-Projects-Hub) |

---

## Original README

The original upstream README is preserved below. Its releases, support links,
badges and contributor credits refer to upstream Universal Media Server, not
to a separate GSVS release.

<!-- BEGIN ORIGINAL README: preserved upstream content -->

# Universal Media Server
![Universal Media Server CI](https://github.com/UniversalMediaServer/UniversalMediaServer/workflows/CI/badge.svg) [![Crowdin](https://badges.crowdin.net/universalmediaserver/localized.svg)](https://crowdin.com/project/universalmediaserver) [![Licence](https://img.shields.io/github/license/UniversalMediaServer/UniversalMediaServer.svg)](LICENSE.txt) [![Latest release](https://img.shields.io/github/v/release/UniversalMediaServer/UniversalMediaServer.svg)](https://github.com/UniversalMediaServer/UniversalMediaServer/releases/latest) [![Contributors](https://img.shields.io/github/contributors/UniversalMediaServer/UniversalMediaServer.svg)](https://github.com/UniversalMediaServer/UniversalMediaServer/graphs/contributors)

[<img align="right" src="https://github.com/UniversalMediaServer/UniversalMediaServer/blob/main/src/main/resources/images/logo.png?raw=true" alt="Universal Media Server" width="256" height="auto"/>][1] 
Universal Media Server is a DLNA, UPnP and HTTP/S Media Server.
It is capable of sharing video, audio and images between most modern devices.
It was originally based on PS3 Media Server by shagrath, in order to ensure greater stability and file-compatibility.

Universal Media Server supports all major operating systems, with versions for Windows, Linux and macOS.
The program streams or transcodes many different media formats with little or no configuration.
It is powered by [FFmpeg][27], [MediaInfo][28], [Crowdin][29], [MEncoder][26], tsMuxeR, AviSynth, VLC, and more, which combine to offer support for a wide range of media formats.

## Current Project Members

* [ik666][32]
* [mik_s][7]
* [SubJunk][3]
* [SurfaceS][33]
* [valib][5]

## Sponsors

[Become a sponsor][36]

## Links

* [Website][1]
* [Forum][9]
* [Source code][10]
* [Official Releases][11]
* [Issue tracker][12]
* [Knowledge Base][13]
* [Infrastructure status][37]
* [Comparison of popular media servers][2]

## Thanks

##### Thanks for major code contributions:

* chocolateboy
* ditlew
* ExSport
* happy.neko
* [infidel][6]
* [js-kyle][31]
* [Nadahar][15]
* Raptor399
* Redlum
* renszarv
* [SharkHunter][4]
* skeptical
* taconaut
* tcox
* [threedguru][34]
* tomeko

##### Thanks for documentation and contributions to the community:

* DeFlanko
* meskibob
* Optimus_prime
* otmanix
* [squadjot][30]

##### Thanks for significant/frequent language translations:

* [AlfredoRamos][19]
* [josepma][16]
* [kaolsz][23]
* [Kirvx][17]
* [leroy][18]
* [OnarEngincan][22]
* [prescott_sk][24]
* [squadjot][21]
* [Tianuchka][20]

##### Special Thanks:

* boblinds and snoots for the network test cases :)
* sarraken, bleuecinephile, bd.azerty, fabounnet for the support and feedback
* ...And you!

---

## 🧩 Contributing

We welcome contributions from everyone!  
If you'd like to get started:

1. Fork the repository and clone your fork locally.  
2. Create a feature branch for your change (`git checkout -b feature-name`).  
3. Make your changes and test them.  
4. Push to your fork and open a Pull Request on GitHub.

See our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed setup and coding guidelines.

---

## 📜 License

Universal Media Server is released under the **GNU General Public License (GPL)**.  
For more information, see the [LICENSE](LICENSE) file included in this repository.

---

  [1]: https://www.universalmediaserver.com
  [2]: https://www.universalmediaserver.com/comparison/
  [3]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=2
  [4]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=62
  [5]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=683
  [6]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=171
  [7]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=10450
  [8]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=1194
  [9]: https://www.universalmediaserver.com/forum
  [10]: https://github.com/UniversalMediaServer/UniversalMediaServer
  [11]: https://www.universalmediaserver.com/downloads/
  [12]: https://github.com/UniversalMediaServer/UniversalMediaServer/issues?state=open
  [13]: https://support.universalmediaserver.com
  [15]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=4025
  [16]: https://github.com/josepma
  [17]: https://github.com/kirvx
  [18]: https://github.com/ler0y
  [19]: https://github.com/AlfredoRamos
  [20]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=573
  [21]: https://github.com/squadjot
  [22]: https://crowdin.com/profile/OnarEngincan
  [23]: https://github.com/K4r0lSz
  [24]: https://github.com/prescott66
  [26]: http://www.mplayerhq.hu/
  [27]: https://www.ffmpeg.org/
  [28]: https://mediaarea.net/en/MediaInfo
  [29]: https://crowdin.com/
  [30]: https://www.universalmediaserver.com/forum/memberlist.php?mode=viewprofile&u=55
  [31]: https://github.com/js-kyle
  [32]: https://github.com/ik666
  [33]: https://github.com/SurfaceS
  [34]: https://github.com/threedguru
  [36]: https://www.patreon.com/universalmediaserver
  [37]: https://stats.uptimerobot.com/k0YIB5IOhL
