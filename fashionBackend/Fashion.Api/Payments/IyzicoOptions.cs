namespace Fashion.Api.Payments;

public sealed class IyzicoOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    /// <summary>Sandbox: https://sandbox-api.iyzipay.com — Production: https://api.iyzipay.com</summary>
    public string BaseUrl { get; set; } = "https://sandbox-api.iyzipay.com";
    /// <summary>Ödeme sonrası yönlendirme (frontend). Örn. https://design.nulatechnology.com</summary>
    public string FrontendBaseUrl { get; set; } = "http://localhost:5173";
    /// <summary>iyzico callback için backend kök URL. Örn. https://api.example.com</summary>
    public string CallbackBaseUrl { get; set; } = string.Empty;
    public int[] EnabledInstallments { get; set; } = [1];
}
