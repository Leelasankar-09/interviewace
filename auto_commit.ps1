# InterviewAce Auto-Commit Script
# This script automatically syncs your project with Git

$projectPath = "C:\Users\sirig\Desktop\project"
Set-Location -Path $projectPath

# Add all changes
git add .

# Create timestamped commit
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Auto-sync: $timestamp"

# Check if there are changes to commit
$status = git status --porcelain
if ($status) {
    git commit -m $commitMessage
    
    # Push to main (assumes remote 'origin' is set)
    # git push origin main
    # Note: git push is commented out by default until you add your remote URL
    Write-Host "Changes committed at $timestamp"
} else {
    Write-Host "No changes detected at $timestamp"
}
