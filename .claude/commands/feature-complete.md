---
description: Finalize and document completed feature, prepare for deployment
---

<user_request>
#$ARGUMENTS
</user_request>

# Feature Completion Workflow

You are finalizing a completed feature by consolidating documentation, generating changelog, and marking it ready for deployment.

## Step 1: Validate Prerequisites

Check that all previous steps are complete:

```markdown
### Required Completions

- [x] Session created
- [x] Acceptance criteria defined
- [x] Backend designed
- [x] Frontend designed
- [x] Test strategy defined
- [x] Backend implemented
- [x] Frontend implemented
- [x] Feature validated (E2E tests passing)
- [x] Security audited (no critical issues)
```

If any step is missing or has blocking issues, inform the user and stop.

## Step 2: Consolidate Documentation

Create a comprehensive feature documentation file:

`.claude/doc/{feature_name}/FEATURE_README.md`

````markdown
# Feature: {Feature Name}

**Status**: ✅ Complete
**Completed**: {current_date}
**Version**: {version}

## Overview

[Brief description of the feature and its purpose]

## Business Value

[Explain the business value and user benefits]

## User Stories

[Copy from context session]

## Acceptance Criteria

[Copy from context session]

**Validation Status**: ✅ All criteria met

## Architecture

### Backend

**Design**: [Link to backend.md]

#### Domain Layer

- Entities: [list]
- Value Objects: [list]
- Aggregates: [list]

#### Application Layer

- Use Cases: [list]
- Ports: [list]

#### Infrastructure Layer

- Repositories: [list]
- Database Tables: [list]
- RLS Policies: [list]

#### API Endpoints

| Method | Path           | Description   | Auth |
| ------ | -------------- | ------------- | ---- |
| POST   | /api/{feature} | [description] | ✅   |
| GET    | /api/{feature} | [description] | ✅   |
| ...    | ...            | ...           | ...  |

### Frontend

**Design**: [Link to frontend.md and shadcn_ui.md]

#### Components

- [List main components]

#### Hooks

- Query Hooks: [list]
- Mutation Hooks: [list]
- Business Hooks: [list]

#### Pages

- [List pages and routes]

## Testing

### Test Coverage

- Domain Layer: [percentage]%
- Application Layer: [percentage]%
- Infrastructure Layer: [percentage]%
- Frontend: [percentage]%
- E2E Tests: [count] scenarios

### Test Reports

- Backend Tests: [link]
- Frontend Tests: [link]
- E2E Tests: [link to validation_report.md]
- Security Audit: [link to security_report.md]

## Security

**Audit Status**: ✅ Passed

### Security Measures

- Authentication: ✅ Supabase Auth
- Authorization: ✅ RLS Policies
- Input Validation: ✅ Zod schemas
- Rate Limiting: [status]
- OWASP Compliance: ✅

**Critical Issues**: None
**High Priority Issues**: [count or None]

## Performance

- API Response Time: [time]ms
- Page Load Time: [time]s
- Lighthouse Score: [score]

## Accessibility

- WCAG 2.1 AA: [Compliant/Partial]
- Keyboard Navigation: ✅
- Screen Reader: ✅

## Database Migrations

### Applied Migrations

- `{timestamp}_create_{table}.sql` - [description]
- [list all migrations]

### Rollback Strategy

[Describe how to rollback if needed]

## Dependencies

### External Services

- [List any external APIs or services]

### Feature Dependencies

- [List other features this depends on]

## Configuration

### Environment Variables

```bash
# Required for this feature
{VARIABLE_NAME}="value"
```
````

### Feature Flags

- [List any feature flags if applicable]

## Deployment

### Pre-deployment Checklist

- [ ] All tests passing
- [ ] Security audit passed
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Feature flag configured (if applicable)

### Deployment Steps

1. Apply database migrations
2. Deploy backend code
3. Deploy frontend code
4. Verify health checks
5. Test in production

### Rollback Plan

1. [Step to rollback if needed]
2. [Restore previous version]
3. [Revert migrations if necessary]

## Known Issues

[List any known issues or limitations]

## Future Enhancements

[List potential improvements for future sprints]

## References

- Context Session: `.claude/sessions/context_session_{feature_name}.md`
- Backend Design: `.claude/doc/{feature_name}/backend.md`
- Frontend Design: `.claude/doc/{feature_name}/frontend.md`
- UI Design: `.claude/doc/{feature_name}/shadcn_ui.md`
- Test Strategy: `.claude/doc/{feature_name}/test_cases.md`
- Validation Report: `.claude/doc/{feature_name}/validation_report.md`
- Security Report: `.claude/doc/{feature_name}/security_report.md`

## Team

- Designed by: Claude Code hexagonal-backend-architect, shadcn-ui-architect, frontend-developer
- Implemented by: [Developer names]
- Tested by: Claude Code qa-criteria-validator, backend-test-architect, frontend-test-engineer
- Reviewed by: Claude Code ui-ux-analyzer

## Changelog

### v1.0.0 - {current_date}

- Initial release
- [List major features]
- [List key changes]

````

## Step 3: Generate Changelog Entry

Add entry to project CHANGELOG.md (or create if doesn't exist):

```markdown
## [{version}] - {current_date}

### Added
- **{Feature Name}**: [Brief description]
  - [List major capabilities]
  - [List new API endpoints]
  - [List new components]

### Changed
- [Any changes to existing features]

### Fixed
- [Any bug fixes]

### Security
- [Security improvements]
````

## Step 4: Update Project README

Add feature to the project README.md:

```markdown
## Features

### {Feature Name}

[Brief description and link to feature documentation]

**Status**: ✅ Complete
**Documentation**: [Link to FEATURE_README.md]
```

## Step 5: Create Pull Request (Optional)

If working with Git, prepare PR description:

```markdown
## Pull Request: {Feature Name}

### Description

[Brief description of the feature]

### Type of Change

- [ ] New feature
- [ ] Enhancement
- [ ] Bug fix
- [ ] Documentation

### Checklist

- [x] All acceptance criteria met
- [x] Tests passing (unit, integration, E2E)
- [x] Security audit passed
- [x] Documentation complete
- [x] Code reviewed
- [x] Ready for production

### Test Coverage

- Domain: [percentage]%
- Application: [percentage]%
- Infrastructure: [percentage]%
- Frontend: [percentage]%

### Security

- OWASP Compliant: ✅
- RLS Policies: ✅
- Input Validation: ✅

### Documentation

- [ ] Backend design documented
- [ ] Frontend design documented
- [ ] API endpoints documented
- [ ] Feature README created
- [ ] Changelog updated

### Screenshots

[Add screenshots from validation]

### Related Issues

- Closes #[issue-number]

### Review Notes

[Any notes for reviewers]
```

Save to: `.claude/doc/{feature_name}/PR_DESCRIPTION.md`

## Step 6: Archive Session Context

Mark the session as complete:

Update `.claude/sessions/context_session_{feature_name}.md`:

```markdown
## Status

- [x] Session created
- [x] Acceptance criteria defined
- [x] Backend designed
- [x] Frontend designed
- [x] Test strategy defined
- [x] Backend implemented
- [x] Frontend implemented
- [x] Feature validated
- [x] Security audited
- [x] Feature completed ✅ {current_date}

## Completion Summary

**Completed**: {current_date}
**Status**: ✅ Ready for Production
**Version**: {version}

### Deliverables

- [x] Backend implementation
- [x] Frontend implementation
- [x] Unit tests
- [x] Integration tests
- [x] E2E tests
- [x] Security audit
- [x] Documentation

### Metrics

- Test Coverage: [average]%
- E2E Tests: [count] passing
- Security: No critical issues
- Performance: Meeting requirements

### Documentation

- Feature README: `.claude/doc/{feature_name}/FEATURE_README.md`
- PR Description: `.claude/doc/{feature_name}/PR_DESCRIPTION.md`

**Ready for Deployment**: ✅ Yes
```

## Step 7: Generate Summary Report

Create a final summary for the user:

````
🎉 Feature "{feature-name}" completed successfully!

## Summary

**Feature**: {Feature Name}
**Status**: ✅ Complete and Ready for Production
**Completed**: {current_date}
**Duration**: {start_date} to {current_date} ({duration})

## Deliverables

### Code
✅ Backend: [file count] files created
✅ Frontend: [file count] files created
✅ Tests: [test count] tests implemented
✅ Database: [migration count] migrations

### Documentation
✅ Feature README: `.claude/doc/{feature_name}/FEATURE_README.md`
✅ Changelog: Updated
✅ Project README: Updated
✅ PR Description: `.claude/doc/{feature_name}/PR_DESCRIPTION.md`

### Quality Metrics

#### Testing
- Total Tests: [count]
- Passing: [count] ✅
- Coverage: [percentage]%
- E2E Scenarios: [count] ✅

#### Security
- OWASP Compliant: ✅
- Critical Issues: 0
- Security Audit: Passed ✅

#### Performance
- API Response: [time]ms
- Page Load: [time]s
- Lighthouse: [score]

## Next Steps

### Option 1: Deploy to Production
```bash
# 1. Apply migrations
npx supabase db push

# 2. Deploy to production
npm run deploy

# 3. Verify deployment
npm run verify:production
````

### Option 2: Create Pull Request

1. Review PR description: `.claude/doc/{feature_name}/PR_DESCRIPTION.md`
2. Create PR with description
3. Request code review
4. Merge after approval

### Option 3: Start Next Feature

```bash
/feature-start {next-feature-name}
```

## Files to Review

📄 Complete Documentation:

- `.claude/doc/{feature_name}/FEATURE_README.md`
- `.claude/doc/{feature_name}/backend.md`
- `.claude/doc/{feature_name}/frontend.md`
- `.claude/doc/{feature_name}/validation_report.md`
- `.claude/doc/{feature_name}/security_report.md`

## Congratulations! 🎊

The feature is complete, tested, documented, and ready for production deployment.

All acceptance criteria have been met, security has been validated, and comprehensive documentation has been created.

💡 Tip: Keep the `.claude/doc/{feature_name}/` directory for future reference and maintenance.

````

## Step 8: Cleanup (Optional)

Ask the user if they want to:

```markdown
Would you like me to:

1. **Archive completed session**
   - Move context_session to archive
   - Keep for historical reference

2. **Create deployment tag**
   - Tag code for this feature version
   - Document release

3. **Prepare for next feature**
   - Clean up temporary files
   - Ready for next `/feature-start`
````

## Important Notes

- Feature completion requires all prerequisites to be met
- All critical and high-priority security issues must be resolved
- All E2E tests must be passing
- Documentation must be comprehensive
- Feature is now ready for production deployment
- Keep all documentation for maintenance and future reference
