import { execSync } from 'node:child_process';
import fs from 'node:fs';

const psScript = `
$processes = Get-CimInstance Win32_Process | Where-Object { 
  $_.Name -match 'Bird|canaris|react-example' -or 
  ($_.ExecutablePath -and $_.ExecutablePath -match 'Bird|canaris|react-example')
}

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
`;

try {
  const output = execSync(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`, { encoding: 'utf8' });
  console.log('--- ACTIVE PROCESSES DIAGNOSTIC OUTPUT ---');
  console.log(output);
} catch (err) {
  console.error('Error querying processes:', err);
}
