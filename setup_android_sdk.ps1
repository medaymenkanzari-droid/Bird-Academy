$sdkPath = "C:\Android\Sdk"
$zipPath = "$env:TEMP\cmdline-tools.zip"
$extractPath = "$env:TEMP\cmdline-extract"

Write-Host "Creating target directory: $sdkPath\cmdline-tools\latest"
New-Item -ItemType Directory -Force -Path "$sdkPath\cmdline-tools\latest" | Out-Null

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Write-Host "Downloading Android SDK Command-Line Tools..."
Invoke-WebRequest -Uri "https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip" -OutFile $zipPath

Write-Host "Extracting Command-Line Tools archive..."
if (Test-Path $extractPath) { Remove-Item -Path $extractPath -Recurse -Force }
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

Write-Host "Installing binaries to $sdkPath\cmdline-tools\latest..."
Copy-Item -Path "$extractPath\cmdline-tools\*" -Destination "$sdkPath\cmdline-tools\latest" -Recurse -Force

Write-Host "Accepting Android SDK licenses..."
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.8-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$sdkPath\cmdline-tools\latest\bin;$env:PATH"

"y`ny`ny`ny`ny`ny`ny" | & "$sdkPath\cmdline-tools\latest\bin\sdkmanager.bat" --licenses --sdk_root=$sdkPath

Write-Host "Installing Android SDK Platform 34 & Build-Tools 34.0.0..."
& "$sdkPath\cmdline-tools\latest\bin\sdkmanager.bat" "platforms;android-34" "build-tools;34.0.0" "platform-tools" --sdk_root=$sdkPath

Write-Host "Android SDK installation completed successfully!"
