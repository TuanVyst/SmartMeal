<#
.SYNOPSIS
    Bumps semantic version git tag and pushes to remote.
.DESCRIPTION
    Usage:
        .\scripts\bump-tag.ps1 [-Part <patch|minor|major>] [-Remote <origin>] [-Force]
#>

[CmdletBinding()]
param(
    [ValidateSet("patch", "minor", "major")]
    [string]$Part = "patch",

    [string]$Remote = "origin",

    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Fetch tags from remote
try {
    git fetch --tags $Remote 2>$null
} catch {
    # Ignore fetch error if offline/no remote access
}

$allTags = git tag -l
$semverTags = $allTags | Where-Object { $_ -match '^v?\d+\.\d+\.\d+$' }

$latestTag = ""
if ($semverTags) {
    # Sort by version object
    $sorted = $semverTags | Sort-Object {
        $clean = $_ -replace '^v', ''
        [version]$clean
    }
    $latestTag = $sorted[-1]
}

if (-not $latestTag) {
    $newTag = "v1.0.0"
    Write-Host "No existing semver tag found. Defaulting to $newTag"
} else {
    $hasV = $latestTag.StartsWith("v")
    $cleanTag = $latestTag.TrimStart("v")
    $v = [version]$cleanTag

    switch ($Part) {
        "major" {
            $major = $v.Major + 1
            $minor = 0
            $patch = 0
        }
        "minor" {
            $major = $v.Major
            $minor = $v.Minor + 1
            $patch = 0
        }
        "patch" {
            $major = $v.Major
            $minor = $v.Minor
            $patch = $v.Build + 1
        }
    }

    $prefix = if ($hasV) { "v" } else { "" }
    $newTag = "${prefix}${major}.${minor}.${patch}"
    Write-Host "Latest tag: $latestTag -> Next tag: $newTag"
}

if (-not $Force) {
    $confirmation = Read-Host "Create and push tag '$newTag' to '$Remote'? (y/N)"
    if ($confirmation -notmatch '^[Yy]$') {
        Write-Host "Aborted."
        exit 0
    }
}

git tag -a "$newTag" -m "Release $newTag"
git push $Remote "$newTag"
Write-Host "Successfully pushed tag $newTag to $Remote."
