using Fashion.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Fashion.Api.Data;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<CreditWallet> CreditWallets => Set<CreditWallet>();
    public DbSet<CreditTransaction> CreditTransactions => Set<CreditTransaction>();
    public DbSet<GenerationJob> GenerationJobs => Set<GenerationJob>();
    public DbSet<GalleryItem> GalleryItems => Set<GalleryItem>();
    public DbSet<ToolDefinition> ToolDefinitions => Set<ToolDefinition>();
    public DbSet<ChangelogEntry> ChangelogEntries => Set<ChangelogEntry>();
    public DbSet<PaymentOrder> PaymentOrders => Set<PaymentOrder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.Email).HasMaxLength(180);
            entity.Property(x => x.PasswordHash).HasMaxLength(500);
            entity.Property(x => x.DisplayName).HasMaxLength(120);
            entity.Property(x => x.Role).HasMaxLength(40);
            entity.Property(x => x.GoogleSub).HasMaxLength(128);
            entity.Property(x => x.AppleSub).HasMaxLength(128);
            entity.HasIndex(x => x.GoogleSub).IsUnique();
            entity.HasIndex(x => x.AppleSub).IsUnique();
        });

        modelBuilder.Entity<CreditWallet>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.UserId).IsUnique();
            entity.HasOne(x => x.User)
                .WithOne(x => x.CreditWallet)
                .HasForeignKey<CreditWallet>(x => x.UserId);
        });

        modelBuilder.Entity<CreditTransaction>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.UserId);
            entity.Property(x => x.Description).HasMaxLength(300);
            entity.HasOne(x => x.User)
                .WithMany(x => x.CreditTransactions)
                .HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<GenerationJob>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.UserId);
            entity.HasIndex(x => x.Status);
            entity.HasIndex(x => x.FashnJobId);
            entity.Property(x => x.ToolKey).HasMaxLength(60);
            entity.Property(x => x.Prompt).HasMaxLength(2000);
            entity.Property(x => x.FashnJobId).HasMaxLength(120);
            entity.Property(x => x.ErrorMessage).HasMaxLength(1000);
            entity.Property(x => x.ResultUrls).HasMaxLength(4000);
            entity.HasOne(x => x.User)
                .WithMany(x => x.GenerationJobs)
                .HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<GalleryItem>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.UserId);
            entity.Property(x => x.PreviewUrl).HasMaxLength(1000);
            entity.Property(x => x.ToolKey).HasMaxLength(60);
            entity.HasOne(x => x.User)
                .WithMany(x => x.GalleryItems)
                .HasForeignKey(x => x.UserId);
        });

        modelBuilder.Entity<ToolDefinition>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => new { x.ToolKey, x.Quality }).IsUnique();
            entity.Property(x => x.ToolKey).HasMaxLength(80);
            entity.Property(x => x.Workspace).HasMaxLength(40);
            entity.Property(x => x.Label).HasMaxLength(120);
            entity.Property(x => x.Quality).HasMaxLength(4);
        });

        modelBuilder.Entity<PaymentOrder>(entity =>
        {
            entity.HasKey(x => x.MerchantOid);
            entity.Property(x => x.MerchantOid).HasMaxLength(64);
            entity.Property(x => x.PackageKey).HasMaxLength(40);
            entity.Property(x => x.Status).HasMaxLength(20);
            entity.HasIndex(x => x.UserId);
            entity.HasOne<User>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChangelogEntry>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Title).HasMaxLength(180);
            entity.Property(x => x.Type).HasMaxLength(40);
            entity.Property(x => x.Summary).HasMaxLength(2000);
        });

    }
}
