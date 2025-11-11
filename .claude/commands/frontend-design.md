---
description: Design frontend UI/UX and architecture using shadcn/ui and React Query patterns
---

<user_request>
#$ARGUMENTS
</user_request>

# Frontend Design Workflow

You are designing the frontend architecture for a feature following established React patterns with shadcn/ui components.

## Step 1: Validate Prerequisites

1. Check if `.claude/sessions/context_session_{feature_name}.md` exists
2. Check if `.claude/doc/{feature_name}/backend.md` exists (recommended but not required)
3. Read the context session file to understand requirements

## Step 2: Invoke shadcn-ui-architect (UI Design)

Use the Task tool to invoke the `shadcn-ui-architect` agent with the following prompt:

```
I need you to design the UI/UX for the "{feature-name}" feature.

Context:
{paste content from .claude/sessions/context_session_{feature_name}.md}

{if backend.md exists, mention: The backend design is available at .claude/doc/{feature_name}/backend.md}

Please design:

1. **Component Selection**:
   - List shadcn/ui components to use
   - Justify each component choice
   - Consider accessibility and responsiveness

2. **Layout Structure**:
   - Create conceptual wireframes (ASCII art or descriptions)
   - Define page layout hierarchy
   - Plan responsive breakpoints

3. **Component Details**:
   - Define each major component structure
   - Specify props and state
   - Plan user interactions
   - Define loading and error states

4. **Visual Design**:
   - Color scheme (using CSS variables from index.css)
   - Typography hierarchy
   - Spacing and layout patterns
   - Animation and transitions

5. **User Flows**:
   - Main user interactions
   - Form validation UX
   - Success/error feedback
   - Navigation patterns

Please output the complete UI design to `.claude/doc/{feature_name}/shadcn_ui.md`

The design should include specific shadcn components and their configurations.
```

## Step 3: Invoke frontend-developer (Architecture Design)

After the UI design is complete, use the Task tool to invoke the `frontend-developer` agent:

```
I need you to design the frontend architecture for the "{feature-name}" feature.

Available Documents:
- UI Design: .claude/doc/{feature_name}/shadcn_ui.md
- Backend Design: .claude/doc/{feature_name}/backend.md
- Context: .claude/sessions/context_session_{feature_name}.md

Available Skills:
- react-query-patterns: For data fetching, caching, and optimistic updates

Please design:

1. **Feature Structure**:
   - Complete directory structure under `src/features/{feature_name}/`
   - List all files to be created

2. **Schemas (Zod)**:
   - Define all TypeScript types
   - Create Zod validation schemas
   - Define input/output types

3. **Services**:
   - API client functions
   - Request/response handling
   - Error handling patterns

4. **Query Hooks**:
   - useQuery hooks for data fetching
   - Query keys structure
   - Stale time and cache configuration

5. **Mutation Hooks**:
   - useMutation hooks for data modification
   - Optimistic updates implementation
   - Cache invalidation strategy

6. **Business Hooks**:
   - Main feature hook (e.g., useIncome)
   - Computed values and derived state
   - Business logic encapsulation

7. **Components**:
   - Component hierarchy
   - Props interfaces
   - State management approach
   - Integration with hooks

Please output the complete frontend architecture plan to `.claude/doc/{feature_name}/frontend.md`

The plan should be detailed enough for implementation without requiring additional architectural decisions.

IMPORTANT:
- Use React Query for all data fetching
- Implement optimistic updates for better UX
- Follow the established feature-based architecture
- Use shadcn components from the UI design
- Keep components pure and free of business logic
- Business logic should live in hooks
```

## Step 4: Review and Summarize

After both agents complete:

1. Read both generated documents
2. Provide a summary to the user:

```
✅ Frontend architecture designed successfully!

📄 Design documents created:
- .claude/doc/{feature_name}/shadcn_ui.md (UI Design)
- .claude/doc/{feature_name}/frontend.md (Architecture)

📊 UI Design Summary:
- shadcn Components: [list count]
- Main Layouts: [list count]
- User Flows: [list count]

📊 Architecture Summary:
- Schemas: [list count]
- Services: [list count]
- Query Hooks: [list count]
- Mutation Hooks: [list count]
- Components: [list count]

📋 Next steps:
1. Review both design documents
2. Run `/test-strategy {feature-name}` to plan testing
3. Run `/implement-backend {feature-name}` to start backend implementation
4. Ask questions if anything needs clarification

💡 Tip: The UI design and architecture are aligned with the backend design.
```

## Step 5: Update Session Context

Update the `.claude/sessions/context_session_{feature_name}.md`:

```markdown
## Status

- [x] Session created
- [x] Acceptance criteria defined
- [x] Backend designed
- [x] Frontend designed ✅ {current_date}
- [ ] Test strategy defined
      ...
```

## Important Notes

- DO NOT implement code at this stage
- Only create the design documentation
- Run both agents sequentially (UI design first, then architecture)
- Ensure designs are aligned with backend API
- The agents have access to react-query-patterns skill
