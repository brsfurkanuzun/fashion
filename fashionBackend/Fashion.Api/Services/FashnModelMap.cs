namespace Fashion.Api.Services;

public static class FashnModelMap
{
    private static readonly Dictionary<string, string> Map = new(StringComparer.OrdinalIgnoreCase)
    {
        ["cekim-model"]     = "tryon-v1.6",
        ["cekim-editorial"] = "background-change",
        ["cekim-pose"]      = "edit",
        ["cekim-video"]     = "image-to-video",
        ["pro-model"]       = "model-create",
        ["pro-tryon"]       = "tryon-max",
        ["pro-edit"]        = "edit",
        ["pro-decoupe"]     = "packshot",
        ["pro-editorial"]   = "background-change",
        ["pro-moodboard"]   = "background-change",
        ["pro-swap"]        = "model-swap",
        ["pro-pose"]        = "edit",
        ["pro-angle"]       = "edit",
        ["pro-video"]       = "image-to-video",
    };

    public static string? Resolve(string toolKey) =>
        Map.TryGetValue(toolKey, out var model) ? model : null;
}
