Write-Host "Starting ResComp Research System..." -ForegroundColor Cyan

# Check for virtual environment
if (Test-Path "backend/.venv") {
    Write-Host "Activating virtual environment..." -ForegroundColor Green
    $PythonPath = "backend/.venv/Scripts/python.exe"
} else {
    Write-Host "Warning: Virtual environment not found. Using system Python." -ForegroundColor Yellow
    $PythonPath = "python"
}

# Start Backend in a new window
Write-Host "Launching FastAPI Backend (Docling)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$PythonPath backend/main.py"

# Start Frontend in current window
Write-Host "Launching Next.js Frontend..." -ForegroundColor Yellow
cd frontend
npm run dev
