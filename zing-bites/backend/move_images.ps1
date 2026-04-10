# PowerShell Script to move generated images to the public folder
$targetDir = "..\frontend\public\images\products"
if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force
}

$images = @(
    @{ src = "masala_pav_realistic_1775150045575.png"; dst = "masala_pav.png" },
    @{ src = "pani_puri_realistic_v2_1775150063462.png"; dst = "pani_puri.png" },
    @{ src = "bhel_puri_realistic_v2_1775150083151.png"; dst = "bhel_puri.png" },
    @{ src = "corn_chaat_realistic_v2_1775149954702_1775150101292.png"; dst = "corn_chaat.png" },
    @{ src = "samosa_realistic_v2_1775149954702_1775149954702_1775150124287.png"; dst = "samosa.png" },
    @{ src = "zing_special_burger_v2_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150207871.png"; dst = "zing_special_burger.png" },
    @{ src = "aloo_tikki_burger_v2_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150225923.png"; dst = "aloo_tikki_burger.png" },
    @{ src = "chicken_crispy_burger_v2_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150246752.png"; dst = "chicken_crispy_burger.png" },
    @{ src = "grilled_veg_sandwich_v2_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150268300.png"; dst = "grilled_veg_sandwich.png" },
    @{ src = "club_sandwich_v2_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150124287_1775150286071.png"; dst = "club_sandwich.png" },
    @{ src = "loaded_fries_realistic_v2_1775150286071_1775150286071_1775150286071_1775150286071_1775150286071_1775150358010.png"; dst = "loaded_fries.png" },
    @{ src = "onion_rings_realistic_v2_1775150286071_1775150286071_1775150286071_1775150286071_1775150286071_1775150286071_1775150375819.png"; dst = "onion_rings.png" },
    @{ src = "chicken_nuggets_realistic_v2_1775150286071_1775150286071_1775150286071_1775150286071_1775150286071_1775150286071_1775150286071_1775150394609.png"; dst = "chicken_nuggets.png" }
)

$brainDir = "C:\Users\KRISHNAKUMAR P\.gemini\antigravity\brain\c332a7c0-78c5-4a8a-848d-2e77fdab6bfe"

foreach ($img in $images) {
    $src = Join-Path $brainDir $img.src
    $dst = Join-Path $targetDir $img.dst
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Force
        Write-Host "✅ Copied: $($img.dst)" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $($img.src)" -ForegroundColor Red
    }
}
Write-Host "--- Move Complete ---" -ForegroundColor Cyan
