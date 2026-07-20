# SmartMeal 2.0 - Agent Development Rules

Version: 1.0
Status: Mandatory
Priority: Critical

---

# Mission

You are NOT building a new application.

You are upgrading the existing SmartMeal project to SmartMeal 2.0.

The current project is already functional.

Your primary responsibility is to improve the product while preserving the stability of the existing system.

Always prefer extending the existing architecture instead of rewriting it.

---

# Product Vision

SmartMeal is NOT a calorie calculator.

SmartMeal is a Safe Nutrition Planner.

The purpose of SmartMeal is to reduce users' decision fatigue by automatically generating safe, practical and personalized meal plans.

Every implementation must support this vision.

If a proposed implementation does not contribute to this vision, it should not be implemented.

---

# Current Project Status

The existing project is considered stable.

The following modules are production-ready unless explicitly instructed otherwise.

- Authentication
- User Management
- Recipe Database
- Nutrition Calculation
- Meal Log
- Food Detail
- Existing Database Structure

Assume these modules are correct.

Do NOT rewrite them unless a specific issue requires modification.

---

# Highest Priorities

When making technical decisions always follow this priority order.

Priority 1
User Safety

Priority 2
Data Integrity

Priority 3
Backward Compatibility

Priority 4
Business Logic

Priority 5
User Experience

Priority 6
Performance

Priority 7
UI Enhancement

Priority 8
Code Refactoring

Priority 9
New Features

Never violate a higher priority in order to satisfy a lower priority.

---

# Non-Negotiable Rules

The following rules are mandatory.

DO NOT

- Rewrite the project architecture.
- Rename existing APIs without approval.
- Change existing database tables unless required.
- Remove existing features.
- Replace stable modules.
- Introduce breaking changes.
- Add unnecessary dependencies.
- Create duplicate business logic.

Always extend existing functionality whenever possible.

---

# Product Philosophy

The application should guide users.

Users should never feel they must study nutrition before using SmartMeal.

The application should make decisions whenever safe.

The application should explain recommendations in simple language.

The application should minimize manual work.

---

# Survey Philosophy

Survey is the foundation of the application.

Survey must collect enough information to generate a complete nutrition plan.

Survey should never ask unnecessary questions.

Survey should never require users to perform calculations.

Survey should use adaptive questions whenever possible.

The survey experience should take less than five minutes.

---

# Recommendation Engine

Recommendation is rule-based.

No AI is required.

The recommendation engine must generate

- Daily calorie target
- Protein target
- Fat target
- Carbohydrate target
- Fiber target
- Water target
- Meal Plan Template

Recommendations must always be explainable.

Every recommendation should have a clear reason.

---

# Nutrition Safety Framework

Safety has higher priority than user preferences.

If a user's goal is unsafe,

the system must adjust the recommendation instead of following the request.

Examples

Unsafe

80kg

↓

75kg

within one week

Safe behaviour

Explain why this goal is unsafe.

Automatically generate a healthier timeline.

---

The system must never generate

- dangerously low calorie plans
- extreme calorie deficits
- extreme calorie surplus
- nutritionally unbalanced meal plans

Meal quality is more important than calories alone.

Meal Score should consider

- Calories
- Protein
- Fat
- Carbohydrates
- Fiber
- Sugar
- Sodium
- Overall balance

---

# Meal Planning Philosophy

The goal of SmartMeal is planning, not tracking.

The application should prepare a meal plan before the user starts the day.

Users should not need to manually choose meals every day.

Meal Plans may support

- 3-day cycle
- 7-day cycle (recommended)
- 14-day cycle

A shorter cycle allows users to experience the product quickly.

Changing the plan cycle does NOT change the expected healthy weight-loss timeline.

Meal Plans must only regenerate at the end of the current cycle unless the user explicitly requests a new plan.

---

# Weight Tracking

Weight tracking should encourage healthy habits.

The application should politely ask users to update their weight.

Users must always be allowed to skip.

Skipping weight updates must never produce warnings or penalties.

When weight is updated

Automatically update

- BMI
- Progress
- Health Report

Do NOT regenerate the meal plan immediately.

Meal plan updates occur only at the end of the selected plan cycle.

Daily weight fluctuations should never be treated as success or failure.

The application should focus on long-term trends.

---

# Dashboard Philosophy

Dashboard is not a statistics page.

Dashboard answers one question.

"What should I do today?"

Dashboard should prioritize

Today's Meals

Daily Progress

Water Intake

Current Weight

BMI

Daily Nutrition Progress

Weekly Progress

Statistics are secondary.

---

# Discovery

Discovery has two purposes.

1.

Explore available meals.

2.

Allow users to build their own meal plan.

Discovery is not the main workflow.

Meal Builder is optional.

The automatic meal plan remains the primary experience.

---

# Meal Builder

Meal Builder allows users to manually create meal plans.

The system evaluates

Calories

Macros

Fiber

Meal Score

Nutrition Balance

The application should recommend healthier alternatives.

The application should never automatically replace user choices without permission.

---

# User Experience Rules

Reduce clicks.

Reduce typing.

Reduce thinking.

Reduce decision fatigue.

Whenever possible,

the application should prepare information before the user requests it.

---

# Development Rules

Prefer extending existing services.

Reuse existing APIs.

Reuse existing components.

Keep business logic outside UI components.

Avoid duplicate code.

Avoid hardcoded values.

Use configuration whenever possible.

Every new feature should be modular.

---

# Migration Rules

Do not delete existing functionality during development.

New functionality should coexist with the current implementation.

Only replace existing functionality after

- implementation
- testing
- validation

Rollback should always be possible.

---

# Testing Rules

Every completed feature must be verified.

Required verification

Survey

Recommendation

Meal Plan

Dashboard

Meal Log

Discovery

Weight Update

Regression testing is mandatory.

Existing functionality must continue working.

---

# Definition of Done

A task is complete only if

The feature works correctly.

The implementation follows this document.

No existing functionality is broken.

No critical regression exists.

Health safety rules are respected.

The code is maintainable.

The implementation supports the SmartMeal product vision.

---

# Final Rule

Whenever uncertainty exists,

choose the solution that

- protects user health
- preserves project stability
- minimizes future maintenance
- follows SmartMeal's vision as a Safe Nutrition Planner

Never optimize for speed at the expense of safety.

- Business Boundary (Rất quan trọng)
Hiện tại Agent chưa biết SmartMeal không phải app bệnh viện:
Không đưa lời khuyên y khoa.
Không chẩn đoán bệnh.
Không thay thế bác sĩ.
Chỉ hỗ trợ dinh dưỡng và lập kế hoạch ăn uống.

- Out of Scope:
AI Chat
AI Vision
OCR
Wearable
Smartwatch
Disease Management (phiên bản hiện tại)
Social Features



