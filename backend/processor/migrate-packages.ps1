# Create new directory structure
$sourcePath = "src/main/java/com/xml/processor"
$targetPath = "src/main/java/com/middleware/processor"

# Create target directory if it doesn't exist
New-Item -ItemType Directory -Force -Path $targetPath

# Copy all directories and files
Copy-Item -Path "$sourcePath/*" -Destination $targetPath -Recurse -Force

# Update package declarations in all Java files
Get-ChildItem -Path $targetPath -Recurse -Filter "*.java" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updatedContent = $content -replace "package com\.xml\.processor", "package com.middleware.processor"
    $updatedContent = $updatedContent -replace "import com\.xml\.processor", "import com.middleware.processor"
    Set-Content -Path $_.FullName -Value $updatedContent
}

# Remove old directory structure after successful migration
Remove-Item -Path "src/main/java/com/xml" -Recurse -Force

Write-Host "Package migration completed successfully!" 