Write-Host "Setting up Ollama models for ResComp..." -ForegroundColor Cyan

# Check if Ollama is running
try {
    Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -ErrorAction Stop | Out-Null
    Write-Host "Ollama is running." -ForegroundColor Green
} catch {
    Write-Host "Error: Ollama is not running. Please start Ollama and try again." -ForegroundColor Red
    exit
}

# Pull Granite 4.0 (1M Context Version - High Performance for Research)
Write-Host "Pulling Granite 4.0 (7B-A1B-H)..."
ollama pull granite4:7b-a1b-h

# Pull Embedding model
Write-Host "Pulling Nomic Embed Text..."
ollama pull nomic-embed-text

Write-Host "Ollama setup complete!" -ForegroundColor Green
