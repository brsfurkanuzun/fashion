using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace Fashion.Api.Services;

public sealed class FashnService(HttpClient http, IConfiguration config)
{
    private static readonly JsonSerializerOptions JsonOpts =
        new() { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

    private string ApiKey => config["Fashn:ApiKey"] ?? throw new InvalidOperationException("Fashn:ApiKey is not configured.");

    public async Task<FashnRunResult> RunAsync(string modelName, JsonElement inputs, string? webhookUrl = null)
    {
        var body = new JsonObject
        {
            ["model_name"] = modelName,
            ["inputs"] = JsonNode.Parse(inputs.GetRawText())
        };

        var request = new HttpRequestMessage(HttpMethod.Post, BuildRunUrl(webhookUrl))
        {
            Content = new StringContent(body.ToJsonString(), Encoding.UTF8, "application/json")
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", ApiKey);

        var response = await http.SendAsync(request);
        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return new FashnRunResult { Error = $"HTTP {(int)response.StatusCode}: {json}" };
        }

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        if (root.TryGetProperty("error", out var errEl) && errEl.ValueKind != JsonValueKind.Null)
        {
            return new FashnRunResult { Error = errEl.GetString() };
        }

        return new FashnRunResult { Id = root.GetProperty("id").GetString() };
    }

    public async Task<FashnStatusResult> GetStatusAsync(string fashnJobId)
    {
        var request = new HttpRequestMessage(HttpMethod.Get, $"/v1/status/{fashnJobId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", ApiKey);

        var response = await http.SendAsync(request);
        var json = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return new FashnStatusResult { Status = "failed", ErrorMessage = $"HTTP {(int)response.StatusCode}: {json}" };
        }

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;

        var status = root.TryGetProperty("status", out var s) ? s.GetString() ?? "unknown" : "unknown";

        List<string>? outputs = null;
        if (root.TryGetProperty("output", out var outEl) && outEl.ValueKind == JsonValueKind.Array)
        {
            outputs = outEl.EnumerateArray()
                .Where(e => e.ValueKind == JsonValueKind.String)
                .Select(e => e.GetString()!)
                .ToList();
        }

        string? errorMessage = null;
        if (root.TryGetProperty("error", out var errEl) && errEl.ValueKind == JsonValueKind.Object)
        {
            errEl.TryGetProperty("message", out var msgEl);
            errorMessage = msgEl.ValueKind == JsonValueKind.String ? msgEl.GetString() : errEl.GetRawText();
        }

        return new FashnStatusResult
        {
            Status = status,
            Outputs = outputs,
            ErrorMessage = errorMessage
        };
    }

    private static string BuildRunUrl(string? webhookUrl)
    {
        var url = "/v1/run";
        if (!string.IsNullOrWhiteSpace(webhookUrl))
            url += $"?webhook_url={Uri.EscapeDataString(webhookUrl)}";
        return url;
    }
}

public sealed class FashnRunResult
{
    public string? Id { get; init; }
    public string? Error { get; init; }
    public bool IsSuccess => Error is null && Id is not null;
}

public sealed class FashnStatusResult
{
    public string Status { get; init; } = "unknown";
    public List<string>? Outputs { get; init; }
    public string? ErrorMessage { get; init; }

    public bool IsCompleted => Status == "completed";
    public bool IsFailed => Status is "failed" or "canceled" or "time_out";
    public bool IsInProgress => Status is "starting" or "in_queue" or "processing";
}
