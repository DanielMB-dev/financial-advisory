---
description: Design backend architecture using hexagonal architecture and DDD patterns
---

<user_request>
#$ARGUMENTS
</user_request>

# Backend Design Workflow

You are designing the backend architecture for a feature following hexagonal architecture and Domain-Driven Design principles.

## Step 1: Validate Prerequisites

1. Check if `.claude/sessions/context_session_{feature_name}.md` exists
2. If not found, inform user to run `/feature-start {feature-name}` first
3. Read the context session file to understand requirements

## Step 2: Invoke Hexagonal Backend Architect

Use the Task tool to invoke the `hexagonal-backend-architect` agent with the following prompt:

```
I need you to design the backend architecture for the "{feature-name}" feature.

Context:
{paste content from .claude/sessions/context_session_{feature_name}.md}

Additional Available Skills:
- finance-domain-modeler: For financial domain entities (transactions, accounts, categories)
- supabase-rls-patterns: For Row Level Security policy design
- api-security-validator: For API security best practices

Please design:

1. **Domain Layer**:
   - Entities (with TypeScript interfaces)
   - Value Objects (with validation logic)
   - Aggregates (if applicable)
   - Domain Events

2. **Application Layer**:
   - Use Cases (with detailed logic)
   - Ports (interfaces for repositories and services)
   - DTOs (Data Transfer Objects)

3. **Infrastructure Layer**:
   - Adapters (Supabase implementations)
   - Repositories (with Supabase client)
   - Database Schema (SQL migration files)
   - RLS Policies (for data security)
   - Mappers (domain <-> database)

4. **Web Layer**:
   - API Routes (Next.js App Router)
   - Request/Response DTOs
   - Validation schemas (Zod)
   - Error handling

5. **File Structure**:
   - List all files to be created with their paths
   - Include brief description of each file

Please output the complete design plan to `.claude/doc/{feature_name}/backend.md`

The plan should be detailed enough for implementation without requiring additional architectural decisions.

IMPORTANT:
- Use Supabase for database (PostgreSQL)
- Implement RLS policies for all tables
- Use decimal types for money amounts
- Follow the Money pattern for currency handling
- Include audit trail patterns
- Define proper indexes for performance
- Use UUIDs for primary keys
```

## Step 3: Wait for Agent Completion

The agent will:

1. Analyze the requirements
2. Design the domain model
3. Define use cases
4. Design database schema
5. Create the implementation plan
6. Save it to `.claude/doc/{feature_name}/backend.md`

## Step 4: Review and Summarize

After the agent completes:

1. Read the generated `.claude/doc/{feature_name}/backend.md`
2. Provide a brief summary to the user:

```
✅ Backend architecture designed successfully!

📄 Design document created at:
.claude/doc/{feature_name}/backend.md

📊 Summary:
- Domain Entities: [list count]
- Value Objects: [list count]
- Use Cases: [list count]
- API Endpoints: [list count]
- Database Tables: [list count]

📋 Next steps:
1. Review the backend design document
2. Run `/frontend-design {feature-name}` to design the UI
3. Run `/test-strategy {feature-name}` to plan testing
4. Ask questions if anything needs clarification

💡 Tip: The design follows hexagonal architecture with clear separation of concerns.
```

## Step 5: Update Session Context

Update the `.claude/sessions/context_session_{feature_name}.md` to mark backend design as completed:

```markdown
## Status

- [x] Session created
- [x] Acceptance criteria defined
- [x] Backend designed ✅ {current_date}
- [ ] Frontend designed
      ...
```

## Important Notes

- DO NOT implement code at this stage
- Only create the design documentation
- Ensure the design includes all necessary details for implementation
- The agent has access to finance-domain-modeler skill for financial patterns
- All database designs should include RLS policies
