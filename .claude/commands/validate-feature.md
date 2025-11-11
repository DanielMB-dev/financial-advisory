---
description: Validate feature against acceptance criteria and analyze UI/UX
---

<user_request>
#$ARGUMENTS
</user_request>

# Feature Validation Workflow

You are validating a feature against its acceptance criteria and analyzing the UI/UX quality.

## Step 1: Validate Prerequisites

1. Check if `.claude/sessions/context_session_{feature_name}.md` exists
2. Check if backend and frontend are implemented
3. Verify the application is running (or can be started)
4. Read the context session file for acceptance criteria

## Step 2: Start Development Server (if not running)

```bash
# Start the application
npm run dev

# Wait for server to be ready
# Application should be available at http://localhost:3000
```

## Step 3: Invoke qa-criteria-validator

Use the Task tool to invoke `qa-criteria-validator` agent in parallel with two tasks:

### Task A: Run E2E Tests

````
I need you to validate the "{feature-name}" feature against its acceptance criteria using Playwright E2E tests.

Context:
- Session file: .claude/sessions/context_session_{feature_name}.md
- Test cases: .claude/doc/{feature_name}/test_cases.md
- Application URL: http://localhost:3000

Please:

1. **Review Acceptance Criteria**:
   - Read all acceptance criteria from context session
   - Identify testable scenarios

2. **Create Playwright Tests**:
   - Create test file: `tests/e2e/{feature}.spec.ts`
   - Implement tests for each acceptance criterion
   - Use Given-When-Then format
   - Test happy paths
   - Test error scenarios
   - Test edge cases

3. **Run Tests**:
   - Execute Playwright tests
   - Capture screenshots on failures
   - Generate test report

4. **Validate Against Criteria**:
   - Map test results to acceptance criteria
   - Identify passing criteria
   - Identify failing criteria
   - Document any blockers

5. **Generate Report**:
   - Create validation report at `.claude/doc/{feature_name}/validation_report.md`
   - Include test results
   - Include screenshots
   - Include recommendations

Test Structure Example:
```typescript
test.describe('{Feature Name}', () => {
  test('should meet acceptance criterion 1', async ({ page }) => {
    // Given
    await page.goto('http://localhost:3000/{feature}')

    // When
    await page.click('button[data-testid="add-button"]')
    await page.fill('input[name="amount"]', '100')
    await page.click('button[type="submit"]')

    // Then
    await expect(page.locator('.success-message')).toBeVisible()
  })
})
````

Please output the validation report to `.claude/doc/{feature_name}/validation_report.md`

```

## Step 4: Invoke ui-ux-analyzer

Use the Task tool to invoke `ui-ux-analyzer` agent:

```

I need you to analyze the UI/UX of the "{feature-name}" feature.

Feature URL: http://localhost:3000/{feature}

UI Design Document: .claude/doc/{feature_name}/shadcn_ui.md

Please:

1. **Navigate to Feature**:
   - Open the feature page using Playwright
   - Capture screenshots of all states:
     - Initial/empty state
     - Loading state
     - Populated state
     - Error state

2. **Analyze Design Quality**:
   - Visual hierarchy and layout
   - Color scheme and contrast
   - Typography and readability
   - Spacing and alignment
   - Component consistency
   - Responsive design

3. **Analyze User Experience**:
   - Navigation flow
   - Form usability
   - Feedback mechanisms (loading, success, error)
   - Error messages clarity
   - Accessibility (keyboard navigation, ARIA labels)
   - Mobile responsiveness

4. **Compare with Design**:
   - Verify implementation matches shadcn_ui.md
   - Check if all specified components are used
   - Validate color scheme consistency

5. **Identify Issues**:
   - Usability problems
   - Accessibility violations
   - Design inconsistencies
   - Missing feedback mechanisms
   - Performance issues

6. **Provide Recommendations**:
   - High priority fixes
   - Medium priority improvements
   - Low priority enhancements
   - Best practice suggestions

Please output the analysis to `.claude/doc/{feature_name}/ui_analysis.md`

Include screenshots with annotations showing specific issues or good practices.

```

## Step 5: Wait for Both Agents to Complete

Both agents run in parallel. Wait for both to finish.

## Step 6: Review Results

After both agents complete:

1. Read `.claude/doc/{feature_name}/validation_report.md`
2. Read `.claude/doc/{feature_name}/ui_analysis.md`
3. Summarize findings

## Step 7: Generate Summary

Provide a comprehensive summary to the user:

```

✅ Feature validation completed!

📄 Generated Reports:

- Validation Report: .claude/doc/{feature_name}/validation_report.md
- UI/UX Analysis: .claude/doc/{feature_name}/ui_analysis.md

## Acceptance Criteria Validation

✅ Passing: [count] criteria
❌ Failing: [count] criteria
⚠️ Partial: [count] criteria

### Critical Issues:

- [List any critical failures]

### Blockers:

- [List any blockers preventing feature completion]

## UI/UX Analysis

### Strengths:

- [List positive findings]

### Issues Found:

🔴 High Priority: [count]

- [List high priority issues]

🟡 Medium Priority: [count]

- [List medium priority issues]

🟢 Low Priority: [count]

- [List low priority improvements]

### Accessibility:

- Keyboard Navigation: [Pass/Fail]
- Screen Reader Support: [Pass/Fail]
- ARIA Labels: [Pass/Fail]
- Color Contrast: [Pass/Fail]

## Next Steps:

1. **If Validation Passed**:
   - Address any UI/UX issues
   - Run `/security-audit {feature-name}` for security validation
   - Proceed to `/feature-complete {feature-name}`

2. **If Validation Failed**:
   - Review failing acceptance criteria
   - Fix identified issues
   - Re-run validation

3. **For UI/UX Issues**:
   - Prioritize high-priority fixes
   - Update components based on recommendations
   - Re-validate after fixes

📊 Test Execution:

- E2E Tests Run: [count]
- Passed: [count]
- Failed: [count]
- Screenshots: [count]

💡 Tip: Review the detailed reports for specific recommendations and fix priorities.

````

## Step 8: Create Issues/Tasks (Optional)

If there are issues, ask the user if they want to create a task list:

```markdown
Would you like me to create a task list for addressing the issues found?

If yes, I'll create:
- `.claude/doc/{feature_name}/fixes_required.md` with prioritized tasks
````

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
- [x] Frontend implemented
- [x] Feature validated ✅ {current_date}
- [ ] Security audited
      ...

## Validation Results

### E2E Testing

- Tests Run: [count]
- Passed: [count]
- Failed: [count]
- Report: .claude/doc/{feature_name}/validation_report.md

### UI/UX Analysis

- Issues Found: [count]
- High Priority: [count]
- Analysis: .claude/doc/{feature_name}/ui_analysis.md

### Status

- Acceptance Criteria Met: [Yes/No/Partial]
- Ready for Production: [Yes/No]
- Blockers: [List or None]
```

## Important Notes

- Both agents run in parallel for efficiency
- Ensure development server is running before validation
- Screenshots are captured automatically
- All issues are documented with recommendations
- Validation can be re-run after fixes
- Focus on acceptance criteria compliance first
- UI/UX improvements can be iterative
