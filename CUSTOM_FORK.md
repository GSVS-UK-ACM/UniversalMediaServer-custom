# UMS custom fork

## Child-friendly folder artwork

When a real folder has no artwork of its own, this fork uses real artwork from
the alphabetically first video directly inside it. Explicit folder artwork
still wins, nested folders are not searched, and generic video icons are not
reused as folder artwork.

This fork adds a per-device playback-mode selector to each renderer card in the
desktop Status tab. The selector changes playback policy without replacing the
device's renderer profile.

Available modes:

- **Automatic** uses standard UMS behaviour.
- **Local - Direct play** streams the original file and never transcodes it. It
  also bypasses UMS automatic bandwidth testing completely.
- **Remote - 8 Mbps** keeps direct play for compatible media at or below the
  limit, and transcodes higher-bitrate or incompatible media with an 8 Mbps cap.
- **Remote - 4 Mbps** has the same behaviour with a 4 Mbps cap.

Remote modes ignore renderer and global extension lists that force files to
stream. This makes sure the selected bitrate cap is always checked. Format and
codec compatibility still comes from the device renderer profile.

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
mvn -Dtest=RendererPlaybackModeTest,RendererConfigurationTest test
mvn -DskipTests compile
git push origin feature/per-device-playback-modes
```

Do not replace a working UMS installation until the custom build has passed
those checks and has been tried as a separate installation.

The included `VLC-Android-Samsung-S24-Ultra.conf` profile gives VLC on the
Samsung S24 Ultra the normal Android direct-play defaults. Keep Automatic
maximum bandwidth disabled in UMS when using the explicit Local and Remote
modes. Media-library scanning at startup is a separate setting and can stay off
on large libraries.

## Windows protected-install fallback

If Windows blocks replacing `ums.jar` in Program Files, keep the tested custom
jar at `D:\GPTVibeCodes\UMS-runtime\ums-15.9.0-folder-artwork.jar` and use
`scripts/windows/Start-UMS-Custom.ps1` from a per-user Startup shortcut. The
helper waits for the installer-owned UMS process, verifies that it owns port
5001, then replaces only that process with the custom jar. It never changes
Program Files or Windows security settings.
