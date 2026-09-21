# Flutter Chrome often fails to auto-launch on this Windows setup.
# This starts a local web-server; open the printed URL in Chrome/Edge yourself.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
& "D:\FlutterSDK\flutter\bin\flutter.bat" run -d web-server --web-hostname localhost --web-port 8080
