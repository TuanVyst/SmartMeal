using BusinessObject.Dtos.RequestModels;
using BusinessObject.Dtos.ResponseModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Service.Implements
{
    public class ReportService : IReportService
    {
        private readonly IReportRepo _reportRepo;
        private readonly ILogger<ReportService> _logger;

        public ReportService(IReportRepo reportRepo, ILogger<ReportService> logger)
        {
            _reportRepo = reportRepo;
            _logger = logger;
        }

        public async Task<List<ReportResponseDto>> GetAllReports()
        {
            var items = await _reportRepo.GetAllReports();
            return items.Select(MapToDto).ToList();
        }

        public async Task<ReportResponseDto?> GetReportById(Guid id)
        {
            var item = await _reportRepo.GetReportById(id);
            return item == null ? null : MapToDto(item);
        }

        public async Task<ReportResponseDto> CreateReport(ReportRequest request)
        {
            try
            {
                var newItem = new Report
                {
                    Report_id = Guid.NewGuid(),
                    Post_id = request.Post_id,
                    Comment_id = request.Comment_id,
                    Account_id = request.Account_id,
                    Content = request.Content,
                    IsDeleted = false
                };

                var result = await _reportRepo.CreateReport(newItem);
                _logger.LogInformation("Report '{Report_id}' created successfully", newItem.Report_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating Report");
                throw;
            }
        }

        public async Task<ReportResponseDto> UpdateReport(Guid id, ReportRequest request)
        {
            try
            {
                var existingItem = await _reportRepo.GetReportById(id);
                if (existingItem == null)
                    throw new KeyNotFoundException($"Report with id {id} not found");

                existingItem.Post_id = request.Post_id;
                existingItem.Comment_id = request.Comment_id;
                existingItem.Account_id = request.Account_id;
                existingItem.Content = request.Content;

                var result = await _reportRepo.UpdateReport(existingItem);
                _logger.LogInformation("Report '{Report_id}' updated successfully", existingItem.Report_id);
                return MapToDto(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating Report '{Report_id}'", id);
                throw;
            }
        }

        public async Task<ReportResponseDto> SoftDeleteReport(Guid id)
        {
            var result = await _reportRepo.SoftDeleteReport(id);
            return MapToDto(result);
        }
        
        private ReportResponseDto MapToDto(Report entity)
        {
            if (entity == null) return null;
            return new ReportResponseDto
            {
                Report_id = entity.Report_id,
                Post_id = entity.Post_id,
                Comment_id = entity.Comment_id,
                Account_id = entity.Account_id,
                Content = entity.Content,
                IsDeleted = entity.IsDeleted
            };
        }
    }
}
