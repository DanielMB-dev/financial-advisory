---
description: Implement frontend following the design plan with component testing
---

<user_request>
#$ARGUMENTS
</user_request>

# Frontend Implementation Workflow

You are implementing the frontend for a feature following React Query patterns and component-based architecture.

## Step 1: Validate Prerequisites

1. Check if `.claude/doc/{feature_name}/frontend.md` exists
2. Check if `.claude/doc/{feature_name}/shadcn_ui.md` exists
3. Check if `.claude/doc/{feature_name}/test_cases.md` exists
4. Check if backend API routes are implemented
5. Read all documents to understand the implementation plan

## Step 2: Create Todo List for Implementation

Parse the frontend.md and create a todo list:

```markdown
## Frontend Implementation Tasks

### Schemas

- [ ] Create {entity}.schema.ts
- [ ] Create {input}.schema.ts
      ...

### Services

- [ ] Create {entity}Service.ts
- [ ] Add HTTP client methods
      ...

### Query Hooks

- [ ] Create use{Entity}Query.ts
- [ ] Create use{Entities}Query.ts
      ...

### Mutation Hooks

- [ ] Create useCreate{Entity}Mutation.ts
- [ ] Create useUpdate{Entity}Mutation.ts
- [ ] Create useDelete{Entity}Mutation.ts
      ...

### Business Hooks

- [ ] Create use{Feature}.ts
      ...

### Components

- [ ] Create {Form}Component.tsx
- [ ] Create {List}Component.tsx
- [ ] Create {Detail}Component.tsx
      ...

### Pages

- [ ] Create {feature}/page.tsx
      ...

### Tests

- [ ] Create schema tests
- [ ] Create service tests
- [ ] Create hook tests
- [ ] Create component tests
```

## Step 3: Install Required shadcn Components

Based on shadcn_ui.md, install needed components:

```bash
# Example commands from shadcn_ui.md
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table
# ... add all required components
```

## Step 4: Implement Layer by Layer

Follow this sequence:

### Phase 1: Schemas (Zod)

For each schema:

1. **Create schema file**
2. **Define Zod schema with validation**
3. **Export TypeScript types**
4. **Create tests for edge cases**

Files to create:

- `src/features/{feature}/data/schemas/{entity}.schema.ts`
- `src/features/{feature}/data/schemas/__tests__/{entity}.schema.test.ts`

Example:

```typescript
// {entity}.schema.ts
import { z } from 'zod'

export const entitySchema = z.object({
  // Define schema based on frontend.md
})

export type Entity = z.infer<typeof entitySchema>
```

### Phase 2: Services

For each service:

1. **Create service file**
2. **Implement API client methods**
3. **Add error handling**
4. **Create tests with mocked axios**

Files to create:

- `src/features/{feature}/data/services/{entity}Service.ts`
- `src/features/{feature}/data/services/__tests__/{entity}Service.test.ts`

Example:

```typescript
// {entity}Service.ts
import axios from 'axios'
import type { Entity, CreateEntityInput } from '../schemas/{entity}.schema'

export const entityService = {
  async getAll(): Promise<Entity[]> {
    const response = await axios.get('/api/{feature}')
    return response.data
  },
  // ... other methods
}
```

### Phase 3: Query Hooks

For each query hook:

1. **Create hook file**
2. **Use useQuery from React Query**
3. **Define query keys**
4. **Configure caching**
5. **Create tests**

Files to create:

- `src/features/{feature}/hooks/queries/use{Entity}Query.ts`
- `src/features/{feature}/hooks/queries/__tests__/use{Entity}Query.test.ts`

Example:

```typescript
import { useQuery } from '@tanstack/react-query'
import { entityService } from '@/features/{feature}/data/services/{entity}Service'

export function useEntitiesQuery() {
  return useQuery({
    queryKey: ['{feature}', 'list'],
    queryFn: entityService.getAll,
    staleTime: 5 * 60 * 1000,
  })
}
```

### Phase 4: Mutation Hooks

For each mutation hook:

1. **Create hook file**
2. **Use useMutation from React Query**
3. **Implement optimistic updates**
4. **Configure cache invalidation**
5. **Create tests**

Files to create:

- `src/features/{feature}/hooks/mutations/useCreate{Entity}Mutation.ts`
- `src/features/{feature}/hooks/mutations/__tests__/useCreate{Entity}Mutation.test.ts`

Example:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { entityService } from '@/features/{feature}/data/services/{entity}Service'

export function useCreateEntityMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: entityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['{feature}'] })
    },
  })
}
```

### Phase 5: Business Hooks

Create the main feature hook:

1. **Combine query and mutation hooks**
2. **Add computed values**
3. **Encapsulate business logic**
4. **Create tests**

Files to create:

- `src/features/{feature}/hooks/use{Feature}.ts`
- `src/features/{feature}/hooks/__tests__/use{Feature}.test.ts`

### Phase 6: Components

For each component:

1. **Read UI design from shadcn_ui.md**
2. **Create component file**
3. **Use shadcn components**
4. **Integrate with hooks**
5. **Create tests with React Testing Library**

Files to create:

- `src/features/{feature}/components/{Component}.tsx`
- `src/features/{feature}/components/__tests__/{Component}.test.tsx`

Example test:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { EntityForm } from '../EntityForm'

describe('EntityForm', () => {
  it('should render form fields', () => {
    // Test based on test_cases.md
  })

  it('should validate input', () => {
    // Test validation
  })

  it('should submit form', () => {
    // Test submission
  })
})
```

### Phase 7: Pages

Create Next.js pages:

1. **Create page.tsx**
2. **Compose components**
3. **Handle loading and error states**

Files to create:

- `src/app/{feature}/page.tsx`

## Step 5: Run All Tests

After implementation:

```bash
# Run all tests
npm run test

# Run specific feature tests
npm run test src/features/{feature}

# Run component tests
npm run test:ui

# Check coverage
npm run test:coverage
```

Ensure coverage goals are met:

- Schemas: >90%
- Services: >85%
- Hooks: >90%
- Components: >85%

## Step 6: Invoke frontend-test-engineer for Review

Use the Task tool to invoke `frontend-test-engineer` agent:

```
I've implemented the frontend for "{feature-name}" feature.

Implemented files are located at:
- src/features/{feature}/

Please review:
1. Component test coverage
2. Hook test quality
3. Missing test scenarios
4. Integration between components and hooks
5. Accessibility testing
6. User interaction testing

Test cases document: .claude/doc/{feature_name}/test_cases.md

Please identify any gaps or improvements needed in the test suite.

Output your review to `.claude/doc/{feature_name}/frontend_test_review.md`
```

## Step 7: Manual Testing

Start the development server and test manually:

```bash
npm run dev
```

Test:

1. Navigate to the feature page
2. Test all user interactions
3. Verify form validation
4. Check loading states
5. Test error scenarios
6. Verify data updates

## Step 8: Summary

Provide a summary to the user:

```
✅ Frontend implemented successfully!

📁 Created files:
- Schemas: [count] files
- Services: [count] files
- Query Hooks: [count] files
- Mutation Hooks: [count] files
- Business Hooks: [count] files
- Components: [count] files
- Pages: [count] files
- Tests: [count] test files

✅ Test Results:
- Total Tests: [count]
- Passed: [count]
- Failed: [count]
- Coverage:
  - Schemas: [percentage]%
  - Services: [percentage]%
  - Hooks: [percentage]%
  - Components: [percentage]%

📄 Test Review: .claude/doc/{feature_name}/frontend_test_review.md

📋 Next steps:
1. Review test coverage and address any gaps
2. Run `/validate-feature {feature-name}` for E2E testing
3. Fix any failing tests
4. Test manually in the browser

💡 Development server: http://localhost:3000/{feature}
```

## Step 9: Update Session Context

Update the `.claude/sessions/context_session_{feature_name}.md`:

```markdown
## Status

- [x] Session created
- [x] Acceptance criteria defined
- [x] Backend designed
- [x] Frontend designed
- [x] Test strategy defined
- [x] Backend implemented
- [x] Frontend implemented ✅ {current_date}
- [ ] Feature validated
      ...

## Implementation Notes

### Frontend

- Implemented on: {current_date}
- Test Coverage: [percentages]
- Files Created: [count]
- shadcn Components Used: [list]
```

## Important Notes

- Follow the design from shadcn_ui.md strictly
- Use React Query for all data fetching
- Implement optimistic updates for better UX
- Keep components pure and testable
- Business logic should live in hooks, not components
- Test user interactions thoroughly
- Ensure accessibility (keyboard navigation, screen readers)
- Handle loading and error states gracefully
