# Script para corregir encoding de archivos a UTF-8
$files = @(
    "src\components\CameraMap3D.jsx",
    "src\components\Navbar.jsx", 
    "src\components\ProtectedRoute.jsx",
    "src\components\Viewer360.jsx",
    "src\pages\Dashboard.jsx",
    "src\pages\Login.jsx",
    "src\pages\ProjectDetail.jsx",
    "src\pages\ProjectPhotoView.jsx",
    "src\pages\Projects.jsx",
    "src\pages\PublicPhotoView.jsx",
    "src\pages\Register.jsx",
    "src\App.jsx",
    "src\PublicPhotoView.jsx",
    "src\config\axios.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Corrigiendo encoding de: $file"
        $content = Get-Content $file -Encoding UTF8
        $content = $content -replace 'Å°', '°'  # Corregir grados
        $content = $content -replace 'Ã³', 'ó'  # Corregir acentos
        $content = $content -replace 'Ã', 'í'   # Corregir otros acentos
        $content = $content -replace '8V™', '📍' # Corregir emoji ubicación
        $content | Out-File $file -Encoding UTF8
    }
}

Write-Host "¡Corrección de encoding completada!"