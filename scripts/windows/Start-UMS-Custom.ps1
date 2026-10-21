$ErrorActionPreference = 'Stop'

$installDirectory = 'C:\Program Files\Universal Media Server'
$javaExecutable = Join-Path $installDirectory 'jre17\bin\javaw.exe'
$customJar = 'D:\GPTVibeCodes\UMS-runtime\ums-15.9.0-folder-artwork.jar'
$logFile = 'D:\GPTVibeCodes\UMS-runtime\startup.log'

function Write-StartupLog([string] $message) {
	Add-Content -LiteralPath $logFile -Value "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') $message"
}

try {
	# The installer-owned all-users shortcut starts the stock process first.
	# Give it time to settle, then replace only that UMS listener.
	Start-Sleep -Seconds 20
	$listener = Get-NetTCPConnection -LocalPort 5001 -State Listen -ErrorAction SilentlyContinue |
		Select-Object -First 1

	if ($listener) {
		$process = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)"
		if ($process.CommandLine -like "*$customJar*") {
			Write-StartupLog 'Custom UMS build is already running.'
			exit 0
		}
		if ($process.Name -ne 'javaw.exe' -or $process.CommandLine -notmatch 'ums\.jar') {
			Write-StartupLog "Port 5001 belongs to an unexpected process. No action taken: $($process.Name)"
			exit 1
		}

		Stop-Process -Id $listener.OwningProcess
		Wait-Process -Id $listener.OwningProcess -Timeout 20 -ErrorAction SilentlyContinue
		if (Get-Process -Id $listener.OwningProcess -ErrorAction SilentlyContinue) {
			Write-StartupLog 'The stock UMS process did not stop. No replacement was started.'
			exit 1
		}
	}

	$arguments = @(
		'-classpath',
		"update.jar;$customJar",
		'-Djava.net.preferIPv4Stack=true',
		'-Dfile.encoding=UTF-8',
		'--add-opens',
		'java.base/sun.nio.ch=ALL-UNNAMED',
		'net.pms.PMS'
	)
	Start-Process -FilePath $javaExecutable -ArgumentList $arguments -WorkingDirectory $installDirectory -WindowStyle Hidden
	Write-StartupLog 'Started the custom UMS build.'
} catch {
	Write-StartupLog "Startup failed: $($_.Exception.Message)"
	exit 1
}
