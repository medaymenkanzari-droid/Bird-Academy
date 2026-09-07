# BIRD ACADEMY ENTERPRISE — TARGETED PROCESS CLOSURE HELPER
# Safely terminates all Bird Academy instances (RC1..RC3.1, Enterprise, Legacy)

$knownExeNames = @(
  'Bird-Academy-User.exe',
  'Bird-Academy-Admin.exe',
  'Bird Academy Enterprise.exe',
  'Bird Academy Enterprise Admin.exe',
  'Bird Academy User RC3.1.exe',
  'Bird-Academy-User-Windows-RC3.1.exe',
  'Bird Academy User RC3.exe',
  'Bird-Academy-User-Windows-RC3.exe',
  'Bird Academy User RC2.exe',
  'Bird-Academy-User-Windows-RC2.exe',
  'Bird-Academy-User-Windows-RC1.exe',
  'Bird Academy.exe',
  'react-example.exe'
)

$knownPathKeywords = @(
  'Programs\bird-academy-user',
  'Programs\bird-academy-admin',
  'Programs\react-example',
  'Programs\Bird Academy Enterprise',
  'Programs\Bird Academy User',
  'Programs\Bird Academy'
)

$procs = Get-CimInstance Win32_Process | Where-Object {
  $nameMatch = $knownExeNames -contains $_.Name
  $pathMatch = $false
  if ($_.ExecutablePath) {
    foreach ($kw in $knownPathKeywords) {
      if ($_.ExecutablePath -like "*$kw*") {
        $pathMatch = $true
        break
      }
    }
  }
  $nameMatch -or $pathMatch
}

if ($procs) {
  foreach ($p in $procs) {
    try {
      $gp = Get-Process -Id $p.ProcessId -ErrorAction SilentlyContinue
      if ($gp -and $gp.MainWindowHandle -ne 0) {
        $gp.CloseMainWindow() | Out-Null
      }
    } catch {}
  }

  Start-Sleep -Milliseconds 1500

  foreach ($p in $procs) {
    try {
      Stop-Process -Id $p.ProcessId -Force -ErrorAction SilentlyContinue
    } catch {}
  }

  Start-Sleep -Milliseconds 500
}
