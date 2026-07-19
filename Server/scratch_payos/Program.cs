using System;
using System.Reflection;
using PayOS.Models.V2.PaymentRequests;

class Program
{
    static void Main()
    {
        var enumType = typeof(PaymentLinkStatus);
        foreach(var name in Enum.GetNames(enumType))
        {
            Console.WriteLine("Value: " + name);
        }
    }
}
