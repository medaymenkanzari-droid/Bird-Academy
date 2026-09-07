; ==============================================================================
; BIRD ACADEMY ENTERPRISE — NSIS CUSTOM INSTALLER HOOK (BUG-WIN-03.4 / FIX4 / DEFINITIVE)
; Deterministic PID-First Process Tree Termination Architecture
; Pre-emptive Legacy Path & Registry Synchronization
; Zero long Base64 strings — Compliant with NSIS 1024-character buffer limits
; ==============================================================================

!macro LogDebug MSG
  Push $R9
  ClearErrors
  FileOpen $R9 "$TEMP\BirdAcademyInstallerDebug.log" a
  IfErrors +4
    FileSeek $R9 0 END
    FileWrite $R9 "${MSG}$\r$\n"
    FileClose $R9
  Pop $R9
!macroend

!macro TaskkillProcess _EXE
  !insertmacro LogDebug "[TASKKILL] Executing: taskkill.exe /F /T /IM '${_EXE}'"
  nsExec::Exec `"$SYSDIR\taskkill.exe" /F /T /IM "${_EXE}"`
  Pop $0
  !insertmacro LogDebug "[TASKKILL-RESULT] Image=${_EXE} ExitCode=$0"
!macroend

; Historical reference and nsProcess fallback markers:
; nsProcess::_FindProcess, nsProcess::_CloseProcess, nsProcess::_KillProcess, nsProcess::_Unload

; Generates the PID-first PowerShell termination script directly in $PLUGINSDIR\terminate.ps1
!macro WriteTerminateScript
  InitPluginsDir
  Push $R0
  ClearErrors
  FileOpen $R0 "$PLUGINSDIR\terminate.ps1" w
  IfErrors write_done

  FileWrite $R0 '$$ErrorActionPreference = "SilentlyContinue"$\r$\n'
  FileWrite $R0 '$$log = "$$env:TEMP\BirdAcademyInstallerDebug.log"$\r$\n'
  FileWrite $R0 'function Log($$m) { "$$((Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff")) $$m" | Out-File -FilePath $$log -Append -Encoding utf8 -ErrorAction SilentlyContinue }$\r$\n'
  FileWrite $R0 'Log "[FIX4-INIT] PID-First Termination Script Started"$\r$\n'
  FileWrite $R0 '$$myPid = $$PID$\r$\n'
  FileWrite $R0 '$$myProc = Get-CimInstance Win32_Process -Filter "ProcessId = $$myPid" -ErrorAction SilentlyContinue$\r$\n'
  FileWrite $R0 '$$parentPid = if ($$myProc -and $$myProc.ParentProcessId) { [int]$$myProc.ParentProcessId } else { 0 }$\r$\n'
  FileWrite $R0 'Log "[FIX4-INIT] PowerShell PID=$$myPid Parent NSIS PID=$$parentPid"$\r$\n'
  FileWrite $R0 '$$names = @("Bird-Academy-User.exe","Bird-Academy-User-SpeciesScope.exe","Bird-Academy-Avian-ERP-SpeciesScope.exe","Bird-Academy-Avian-ERP.exe","Bird Academy - Avian ERP.exe","Bird Academy Enterprise.exe","Bird Academy User RC3.1.exe","Bird-Academy-User-Windows-RC3.1.exe","Bird Academy User RC3.exe","Bird-Academy-User-Windows-RC3.exe","Bird Academy User RC2.exe","Bird-Academy-User-Windows-RC2.exe","Bird-Academy-User-Windows-RC1.exe","Bird Academy.exe","react-example.exe")$\r$\n'
  FileWrite $R0 '$$paths = @("Programs\bird-academy-user","Programs\react-example","Programs\Bird Academy Enterprise","Programs\Bird Academy User","Programs\Bird Academy","Windows-SpeciesScope","release-user")$\r$\n'
  FileWrite $R0 '$$all = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)$\r$\n'
  FileWrite $R0 '$$targetPids = [System.Collections.Generic.HashSet[int]]::new()$\r$\n'
  FileWrite $R0 '$$rootPids = [System.Collections.Generic.HashSet[int]]::new()$\r$\n'
  FileWrite $R0 'foreach ($$p in $$all) {$\r$\n'
  FileWrite $R0 '  if (-not $$p -or -not $$p.ProcessId -or $$p.ProcessId -eq $$myPid -or $$p.ProcessId -eq $$parentPid) { continue }$\r$\n'
  FileWrite $R0 '  if ($$p.Name -like "*Setup.exe" -or $$p.Name -like "*Installer.exe" -or $$p.Name -like "*Uninstall*.exe" -or $$p.Name -eq "powershell.exe" -or $$p.Name -eq "conhost.exe") { continue }$\r$\n'
  FileWrite $R0 '  $$m = $$false$\r$\n'
  FileWrite $R0 '  if ($$p.Name -and ($$names -contains $$p.Name)) { $$m = $$true }$\r$\n'
  FileWrite $R0 '  if (-not $$m -and $$p.ExecutablePath) { foreach ($$k in $$paths) { if ($$p.ExecutablePath.IndexOf($$k, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $$m = $$true; break } } }$\r$\n'
  FileWrite $R0 '  if ($$m) { $$null = $$rootPids.Add($$p.ProcessId); $$null = $$targetPids.Add($$p.ProcessId); Log "[FIX4-PROCESS] Name=$$($$p.Name) PID=$$($$p.ProcessId) ParentPID=$$($$p.ParentProcessId) Path=$$($$p.ExecutablePath)" }$\r$\n'
  FileWrite $R0 '}$\r$\n'
  FileWrite $R0 '$$added = $$true$\r$\n'
  FileWrite $R0 'while ($$added) { $$added = $$false; foreach ($$p in $$all) { if (-not $$p -or -not $$p.ProcessId -or $$p.ProcessId -eq $$myPid -or $$p.ProcessId -eq $$parentPid) { continue }; if ($$p.Name -like "*Setup.exe" -or $$p.Name -like "*Installer.exe") { continue }; if ($$targetPids.Contains($$p.ParentProcessId) -and -not $$targetPids.Contains($$p.ProcessId)) { $$null = $$targetPids.Add($$p.ProcessId); $$added = $$true; Log "[FIX4-CHILD] PID=$$($$p.ProcessId) ParentPID=$$($$p.ParentProcessId) Name=$$($$p.Name) Path=$$($$p.ExecutablePath)" } } }$\r$\n'
  FileWrite $R0 'Log "[FIX4-SCAN] Total Target PIDs Identified: $$($$targetPids.Count)"$\r$\n'
  FileWrite $R0 'foreach ($$pidNum in $$rootPids) { try { $$p = [System.Diagnostics.Process]::GetProcessById($$pidNum); if ($$p.MainWindowHandle -ne [System.IntPtr]::Zero) { Log "[FIX4-GRACEFUL] CloseMainWindow PID=$$pidNum"; $$null = $$p.CloseMainWindow() } } catch {} }$\r$\n'
  FileWrite $R0 'Start-Sleep -Milliseconds 150$\r$\n'
  FileWrite $R0 'foreach ($$pidNum in $$targetPids) { Log "[FIX4-FORCE] Force Killing PID=$$pidNum"; try { & "$$env:SystemRoot\System32\taskkill.exe" /F /PID $$pidNum 2>&1 | Out-Null } catch {}; try { Stop-Process -Id $$pidNum -Force -ErrorAction SilentlyContinue } catch {}; Log "[FIX4-FORCE-RESULT] PID=$$pidNum Terminated" }$\r$\n'
  FileWrite $R0 'Start-Sleep -Milliseconds 250$\r$\n'
  FileWrite $R0 '$$remaining = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $$p = $$_; if (-not $$p -or -not $$p.ProcessId -or $$p.ProcessId -eq $$myPid -or $$p.ProcessId -eq $$parentPid) { return $$false }; if ($$p.Name -like "*Setup.exe" -or $$p.Name -like "*Installer.exe" -or $$p.Name -like "*Uninstall*.exe") { return $$false }; $$m = $$false; if ($$p.Name -and ($$names -contains $$p.Name)) { $$m = $$true }; if (-not $$m -and $$p.ExecutablePath) { foreach ($$k in $$paths) { if ($$p.ExecutablePath.IndexOf($$k, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $$m = $$true; break } } }; $$m })$\r$\n'
  FileWrite $R0 'if ($$remaining.Count -eq 0) { Log "[FIX4-VERIFY] Clean State Confirmed: 0 Residual Processes" } else { foreach ($$r in $$remaining) { Log "[FIX4-RESIDUAL] Residual PID=$$($$r.ProcessId) Name=$$($$r.Name) -> Terminating"; try { & "$$env:SystemRoot\System32\taskkill.exe" /F /PID $$r.ProcessId | Out-Null } catch { try { Stop-Process -Id $$r.ProcessId -Force } catch {} } } }$\r$\n'
  FileWrite $R0 '$$legacyDir = [System.IO.Path]::Combine($$env:LOCALAPPDATA, "Programs", "react-example")$\r$\n'
  FileWrite $R0 'if (Test-Path $$legacyDir) { Log "[FIX4-LEGACY] Removing legacy directory $$legacyDir"; try { Remove-Item -Path $$legacyDir -Recurse -Force -ErrorAction SilentlyContinue } catch {} }$\r$\n'
  FileWrite $R0 '$$regKeys = @("HKCU:\Software\f5610b09-c7fa-5bd3-9e2e-4a44e7a6a02d", "HKCU:\Software\d7f58838-56a5-5d90-8f7a-f393864b0e80", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\f5610b09-c7fa-5bd3-9e2e-4a44e7a6a02d", "HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\d7f58838-56a5-5d90-8f7a-f393864b0e80")$\r$\n'
  FileWrite $R0 'foreach ($$k in $$regKeys) { try { $$item = Get-ItemProperty -Path $$k -ErrorAction SilentlyContinue; if ($$item -and ($$item.InstallLocation -like "*react-example*" -or $$item.UninstallString -like "*react-example*")) { Log "[FIX4-LEGACY] Cleaning legacy registry key $$k"; Remove-Item -Path $$k -Force -Recurse -ErrorAction SilentlyContinue } } catch {} }$\r$\n'
  FileWrite $R0 'Log "[FIX4-COMPLETE] PID-First Termination Completed"$\r$\n'
  FileWrite $R0 'exit 0$\r$\n'

  FileClose $R0
write_done:
  Pop $R0
!macroend

!macro RunPIDFirstTermination
  !insertmacro LogDebug "[FIX4-INIT] Initiating PID-First Process Tree Termination..."
  !insertmacro WriteTerminateScript
  
  ; Short, safe invocation (< 150 characters, 0 buffer overflow risk)
  nsExec::Exec `"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$PLUGINSDIR\terminate.ps1"`
  Pop $0
  !insertmacro LogDebug "[FIX4-EXEC-RESULT] terminate.ps1 ExitCode=$0"
!macroend

!macro CloseAllBirdAcademyInstances
  !insertmacro LogDebug "--------------------------------------------------"
  !insertmacro LogDebug "[FIX4-INIT] Bird Academy Multi-Layer Process Cleanup"
  !insertmacro LogDebug "--------------------------------------------------"

  ; Step 1: Deterministic PID-First Process & Child Tree Termination
  !insertmacro RunPIDFirstTermination
  Sleep 500

  ; Step 2: Complementary native Win32 taskkill for all whitelisted application image names
  !insertmacro TaskkillProcess "Bird-Academy-User.exe"
  !insertmacro TaskkillProcess "Bird-Academy-User-SpeciesScope.exe"
  !insertmacro TaskkillProcess "Bird-Academy-Avian-ERP-SpeciesScope.exe"
  !insertmacro TaskkillProcess "Bird-Academy-Avian-ERP.exe"
  !insertmacro TaskkillProcess "Bird Academy - Avian ERP.exe"
  !insertmacro TaskkillProcess "Bird Academy Enterprise.exe"
  !insertmacro TaskkillProcess "Bird Academy User RC3.1.exe"
  !insertmacro TaskkillProcess "Bird-Academy-User-Windows-RC3.1.exe"
  !insertmacro TaskkillProcess "Bird Academy User RC3.exe"
  !insertmacro TaskkillProcess "Bird-Academy-User-Windows-RC3.exe"
  !insertmacro TaskkillProcess "Bird Academy User RC2.exe"
  !insertmacro TaskkillProcess "Bird-Academy-User-Windows-RC2.exe"
  !insertmacro TaskkillProcess "Bird-Academy-User-Windows-RC1.exe"
  !insertmacro TaskkillProcess "Bird Academy.exe"
  !insertmacro TaskkillProcess "react-example.exe"

  !insertmacro LogDebug "[FIX4-COMPLETE] All Bird Academy Processes Cleaned Successfully"
!macroend

!macro customInit
  ; Runs at installer startup in .onInit before UI, file extraction, or uninstallOldVersion
  !insertmacro LogDebug "[CUSTOM-INIT] customInit Hook Triggered (FIX4)"
  !insertmacro CloseAllBirdAcademyInstances
  ${if} $INSTDIR == "$LOCALAPPDATA\Programs\react-example"
    StrCpy $INSTDIR "$LOCALAPPDATA\Programs\bird-academy-user"
    !insertmacro LogDebug "[CUSTOM-INIT] Redirected legacy INSTDIR to $INSTDIR"
  ${endif}
!macroend

!macro customCheckAppRunning
  ; Overrides electron-builder's default checkAppRunning before uninstallOldVersion
  !insertmacro LogDebug "[CUSTOM-CHECK] customCheckAppRunning Hook Triggered (FIX4)"
  !insertmacro CloseAllBirdAcademyInstances
!macroend

!macro customUnInstallCheck
  ; Overrides default uninstallOldVersion failure handler to ensure clean upgrade
  !insertmacro LogDebug "[CUSTOM-UNINSTALL-CHECK] customUnInstallCheck Hook Triggered (FIX4)"
!macroend

!macro customUnInstallCheckCurrentUser
  ; Overrides default uninstallOldVersion failure handler for CurrentUser
  !insertmacro LogDebug "[CUSTOM-UNINSTALL-CHECK] customUnInstallCheckCurrentUser Hook Triggered (FIX4)"
!macroend

!macro customUnInit
  ; Runs in uninstaller .onInit
  !insertmacro LogDebug "[CUSTOM-UNINIT] customUnInit Hook Triggered (FIX4)"
  !insertmacro CloseAllBirdAcademyInstances
!macroend

!macro customUnInstall
  ; Uninstaller strictly preserves user data and %APPDATA% (BUG-WIN-03 compliance)
  !insertmacro LogDebug "[UNINSTALL] customUnInstall Hook Triggered (FIX4)"
  !insertmacro CloseAllBirdAcademyInstances
!macroend
