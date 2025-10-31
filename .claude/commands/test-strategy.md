---
description: Create comprehensive test strategy including unit, integration, and E2E tests
---

<user_request>
#$ARGUMENTS
</user_request>

# Test Strategy Workflow

You are creating a comprehensive testing strategy for a feature, identifying all test cases, edge cases, and test data builders.

## Step 1: Validate Prerequisites

1. Check if `.claude/sessions/context_session_{feature_name}.md` exists
2. Check if `.claude/doc/{feature_name}/backend.md` exists
3. Check if `.claude/doc/{feature_name}/frontend.md` exists
4. Read all available documents to understand the feature

## Step 2: Invoke typescript-test-explorer

Use the Task tool to invoke the `typescript-test-explorer` agent with the following prompt:

```
I need you to design a comprehensive test strategy for the "{feature-name}" feature.

Available Documents:
- Context: .claude/sessions/context_session_{feature_name}.md
- Backend Design: .claude/doc/{feature_name}/backend.md
- Frontend Design: .claude/doc/{feature_name}/frontend.md
- UI Design: .claude/doc/{feature_name}/shadcn_ui.md

Please analyze all layers and create:

1. **Backend Test Cases**:

   a. **Domain Layer Tests**:
      - Entity creation and validation
      - Value object behavior and edge cases
      - Domain event handling
      - Business rule enforcement
      - Test files: `{entity}/__tests__/{Entity}.test.ts`

   b. **Application Layer Tests**:
      - Use case happy paths
      - Use case error scenarios
      - Port/interface mocking
      - DTO validation
      - Test files: `use-cases/__tests__/{UseCase}.test.ts`

   c. **Infrastructure Layer Tests**:
      - Repository CRUD operations
      - Supabase client mocking
      - RLS policy validation
      - Data mapping (domain <-> database)
      - Error handling
      - Test files: `repositories/__tests__/{Repository}.test.ts`

   d. **Web Layer Tests**:
      - API route authentication
      - Request validation
      - Response formatting
      - Error responses
      - Test files: `api/{endpoint}/__tests__/route.test.ts`

2. **Frontend Test Cases**:

   a. **Component Tests**:
      - Rendering with different props
      - User interactions (click, input, submit)
      - Form validation
      - Loading and error states
      - Accessibility
      - Test files: `components/__tests__/{Component}.test.tsx`

   b. **Hook Tests**:
      - Query hooks data fetching
      - Mutation hooks with cache updates
      - Optimistic updates
      - Error handling
      - Test files: `hooks/__tests__/{hook}.test.ts`

   c. **Service Tests**:
      - HTTP request mocking
      - Response parsing
      - Error handling
      - Test files: `services/__tests__/{service}.test.ts`

3. **E2E Test Cases (Playwright)**:
   - Complete user flows
   - Form submissions
   - Data persistence
   - Error scenarios
   - Cross-browser compatibility
   - Test files: `tests/e2e/{feature}.spec.ts`

4. **Edge Cases**:
   - Identify all edge cases for:
     - Boundary values
     - Null/undefined handling
     - Empty states
     - Very large data sets
     - Concurrent operations
     - Network failures
     - Authentication failures

5. **Test Data Builders**:
   - Builder pattern for test data
   - Factory functions for common scenarios
   - Mock data generators

6. **Coverage Goals**:
   - Define coverage targets per layer
   - Critical paths requiring 100% coverage

7. **Test Execution Order**:
   - Recommended order for running tests
   - Dependencies between test suites

Please output the complete test strategy to `.claude/doc/{feature_name}/test_cases.md`

The strategy should be comprehensive enough to guide test implementation without missing any critical scenarios.

IMPORTANT:
- Use ✅ for tests that should pass
- Use ❌ for tests that should fail (negative tests)
- Include specific test file paths
- Define test data builders for reusability
- Consider both happy paths and error scenarios
- Include performance and security test considerations
```

## Step 3: Review and Summarize

After the agent completes:

1. Read the generated `.claude/doc/{feature_name}/test_cases.md`
2. Provide a summary to the user:

```
✅ Test strategy created successfully!

📄 Test strategy document created at:
.claude/doc/{feature_name}/test_cases.md

📊 Test Coverage Summary:
- Backend Unit Tests: [count] test cases
- Backend Integration Tests: [count] test cases
- Frontend Component Tests: [count] test cases
- Frontend Hook Tests: [count] test cases
- E2E Tests: [count] test scenarios
- Edge Cases Identified: [count]

🎯 Coverage Goals:
- Domain Layer: 100%
- Application Layer: 95%
- Infrastructure Layer: 80%
- Frontend: 85%

📋 Next steps:
1. Review the test strategy document
2. Run `/implement-backend {feature-name}` to implement backend with tests
3. Run `/implement-frontend {feature-name}` to implement frontend with tests
4. Tests will be created during implementation

💡 Tip: The test strategy includes both positive and negative test cases.
```

## Step 4: Update Session Context

Update the `.claude/sessions/context_session_{feature_name}.md`:

```markdown
## Status

- [x] Session created
- [x] Acceptance criteria defined
- [x] Backend designed
- [x] Frontend designed
- [x] Test strategy defined ✅ {current_date}
- [ ] Backend implemented
      ...
```

## Important Notes

- DO NOT implement tests at this stage
- Only create the test strategy documentation
- Ensure all layers are covered
- Include edge cases and error scenarios
- Define clear coverage goals
- Test data builders should be reusable
