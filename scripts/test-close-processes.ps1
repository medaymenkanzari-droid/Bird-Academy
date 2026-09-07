$knownExeNames = @(
  'Bird Academy Enterprise.exe',
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

Write-Output "Matching processes found: $($procs.Count)"
if ($procs -and $procs.Count -gt 0) {
  foreach ($p in $procs) {
    Write-Output "Target process: PID=$($p.ProcessId), Name=$($p.Name), Path=$($p.ExecutablePath)"
  }
}
