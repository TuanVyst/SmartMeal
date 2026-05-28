using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            // Load .env file
            try
            {
                var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", ".env");
                DotNetEnv.Env.Load(envPath);
            }
            catch
            {
                // .env file not found - use system environment variables
            }

            var dbHost = Environment.GetEnvironmentVariable("DB_HOST");
            var dbPort = Environment.GetEnvironmentVariable("DB_PORT");
            var dbName = Environment.GetEnvironmentVariable("DB_NAME");
            var dbUser = Environment.GetEnvironmentVariable("DB_USER");
            var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

            var connectionString = $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword};Trust Server Certificate=true";

            if (string.IsNullOrWhiteSpace(connectionString))
            {
                throw new InvalidOperationException(
                    "Connection string not found in environment variables or .env file.");
            }

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            optionsBuilder.UseNpgsql(connectionString);
            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
