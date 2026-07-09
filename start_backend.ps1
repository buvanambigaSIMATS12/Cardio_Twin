Write-Host "Starting CardioTwin FastAPI Backend Server..." -ForegroundColor Cyan
Set-Location "$PSScriptRoot\backend"
& .\venv\Scripts\Activate.ps1
python -m uvicorn main:app --host 0.0.0.0 --port 8000
