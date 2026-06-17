using BusinessObject.Dtos.RequestModels;
using BusinessObject.Entities;
using Repository.Interfaces;
using Service.Interfaces;

namespace Service.Implements
{
    public class UserConditionService : IUserConditionService
    {
        private readonly IUserConditionRepo _userConditionRepo;

        public UserConditionService(IUserConditionRepo userConditionRepo)
        {
            _userConditionRepo = userConditionRepo;
        }

        public async Task<List<UserCondition>> GetAllUserConditions()
        {
            return await _userConditionRepo.GetAllUserConditions();
        }

        public async Task<UserCondition> GetUserConditionById(Guid id)
        {
            return await _userConditionRepo.GetUserConditionById(id);
        }

        public async Task<UserCondition> CreateUserCondition(UserConditionRequest request)
        {
            var userCondition = new UserCondition
            {
                UC_id = Guid.NewGuid(),
                Account_id = request.Account_id,
                Condition_id = request.Condition_id,
                DiagnosedAt = request.DiagnosedAt,
                Notes = request.Notes,
                IsDeleted = false
            };

            return await _userConditionRepo.CreateUserCondition(userCondition);
        }

        public async Task<UserCondition> UpdateUserCondition(Guid id, UserConditionRequest request)
        {
            var userCondition = await _userConditionRepo.GetUserConditionById(id);

            if (userCondition == null)
                throw new Exception("UserCondition not found");

            userCondition.Account_id = request.Account_id;
            userCondition.Condition_id = request.Condition_id;
            userCondition.DiagnosedAt = request.DiagnosedAt;
            userCondition.Notes = request.Notes;

            return await _userConditionRepo.UpdateUserCondition(userCondition);
        }

        public async Task<UserCondition> SoftDeleteUserCondition(Guid id)
        {
            return await _userConditionRepo.SoftDeleteUserCondition(id);
        }
    }
}