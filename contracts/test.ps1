$ErrorActionPreference = 'Stop'
$schema = Join-Path $PSScriptRoot 'response.schema.json'
$cases = @(
    @('{"version":1,"sessionId":"s","questionId":"q","responses":[{"cardId":1,"answer":"D"}]}', $true),
    @('{"version":1,"sessionId":"s","questionId":"q","responses":[]}', $true),
    @('{"version":1,"sessionId":"s","questionId":"q","responses":[{"cardId":101,"answer":"A"}]}', $false),
    @('{"version":1,"sessionId":"s","questionId":"q","responses":[{"cardId":1,"answer":"E"}]}', $false),
    @('{"version":2,"sessionId":"s","questionId":"q","responses":[]}', $false),
    @('{"version":1,"sessionId":"s","responses":[]}', $false),
    @('{"version":1,"sessionId":"s","questionId":"q","responses":[],"name":"demo"}', $false)
)
foreach ($case in $cases) {
    $valid = Test-Json -Json $case[0] -SchemaFile $schema -ErrorAction SilentlyContinue
    if ($valid -ne $case[1]) { throw "Beklenmeyen sonuc: $($case[0])" }
}
Write-Output "$($cases.Count) schema cases passed"
