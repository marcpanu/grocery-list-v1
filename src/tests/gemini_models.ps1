$GEMINI_API_KEY = "my-api-key"
$url = "https://generativelanguage.googleapis.com/v1beta/models/?key={0}" -f $GEMINI_API_KEY
Write-Host $url


$response = Invoke-RestMethod -Uri $URL -Method Get -ContentType "application/json"

# Extract only model names
$models = $response.models | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.name
        Description = $_.description
    }
}

$models | Format-Table -AutoSize