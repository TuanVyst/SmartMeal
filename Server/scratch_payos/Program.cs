using System;
using System.Reflection;
using PayOS;

class Program
{
    static void Main()
    {
        var type = typeof(PayOSClient);
        var prop = type.GetProperty("PaymentRequests");
        if (prop != null) {
            foreach(var method in prop.PropertyType.GetMethods())
            {
                if (method.Name == "GetAsync" || method.Name == "GetPaymentLinkInformation" || method.Name == "getPaymentLinkInformation") {
                    Console.WriteLine(method.Name + " returns " + method.ReturnType.Name);
                    var parameters = method.GetParameters();
                    foreach(var p in parameters) {
                        Console.WriteLine("  Parameter: " + p.Name + " Type: " + p.ParameterType.Name);
                    }
                }
            }
        }
    }
}
