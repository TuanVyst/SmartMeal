using System;
using Npgsql;

namespace scratch_payos
{
    class Program
    {
        static void Main(string[] args)
        {
            var connectionString = "Host=localhost;Port=5432;Database=SmartMealDb;Username=postgres;Password=12345678;Trust Server Certificate=true";
            using var conn = new NpgsqlConnection(connectionString);
            conn.Open();

            using var cmd = new NpgsqlCommand("SELECT \"Username\", \"Email\", \"Role\" FROM \"Account\"", conn);
            using var reader = cmd.ExecuteReader();
            Console.WriteLine("Accounts in DB:");
            while (reader.Read())
            {
                Console.WriteLine($"Username: {reader.GetString(0)}, Email: {reader.GetString(1)}, Role: {reader.GetInt32(2)}");
            }
        }
    }
}
