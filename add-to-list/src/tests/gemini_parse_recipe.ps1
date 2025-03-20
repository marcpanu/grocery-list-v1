$GEMINI_API_KEY = "my-api-key"
$MODEL_NAME = "gemini-1.5-flash-8b"
$RECIPE_URL = "https://www.joshuaweissman.com/post/sourdough-bread"

# Fetch the webpage HTML
Write-Host "Fetching HTML content from the source..."
try {
    $webpage = Invoke-WebRequest -Uri $RECIPE_URL -UseBasicParsing
    $html_data = $webpage.Content
} catch {
    Write-Host "Error: Unable to retrieve webpage content. $_"
    exit 1
}

# Extract meaningful text from HTML
Write-Host "Extracting main text from HTML..."

# Step 1: Remove <script> and <style> tags completely
$html_cleaned = $html_data -replace "<script.*?>.*?</script>", "" `
                          -replace "<style.*?>.*?</style>", ""

# Step 2: Remove all remaining HTML tags (leaving only raw text)
$main_text = $html_cleaned -replace "<[^>]+>", " "

# Step 3: Trim extra spaces and line breaks
$main_text = $main_text -replace "\s+", " "

# Step 4: Remove non-ASCII characters   
$main_text = $main_text -replace "[^\x20-\x7E]", "" -replace "&nbsp;", " "

# Step 5: Normalize whitespace and line breaks
$main_text = $main_text -replace "\s+", " " -replace "`n{2,}", "`n"

Write-Host "Extracted Text (First 1000 characters for preview):"
Write-Host ($main_text.Substring(0, [Math]::Min(1000, $main_text.Length)))  # Preview first 500 characters

# Construct API request
$api_endpoint = "https://generativelanguage.googleapis.com/v1beta/models/{0}:generateContent?key={1}" -f $MODEL_NAME, $GEMINI_API_KEY
Write-Host "API Endpoint: $api_endpoint"

$gemini_prompt = @"
Extract a cooking recipe from the following extracted text. Format the response as a structured JSON object with these properties:
- title: Name of the recipe (string)
- summary: Brief description of the recipe (string, optional)
- prep_duration: Preparation time (string, optional)
- cook_duration: Cooking time (string, optional)
- total_duration: Total time needed (string, optional)
- portions: Number of servings (integer, optional)
- ingredient_list: Array containing:
  - amount: number or string (optional)
  - measurement_unit: string (optional)
  - ingredient_name: string
  - additional_notes: string (optional)
- step_by_step: Array of strings, where each element is a cooking instruction
- picture_url: URL of the main dish image (string, optional)
- creator: Name of the recipe's author (string, optional)

Extracted Recipe Text:
$main_text

Only return the JSON object and no additional text. If insufficient data is available to extract a meaningful recipe (at minimum: title, ingredient_list, and step_by_step), respond with:
{ "error_message": "Not enough recipe details found for extraction." }
"@

# Prepare the JSON payload
$request_payload = @{
    contents = @(@{
        role = "user"
        parts = @(@{ text = $gemini_prompt })
    })
} | ConvertTo-Json -Depth 10 -Compress

# Debug output for the request payload
# Write-Host "Request Payload:"
# Write-Host $request_payload

# Send request to Gemini API
Write-Host "Sending request to Gemini AI..."
try {
    $gemini_response = Invoke-RestMethod -Uri $api_endpoint -Method Post -Body $request_payload -ContentType "application/json"
} catch {
    Write-Host "Error: Gemini API request failed. $_"
    Write-Host "Raw Response:"
    Write-Host $_.Exception.Response
    exit 1
}

# Extract the generated response
$extracted_text = $gemini_response.candidates[0].content.parts[0].text

# Try parsing the response as JSON
try {
    $parsed_recipe = $extracted_text | ConvertFrom-Json
    if ($parsed_recipe.error_message) {
        Write-Host "Gemini API Response Error: $($parsed_recipe.error_message)"
    } else {
        Write-Host "Extracted Recipe Details:"
        $parsed_recipe | ConvertTo-Json -Depth 10
    }
} catch {
    Write-Host "Error: Failed to parse Gemini's response as JSON. Raw output:"
    Write-Host $extracted_text
}