namespace Fashion.Api.Auth;

public sealed class AuthOptions
{
    public GoogleAuthOptions Google { get; set; } = new();
    public AppleAuthOptions Apple { get; set; } = new();
    public FirebaseAuthOptions Firebase { get; set; } = new();
}

public sealed class GoogleAuthOptions
{
    /// <summary>Web istemci kimliği (GIS audience).</summary>
    public string ClientId { get; set; } = string.Empty;
}

public sealed class AppleAuthOptions
{
    /// <summary>Sign in with Apple Services ID (JWT aud).</summary>
    public string ServicesId { get; set; } = string.Empty;
}

public sealed class FirebaseAuthOptions
{
    /// <summary>Firebase project id (ID token aud).</summary>
    public string ProjectId { get; set; } = string.Empty;
}
