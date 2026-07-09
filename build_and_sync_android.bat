@echo off
echo Building React Frontend and Syncing Android Capacitor Project...
cd /d "%~dp0frontend"
call npm run build
call npx cap sync android
echo Android Sync Complete! You can now run the app in Android Studio.
pause
