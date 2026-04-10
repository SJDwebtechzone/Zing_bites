# setup_images.ps1
# This script moves the generated AI images to your project folder.

$srcDir = "C:\Users\KRISHNAKUMAR P\.gemini\antigravity\brain\bf7213d2-4e9c-4967-b599-c341fd32cd12"
$destDir = "c:\Users\KRISHNAKUMAR P\Downloads\zing-bites\zing-bites\frontend\public\images\products"

# Ensure destination exists
if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir
}

$imageMap = @{
    "bombay_toastie_realistic_1775228797785.png" = "bombay_toastie.png"
    "peri_peri_chicken_sandwich_realistic_1775228887829.png" = "peri_peri_chicken_sandwich.png"
    "spicy_fish_fillet_burger_realistic_1775228916851.png" = "fish_fillet_burger.png"
    "masala_popcorn_realistic_1775228942719.png" = "masala_popcorn.png"
    "cheese_balls_realistic_1775228967215.png" = "cheese_balls.png"
    "peri_peri_fries_realistic_1775228992686.png" = "peri_peri_fries.png"
    "sweet_potato_wedges_realistic_1775229018654.png" = "sweet_potato_wedges.png"
    "veg_spring_rolls_realistic_1775229043418.png" = "veg_spring_rolls.png"
    "chilli_cheese_toasts_realistic_1775229069194.png" = "chilli_cheese_toasts.png"
    "masala_omelette_realistic_1775229095828.png" = "masala_omelette.png"
    "chole_bhature_realistic_1775229122451.png" = "chole_bhature.png"
    "dahi_puri_realistic_1775229148502.png" = "dahi_puri.png"
    "kathi_roll_veg_realistic_1775229174909.png" = "kathi_roll_veg.png"
    "chicken_kathi_roll_realistic_1775229201738.png" = "chicken_kathi_roll.png"
    "raj_kachori_realistic_1775229227109.png" = "raj_kachori.png"
    "pav_bhaji_realistic_1775229253344.png" = "pav_bhaji.png"
    "misal_pav_realistic_1775229280984.png" = "misal_pav.png"
}

Write-Host "🚀 Moving images to $destDir ..." -ForegroundColor Cyan

foreach ($srcFile in $imageMap.Keys) {
    $destFile = $imageMap[$srcFile]
    $fullSrcPath = Join-Path $srcDir $srcFile
    $fullDestPath = Join-Path $destDir $destFile
    
    if (Test-Path $fullSrcPath) {
        Copy-Item -Path $fullSrcPath -Destination $fullDestPath -Force
        Write-Host "✅ Copied $srcFile -> $destFile" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Warning: Could not find $srcFile" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Done! Refresh your application to see the new images." -ForegroundColor Magenta
