# UMS custom fork

This fork adds a per-device playback-mode selector to each renderer card in the
desktop Status tab. The selector changes playback policy without replacing the
device's renderer profile.

Available modes:

- **Automatic** — standard UMS behaviour.
- **Local - Direct play** — streams the original file and never transcodes it.
- **Remote - 8 Mbps** — keeps direct play for compatible media at or below the
  limit, and transcodes higher-bitrate or incompatible media with an 8 Mbps cap.
- **Remote - 4 Mbps** — the same behaviour with a 4 Mbps cap.

Selections are saved per renderer in
`renderer-playback-modes.properties` inside the UMS profile directory. Both a
renderer UUID and its IP address are supported so a device without UPnP identity
still keeps its selection.

## Updating from UMS upstream

The official repository is configured as the `upstream` remote and this fork is
configured as `origin`. To bring in future UMS changes:

```powershell
git fetch upstream
git switch feature/per-device-playback-modes
git merge upstream/main
```

Resolve any conflicts, run the targeted test and a compile, then push the branch:

```powershell
mvn -Dtest=RendererPlaybackModeTest test
mvn -DskipTests compile
git push origin feature/per-device-playback-modes
```

Do not replace a working UMS installation until the custom build has passed
those checks and has been tried as a separate installation.
