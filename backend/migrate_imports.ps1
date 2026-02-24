$baseDir = "c:\Users\sirig\Desktop\project\backend\app"

$replacements = @{
    "from database import"      = "from app.core.database import"
    "import database"           = "import app.core.database"
    "from config import"        = "from app.core.config import"
    "import config"             = "import app.core.config"
    "from models"               = "from app.models"
    "from schemas"              = "from app.schemas"
    "from middleware"           = "from app.middleware"
    "from services"             = "from app.services"
    "from email_service import" = "from app.services.email_service import"
    "from routers"              = "from app.routes"
}

Get-ChildItem -Path $baseDir -Filter "*.py" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $original = $content
    
    foreach ($key in $replacements.Keys) {
        $content = $content -replace [regex]::Escape($key), $replacements[$key]
    }
    
    if ($content -ne $original) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Updated imports in: $($_.FullName)"
    }
}
