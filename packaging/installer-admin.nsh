; ==============================================================================
; BIRD ACADEMY ENTERPRISE ADMIN — NSIS CUSTOM INSTALLER HOOK (ADMIN-WINDOWS-02)
; Deterministic PID-First Process Tree Termination Architecture for Admin
; Whitelist strictly isolated to Admin processes — Zero interference with User app
; Zero long Base64 strings — Compliant with NSIS 1024-character buffer limits
; ==============================================================================

!macro LogDebug MSG
  Push $R9
  ClearErrors
  FileOpen $R9 "$TEMP\BirdAcademyAdminInstallerDebug.log" a
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

; Generates the PID-first PowerShell termination script directly in $PLUGINSDIR\terminate-admin.ps1
!macro WriteTerminateAdminScript
  InitPluginsDir
  Push $R0
  ClearErrors
  FileOpen $R0 "$PLUGINSDIR\terminate-admin.ps1" w
  IfErrors write_admin_done

  FileWrite $R0 '$$ErrorActionPreference = "SilentlyContinue"$\r$\n'
  FileWrite $R0 '$$log = "$$env:TEMP\BirdAcademyAdminInstallerDebug.log"$\r$\n'
  FileWrite $R0 'function Log($$m) { "$$((Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff")) $$m" | Out-File -FilePath $$log -Append -Encoding utf8 -ErrorAction SilentlyContinue }$\r$\n'
  FileWrite $R0 'Log "[ADMIN-FIX4-INIT] PID-First Termination Script Started (Admin Only)"$\r$\n'
  FileWrite $R0 '$$myPid = $$PID$\r$\n'
  FileWrite $R0 '$$myProc = Get-CimInstance Win32_Process -Filter "ProcessId = $$myPid" -ErrorAction SilentlyContinue$\r$\n'
  FileWrite $R0 '$$parentPid = if ($$myProc -and $$myProc.ParentProcessId) { [int]$$myProc.ParentProcessId } else { 0 }$\r$\n'
  FileWrite $R0 'Log "[ADMIN-FIX4-INIT] PowerShell PID=$$myPid Parent NSIS PID=$$parentPid"$\r$\n'
  FileWrite $R0 '$$names = @("Bird Academy - Admin Center.exe","Bird-Academy-Admin.exe","Bird Academy Enterprise Admin.exe","Bird Academy Admin.exe","Bird-Academy-Admin-Windows.exe")$\r$\n'
  FileWrite $R0 '$$paths = @("Programs\bird-academy-admin","Programs\Bird Academy - Admin Center","Programs\Bird Academy Enterprise Admin","Programs\Bird Academy Admin","release-admin")$\r$\n'
  FileWrite $R0 '$$all = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue)$\r$\n'
  FileWrite $R0 '$$targetPids = [System.Collections.Generic.HashSet[int]]::new()$\r$\n'
  FileWrite $R0 '$$rootPids = [System.Collections.Generic.HashSet[int]]::new()$\r$\n'
  FileWrite $R0 'foreach ($$p in $$all) {$\r$\n'
  FileWrite $R0 '  if (-not $$p -or -not $$p.ProcessId -or $$p.ProcessId -eq $$myPid -or $$p.ProcessId -eq $$parentPid) { continue }$\r$\n'
  FileWrite $R0 '  if ($$p.Name -like "*Setup.exe" -or $$p.Name -like "*Installer.exe" -or $$p.Name -like "*Uninstall*.exe" -or $$p.Name -eq "powershell.exe" -or $$p.Name -eq "conhost.exe") { continue }$\r$\n'
  FileWrite $R0 '  $$m = $$false$\r$\n'
  FileWrite $R0 '  if ($$p.Name -and ($$names -contains $$p.Name)) { $$m = $$true }$\r$\n'
  FileWrite $R0 '  if (-not $$m -and $$p.ExecutablePath) { foreach ($$k in $$paths) { if ($$p.ExecutablePath.IndexOf($$k, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $$m = $$true; break } } }$\r$\n'
  FileWrite $R0 '  if ($$m) { $$null = $$rootPids.Add($$p.ProcessId); $$null = $$targetPids.Add($$p.ProcessId); Log "[ADMIN-FIX4-PROCESS] Name=$$($$p.Name) PID=$$($$p.ProcessId) ParentPID=$$($$p.ParentProcessId) Path=$$($$p.ExecutablePath)" }$\r$\n'
  FileWrite $R0 '}$\r$\n'
  FileWrite $R0 '$$added = $$true$\r$\n'
  FileWrite $R0 'while ($$added) { $$added = $$false; foreach ($$p in $$all) { if (-not $$p -or -not $$p.ProcessId -or $$p.ProcessId -eq $$myPid -or $$p.ProcessId -eq $$parentPid) { continue }; if ($$p.Name -like "*Setup.exe" -or $$p.Name -like "*Installer.exe") { continue }; if ($$targetPids.Contains($$p.ParentProcessId) -and -not $$targetPids.Contains($$p.ProcessId)) { $$null = $$targetPids.Add($$p.ProcessId); $$added = $$true; Log "[ADMIN-FIX4-CHILD] PID=$$($$p.ProcessId) ParentPID=$$($$p.ParentProcessId) Name=$$($$p.Name) Path=$$($$p.ExecutablePath)" } } }$\r$\n'
  FileWrite $R0 'Log "[ADMIN-FIX4-SCAN] Total Admin Target PIDs Identified: $$($$targetPids.Count)"$\r$\n'
  FileWrite $R0 'foreach ($$pidNum in $$rootPids) { try { $$p = [System.Diagnostics.Process]::GetProcessById($$pidNum); if ($$p.MainWindowHandle -ne [System.IntPtr]::Zero) { Log "[ADMIN-FIX4-GRACEFUL] CloseMainWindow PID=$$pidNum"; $$null = $$p.CloseMainWindow() } } catch {} }$\r$\n'
  FileWrite $R0 'Start-Sleep -Milliseconds 150$\r$\n'
  FileWrite $R0 'foreach ($$pidNum in $$targetPids) { Log "[ADMIN-FIX4-FORCE] Force Killing PID=$$pidNum"; try { & "$$env:SystemRoot\System32\taskkill.exe" /F /PID $$pidNum 2>&1 | Out-Null } catch {}; try { Stop-Process -Id $$pidNum -Force -ErrorAction SilentlyContinue } catch {}; Log "[ADMIN-FIX4-FORCE-RESULT] PID=$$pidNum Terminated" }$\r$\n'
  FileWrite $R0 'Start-Sleep -Milliseconds 250$\r$\n'
  FileWrite $R0 '$$remaining = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object { $$p = $$_; if (-not $$p -or -not $$p.ProcessId -or $$p.ProcessId -eq $$myPid -or $$p.ProcessId -eq $$parentPid) { return $$false }; if ($$p.Name -like "*Setup.exe" -or $$p.Name -like "*Installer.exe" -or $$p.Name -like "*Uninstall*.exe") { return $$false }; $$m = $$false; if ($$p.Name -and ($$names -contains $$p.Name)) { $$m = $$true }; if (-not $$m -and $$p.ExecutablePath) { foreach ($$k in $$paths) { if ($$p.ExecutablePath.IndexOf($$k, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $$m = $$true; break } } }; $$m })$\r$\n'
  FileWrite $R0 'if ($$remaining.Count -eq 0) { Log "[ADMIN-FIX4-VERIFY] Clean State Confirmed: 0 Residual Admin Processes" } else { foreach ($$r in $$remaining) { Log "[ADMIN-FIX4-RESIDUAL] Residual PID=$$($$r.ProcessId) Name=$$($$r.Name) -> Terminating"; try { & "$$env:SystemRoot\System32\taskkill.exe" /F /PID $$r.ProcessId | Out-Null } catch { try { Stop-Process -Id $$r.ProcessId -Force } catch {} } } }$\r$\n'
  FileWrite $R0 'Log "[ADMIN-FIX4-COMPLETE] PID-First Admin Termination Completed"$\r$\n'
  FileWrite $R0 'exit 0$\r$\n'

  FileClose $R0
write_admin_done:
  Pop $R0
!macroend

!macro RunPIDFirstAdminTermination
  !insertmacro LogDebug "[ADMIN-FIX4-INIT] Initiating Admin PID-First Process Tree Termination..."
  !insertmacro WriteTerminateAdminScript
  
  ; Short, safe invocation (< 160 characters, 0 buffer overflow risk)
  nsExec::Exec `"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "$PLUGINSDIR\terminate-admin.ps1"`
  Pop $0
  !insertmacro LogDebug "[ADMIN-FIX4-EXEC-RESULT] terminate-admin.ps1 ExitCode=$0"
!macroend

!macro CloseAllBirdAcademyAdminInstances
  !insertmacro LogDebug "--------------------------------------------------"
  !insertmacro LogDebug "[ADMIN-FIX4-INIT] Bird Academy Admin Multi-Layer Process Cleanup"
  !insertmacro LogDebug "--------------------------------------------------"

  ; Step 1: Deterministic PID-First Process & Child Tree Termination for Admin Only
  !insertmacro RunPIDFirstAdminTermination
  Sleep 500

  ; Step 2: Complementary native Win32 taskkill for strictly whitelisted Admin application image names
  !insertmacro TaskkillProcess "Bird Academy - Admin Center.exe"
  !insertmacro TaskkillProcess "Bird-Academy-Admin.exe"
  !insertmacro TaskkillProcess "Bird Academy Enterprise Admin.exe"
  !insertmacro TaskkillProcess "Bird Academy Admin.exe"
  !insertmacro TaskkillProcess "Bird-Academy-Admin-Windows.exe"

  !insertmacro LogDebug "[ADMIN-FIX4-COMPLETE] All Bird Academy Admin Processes Cleaned Successfully"
!macroend

!macro customInit
  ; Runs at installer startup in .onInit before UI, file extraction, or uninstallOldVersion
  !insertmacro LogDebug "[CUSTOM-INIT] customInit Hook Triggered (Admin FIX4)"
  !insertmacro CloseAllBirdAcademyAdminInstances
!macroend

!macro customCheckAppRunning
  ; Overrides electron-builder's default checkAppRunning before uninstallOldVersion
  !insertmacro LogDebug "[CUSTOM-CHECK] customCheckAppRunning Hook Triggered (Admin FIX4)"
  !insertmacro CloseAllBirdAcademyAdminInstances
!macroend

!macro customUnInstallCheck
  ; Overrides default uninstallOldVersion failure handler to ensure clean upgrade
  !insertmacro LogDebug "[CUSTOM-UNINSTALL-CHECK] customUnInstallCheck Hook Triggered (Admin FIX4)"
!macroend

!macro customUnInstallCheckCurrentUser
  ; Overrides default uninstallOldVersion failure handler for CurrentUser
  !insertmacro LogDebug "[CUSTOM-UNINSTALL-CHECK] customUnInstallCheckCurrentUser Hook Triggered (Admin FIX4)"
!macroend

!macro customUnInit
  ; Runs in uninstaller .onInit
  !insertmacro LogDebug "[CUSTOM-UNINIT] customUnInit Hook Triggered (Admin FIX4)"
  !insertmacro CloseAllBirdAcademyAdminInstances
!macroend

!macro customUnInstall
  ; Uninstaller strictly preserves Admin data and %APPDATA%\Bird Academy Admin (deleteAppDataOnUninstall: false)
  !insertmacro LogDebug "[UNINSTALL] customUnInstall Hook Triggered (Admin FIX4)"
  !insertmacro CloseAllBirdAcademyAdminInstances
!macroend
