---
description: Initialize a new feature with spec-driven approach, creating session context and base structure
---

<user_request>
#$ARGUMENTS
</user_request>

# Feature Start Workflow

You are starting a new feature following the spec-driven development approach. Follow these steps:

## Step 1: Parse Feature Name

Extract the feature name from the arguments. If no name provided, ask the user for the feature name.

## Step 2: Create Session Context File

Create `.claude/sessions/context_session_{feature_name}.md` with the following structure:

```markdown
# Feature: {feature-name}

## Business Requirements

[To be filled: Describe the feature from a business perspective]

## User Stories

- As a [user type], I want to [action], so that [benefit]
- [Add more user stories as needed]

## Acceptance Criteria

[Will be completed by qa-criteria-validator agent]

## Technical Constraints

### Performance Requirements

- [e.g., API response time < 200ms]
- [e.g., Page load time < 2s]

### Security Requirements

- [e.g., Authentication required]
- [e.g., RLS policies enforced]

### Scalability Considerations

- [e.g., Support for 1000+ transactions per user]
- [e.g., Real-time updates]

## Dependencies

### Required Features

- [List features this depends on]

### External Services

- [List any external APIs or services needed]

## Timeline

- **Priority Level**: [High/Medium/Low]
- **Estimated Effort**: [e.g., 1-2 weeks]
- **Sprint**: [Sprint number]

## Status

- [x] Session created
- [ ] Acceptance criteria defined
- [ ] Backend designed
- [ ] Frontend designed
- [ ] Test strategy defined
- [ ] Backend implemented
- [ ] Frontend implemented
- [ ] Feature validated
- [ ] Security audited
- [ ] Feature completed

## Notes

[Add any additional notes or considerations]
```

## Step 3: Create Documentation Directory

Create the directory structure:

- `.claude/doc/{feature_name}/` - For storing all feature documentation

## Step 4: Create Feature Code Structure

Create the base directory structure in `src/features/{feature_name}/`:

```
src/features/{feature_name}/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   └── events/
├── application/
│   ├── use-cases/
│   ├── ports/
│   └── dtos/
├── infrastructure/
│   ├── adapters/
│   └── repositories/
├── data/
│   ├── services/
│   └── schemas/
├── hooks/
│   ├── queries/
│   ├── mutations/
│   └── context/
└── components/
```

## Step 5: Inform User

After creating the structure, inform the user:

```
✅ Feature "{feature-name}" initialized successfully!

📁 Created files:
- .claude/sessions/context_session_{feature_name}.md
- .claude/doc/{feature_name}/ (directory)
- src/features/{feature_name}/ (directory structure)

📋 Next steps:
1. Fill in the Business Requirements and User Stories in the context session file
2. Run `/explore-plan {feature-name}` to explore the codebase and create an implementation plan
3. Define acceptance criteria with qa-criteria-validator
4. Continue with backend and frontend design

💡 Tip: Review the context session file and update it with specific requirements before proceeding.
```

## Important Notes

- DO NOT implement any code at this stage
- Only create directory structures and documentation templates
- Ask the user for clarification if the feature name or requirements are unclear
- Ensure all paths use the correct feature name (kebab-case recommended)
