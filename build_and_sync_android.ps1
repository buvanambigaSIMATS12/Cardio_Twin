Write-Host "Building React Frontend and Syncing Android Capacitor Project..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\frontend"
npm run build
npx cap sync android
Write-Host "Android Sync Complete!" -ForegroundColor Green
