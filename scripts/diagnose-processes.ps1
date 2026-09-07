$processes = Get-CimInstance Win32_Process | Where-Object { 
  $_.Name -match 'Bird|canaris|react-example' -or 
  ($_.ExecutablePath -and $_.ExecutablePath -match 'Bird|canaris|react-example')
}

if ($processes.Count -eq 0) {
  Write-Output "NO_BIRD_PROCESSES_RUNNING"
} else {
  $results = @()
  foreach ($p in $processes) {
    $results += [PSCustomObject]@{
      ProcessId = $p.ProcessId
      Name = $p.Name
      ExecutablePath = $p.ExecutablePath
      ParentProcessId = $p.ParentProcessId
      CommandLine = $p.CommandLine
    }
  }
  $results | ConvertTo-Json
}
