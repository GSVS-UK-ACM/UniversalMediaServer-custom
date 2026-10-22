param(
    [Parameter(Mandatory)][string]$Plan,
    [Parameter(Mandatory)][string]$Journal,
    [Parameter(Mandatory)][string]$LibraryRoot,
    [switch]$Apply
)
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Resolve-Path -LiteralPath $LibraryRoot).Path).TrimEnd('\') + '\'
$planPath = (Resolve-Path -LiteralPath $Plan).Path
$journalPath = [IO.Path]::GetFullPath($Journal)
if (Test-Path -LiteralPath $journalPath) { throw 'Journal already exists. Inspect recovery evidence instead of rerunning.' }
if ($root.TrimEnd('\') -eq [IO.Path]::GetPathRoot($root).TrimEnd('\')) { throw 'Select a library directory, not a drive root.' }
if ([IO.DriveInfo]::new([IO.Path]::GetPathRoot($root)).DriveFormat -ne 'NTFS') { throw 'NTFS identity verification is required.' }
if (-not ('LibraryRenameIdentity' -as [type])) {
    Add-Type -TypeDefinition @'
using System;
using System.ComponentModel;
using System.Runtime.InteropServices;
using Microsoft.Win32.SafeHandles;
public static class LibraryRenameIdentity {
    [StructLayout(LayoutKind.Sequential)] private struct Time { public uint Low, High; }
    [StructLayout(LayoutKind.Sequential)] private struct Info {
        public uint Attributes; public Time Creation, Access, Write;
        public uint Volume, SizeHigh, SizeLow, Links, IndexHigh, IndexLow;
    }
    [DllImport("kernel32.dll", SetLastError=true)]
    private static extern bool GetFileInformationByHandle(SafeFileHandle handle, out Info info);
    public static string Capture(SafeFileHandle handle) {
        Info i;
        if (!GetFileInformationByHandle(handle, out i)) throw new Win32Exception(Marshal.GetLastWin32Error());
        return String.Format("{0:X8}:{1:X8}{2:X8}:{3:X8}{4:X8}:{5:X8}{6:X8}:{7:X8}{8:X8}",
            i.Volume, i.IndexHigh, i.IndexLow, i.SizeHigh, i.SizeLow,
            i.Creation.High, i.Creation.Low, i.Write.High, i.Write.Low);
    }
}
'@
}
$rows = @(Get-Content -LiteralPath $planPath -Raw | ConvertFrom-Json)
$seen = @{}
$frozen = @{}
function Assert-SnapshotTime($File, $Row) {
    $actual = ([System.Numerics.BigInteger]$File.LastWriteTimeUtc.ToFileTimeUtc() - [System.Numerics.BigInteger]116444736000000000) * 100
    if ($actual.ToString() -ne [string]$Row.modifiedNs) { throw 'Exact snapshot write time changed.' }
}
foreach ($row in $rows) {
    $source = [IO.Path]::GetFullPath($row.source)
    $destination = [IO.Path]::GetFullPath($row.destination)
    if (-not $source.StartsWith($root, [StringComparison]::OrdinalIgnoreCase) -or -not $destination.StartsWith($root, [StringComparison]::OrdinalIgnoreCase)) { throw 'A path escapes the selected library root.' }
    if ($source -match '\\DVD-(Reviewed|Incoming|Excluded|Adverts|Needs-Attention)\\') { throw 'Offline rip/review folder is out of scope.' }
    if ([IO.Path]::GetDirectoryName($source) -ne [IO.Path]::GetDirectoryName($destination)) { throw 'Filename-only pass cannot relocate a title.' }
    if ($source -eq $destination) { throw 'No-op row should not be in an apply plan.' }
    if ($seen.ContainsKey($destination) -or (Test-Path -LiteralPath $destination)) { throw 'Destination exists or is repeated. No overwrites allowed.' }
    $seen[$destination] = $true
    $file = Get-Item -LiteralPath $source
    if ($file.PSIsContainer -or ($file.Attributes -band [IO.FileAttributes]::ReparsePoint) -or $file.Length -ne $row.bytes) { throw 'Source changed or is not a regular file.' }
    Assert-SnapshotTime $file $row
    # A complete preflight catches active writers before ANY file is renamed.
    $handle = [IO.File]::Open($source, [IO.FileMode]::Open, [IO.FileAccess]::Read, [IO.FileShare]::Read)
    try { $frozen[$source] = [LibraryRenameIdentity]::Capture($handle.SafeFileHandle) } finally { $handle.Dispose() }
}
Write-Output "Writer-free filename-only preflight passed: $($rows.Count) files."
if (-not $Apply) { return }
New-Item -ItemType Directory -Force -Path ([IO.Path]::GetDirectoryName($journalPath)) | Out-Null
[IO.File]::WriteAllText($journalPath, '')
$count = 0
foreach ($row in $rows) {
    # Hold the original NTFS identity and deny writers across the rename.
    # JSONL records both intent and result. An interruption must be inspected,
    # never silently resumed from a stale source path or an assumed overwrite.
    $handle = [IO.File]::Open($row.source, [IO.FileMode]::Open, [IO.FileAccess]::Read, ([IO.FileShare]::Read -bor [IO.FileShare]::Delete))
    try {
        $file = Get-Item -LiteralPath $row.source
        if ($file.Length -ne $row.bytes) { throw 'Source changed after preflight.' }
        Assert-SnapshotTime $file $row
        $identity = [LibraryRenameIdentity]::Capture($handle.SafeFileHandle)
        if ($identity -ne $frozen[[IO.Path]::GetFullPath($row.source)]) { throw 'Source identity changed after preflight.' }
        $entry = [ordered]@{ Phase='Intent'; Source=$row.source; Destination=$row.destination; Bytes=$row.bytes; Identity=$identity }
        [IO.File]::AppendAllText($journalPath, (($entry | ConvertTo-Json -Compress) + "`n"))
        if (Test-Path -LiteralPath $row.destination) { throw 'Destination appeared after preflight.' }
        Move-Item -LiteralPath $row.source -Destination $row.destination
        $after = [IO.File]::Open($row.destination, [IO.FileMode]::Open, [IO.FileAccess]::Read, ([IO.FileShare]::Read -bor [IO.FileShare]::Delete))
        try {
            if ([LibraryRenameIdentity]::Capture($after.SafeFileHandle) -ne $identity -or [LibraryRenameIdentity]::Capture($handle.SafeFileHandle) -ne $identity) { throw 'Renamed file identity/size/timestamps do not match.' }
        } finally { $after.Dispose() }
        $entry.Phase = 'Verified'
        [IO.File]::AppendAllText($journalPath, (($entry | ConvertTo-Json -Compress) + "`n"))
    } finally { $handle.Dispose() }
    $count++
    if ($count % 100 -eq 0 -or $count -eq $rows.Count) { Write-Output "Verified filename renames: $count / $($rows.Count)" }
}
