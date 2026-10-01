using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Service.Interfaces;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IConfiguration config)
        {
            var cloudName = config["Cloudinary:CloudName"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME");
            var apiKey = config["Cloudinary:ApiKey"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY");
            var apiSecret = config["Cloudinary:ApiSecret"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET");

            if (string.IsNullOrEmpty(cloudName) || string.IsNullOrEmpty(apiKey) || string.IsNullOrEmpty(apiSecret))
            {
                throw new Exception("Cloudinary credentials are not fully configured in appsettings.json.");
            }

            var account = new Account(cloudName.Trim(), apiKey.Trim(), apiSecret.Trim());
            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(Stream fileStream, string fileName)
        {
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(fileName, fileStream),
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new Exception($"Cloudinary upload error: {uploadResult.Error.Message}");
            }

            return uploadResult.SecureUrl.ToString();
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            return result.Result == "ok";
        }
    }
}
