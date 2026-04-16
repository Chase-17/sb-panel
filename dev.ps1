# Still Breathing - Local Development
# Run both backend and frontend in parallel

Write-Host "🧟 Starting Still Breathing..." -ForegroundColor Green

# Start backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\backend
    if (-not (Test-Path "venv")) {
        python -m venv venv
        .\venv\Scripts\pip install -r requirements.txt
    }
    .\venv\Scripts\activate
    .\venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
}

# Start frontend
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD\frontend
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    npm run dev
}

Write-Host ""
Write-Host "Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow

try {
    while ($true) {
        Receive-Job $backendJob, $frontendJob
        Start-Sleep -Seconds 1
    }
} finally {
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
}
