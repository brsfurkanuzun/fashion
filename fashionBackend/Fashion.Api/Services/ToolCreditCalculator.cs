using System.Text.Json;
using Fashion.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Fashion.Api.Services;

public static class ToolCreditCalculator
{
    private static readonly HashSet<string> ValidQualities = ["1k", "2k", "4k"];

    public static async Task<(int Cost, string? Error)> ResolveAsync(
        AppDbContext db,
        string toolKey,
        JsonElement inputs,
        CancellationToken cancellationToken = default)
    {
        var quality = ExtractQuality(inputs) ?? "2k";
        if (!ValidQualities.Contains(quality))
        {
            return (0, $"Geçersiz kalite: {quality}");
        }

        var row = await db.ToolDefinitions
            .AsNoTracking()
            .FirstOrDefaultAsync(
                t => t.ToolKey == toolKey && t.Quality == quality && t.IsActive,
                cancellationToken);

        if (row is null)
        {
            return (0, $"Fiyat bulunamadı: {toolKey} / {quality}");
        }

        var multiplier = ExtractMultiplier(toolKey, inputs);
        return (row.CreditCost * multiplier, null);
    }

    private static string? ExtractQuality(JsonElement inputs)
    {
        if (inputs.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (inputs.TryGetProperty("resolution", out var resolution))
        {
            return resolution.GetString()?.ToLowerInvariant();
        }

        return null;
    }

    private static int ExtractMultiplier(string toolKey, JsonElement inputs)
    {
        if (inputs.ValueKind != JsonValueKind.Object)
        {
            return 1;
        }

        if (toolKey == "pro-tryon" && inputs.TryGetProperty("num_images", out var numImages))
        {
            return Math.Clamp(numImages.GetInt32(), 1, 4);
        }

        if (toolKey == "cekim-model" && inputs.TryGetProperty("num_samples", out var numSamples))
        {
            return Math.Clamp(numSamples.GetInt32(), 1, 4);
        }

        return 1;
    }
}
