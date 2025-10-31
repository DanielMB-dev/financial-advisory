---
description: Implement backend following the design plan with TDD approach
---

<user_request>
#$ARGUMENTS
</user_request>

# Backend Implementation Workflow

You are implementing the backend for a feature following the hexagonal architecture design and TDD principles.

## Step 1: Validate Prerequisites

1. Check if `.claude/doc/{feature_name}/backend.md` exists
2. Check if `.claude/doc/{feature_name}/test_cases.md` exists
3. Read both documents to understand the implementation plan

## Step 2: Create Todo List for Implementation

Parse the backend.md and create a todo list with all implementation tasks:

```markdown
## Backend Implementation Tasks

### Domain Layer

- [ ] Create {Entity} entity
- [ ] Create {ValueObject} value object
- [ ] Create {DomainEvent} domain event
      ...

### Application Layer

- [ ] Create {UseCase} use case
- [ ] Create {Port} interface
- [ ] Create {DTO} data transfer object
      ...

### Infrastructure Layer

- [ ] Create Supabase migration for {table}
- [ ] Create {Repository} repository
- [ ] Create {Mapper} mapper
      ...

### Web Layer

- [ ] Create API route for {endpoint}
      ...

### Tests

- [ ] Create domain layer tests
- [ ] Create application layer tests
- [ ] Create infrastructure layer tests
- [ ] Create web layer tests
```

## Step 3: Implement Layer by Layer (TDD Approach)

Follow this sequence strictly:

### Phase 1: Domain Layer

For each domain component:

1. **Read test cases** from test_cases.md
2. **Create test file first** (Red phase)
   - Write failing tests based on test_cases.md
   - Run tests to confirm they fail
3. **Implement the component** (Green phase)
   - Write minimal code to pass tests
   - Run tests to confirm they pass
4. **Refactor** (Refactor phase)
   - Clean up code
   - Ensure tests still pass

Files to create:

- `src/features/{feature}/domain/entities/{Entity}.ts`
- `src/features/{feature}/domain/entities/__tests__/{Entity}.test.ts`
- `src/features/{feature}/domain/value-objects/{ValueObject}.ts`
- `src/features/{feature}/domain/value-objects/__tests__/{ValueObject}.test.ts`

### Phase 2: Application Layer

For each use case:

1. **Read test cases** from test_cases.md
2. **Create test file with mocked dependencies**
3. **Implement use case**
4. **Refactor**

Files to create:

- `src/features/{feature}/application/use-cases/{UseCase}.ts`
- `src/features/{feature}/application/use-cases/__tests__/{UseCase}.test.ts`
- `src/features/{feature}/application/ports/I{Repository}.ts`
- `src/features/{feature}/application/dtos/{DTO}.ts`

### Phase 3: Infrastructure Layer

1. **Create Supabase migrations first**:
   - Run: `npx supabase migration new {feature}_{table}`
   - Implement SQL schema from backend.md
   - Include RLS policies
   - Include indexes

2. **Implement repositories with tests**:
   - Mock Supabase client
   - Test CRUD operations
   - Test RLS policy enforcement

Files to create:

- `supabase/migrations/{timestamp}_create_{table}.sql`
- `src/features/{feature}/infrastructure/repositories/{Repository}.ts`
- `src/features/{feature}/infrastructure/repositories/__tests__/{Repository}.test.ts`
- `src/features/{feature}/infrastructure/mappers/{Mapper}.ts`

### Phase 4: Web Layer (API Routes)

For each API endpoint:

1. **Create test file for route**
2. **Implement route handler**
3. **Test authentication**
4. **Test validation**
5. **Test responses**

Files to create:

- `src/app/api/{feature}/route.ts`
- `src/app/api/{feature}/__tests__/route.test.ts`

## Step 4: Run All Tests

After implementation:

```bash
# Run unit tests
npm run test

# Run specific feature tests
npm run test src/features/{feature}

# Check coverage
npm run test:coverage
```

Ensure all tests pass and coverage goals are met:

- Domain: 100%
- Application: >95%
- Infrastructure: >80%
- Web: >90%

## Step 5: Invoke backend-test-architect for Review

Use the Task tool to invoke `backend-test-architect` agent for test review:

```
I've implemented the backend for "{feature-name}" feature.

Implemented files are located at:
- src/features/{feature}/

Please review:
1. Test coverage completeness
2. Test quality (assertions, edge cases)
3. Missing test scenarios
4. Test organization and structure
5. Mock usage and isolation

Test cases document: .claude/doc/{feature_name}/test_cases.md

Please identify any gaps or improvements needed in the test suite.

Output your review to `.claude/doc/{feature_name}/backend_test_review.md`
```

## Step 6: Apply Supabase Migrations

After tests pass:

```bash
# Start Supabase locally (if not running)
npx supabase start

# Apply migrations
npx supabase db push

# Verify RLS policies
npx supabase db test
```

## Step 7: Summary

Provide a summary to the user:

```
✅ Backend implemented successfully!

📁 Created files:
- Domain Layer: [count] files
- Application Layer: [count] files
- Infrastructure Layer: [count] files
- Web Layer: [count] API routes
- Tests: [count] test files
- Migrations: [count] SQL files

✅ Test Results:
- Total Tests: [count]
- Passed: [count]
- Failed: [count]
- Coverage:
  - Domain: [percentage]%
  - Application: [percentage]%
  - Infrastructure: [percentage]%
  - Web: [percentage]%

📄 Test Review: .claude/doc/{feature_name}/backend_test_review.md

📋 Next steps:
1. Review test coverage and address any gaps
2. Run `/implement-frontend {feature-name}` to implement frontend
3. Fix any failing tests
4. Apply database migrations to development environment

💡 Tip: All tests should be passing before moving to frontend implementation.
```

## Step 8: Update Session Context

Update the `.claude/sessions/context_session_{feature_name}.md`:

```markdown
## Status

- [x] Session created
- [x] Acceptance criteria defined
- [x] Backend designed
- [x] Frontend designed
- [x] Test strategy defined
- [x] Backend implemented ✅ {current_date}
- [ ] Frontend implemented
      ...

## Implementation Notes

### Backend

- Implemented on: {current_date}
- Test Coverage: [percentages]
- Files Created: [count]
- Migrations: [list migration files]
```

## Important Notes

- Follow TDD: Red-Green-Refactor cycle
- Write tests before implementation
- Ensure all tests pass before proceeding
- Apply migrations after tests pass
- Review test coverage carefully
- Domain layer should have 100% coverage
- Use dependency injection for testability
