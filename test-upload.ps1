$token = Get-Content "token.txt"
$filePath = "test-file.txt"

# Create multipart form data
Add-Type -AssemblyName System.Net.Http

$httpClient = New-Object System.Net.Http.HttpClient
$httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer $token")

$content = New-Object System.Net.Http.MultipartFormDataContent

# Add file
$fileStream = [System.IO.File]::OpenRead($filePath)
$fileContent = New-Object System.Net.Http.StreamContent($fileStream)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("text/plain")
$content.Add($fileContent, "file", "test-file.txt")

# Send request
$response = $httpClient.PostAsync("http://localhost:3333/files", $content).Result
$responseContent = $response.Content.ReadAsStringAsync().Result

Write-Host "Status: $($response.StatusCode)"
Write-Host "Response: $responseContent"

# Cleanup
$fileStream.Close()
$httpClient.Dispose()
