---
description: Perform comprehensive security audit following OWASP guidelines
---

<user_request>
#$ARGUMENTS
</user_request>

# Security Audit Workflow

You are performing a comprehensive security audit of a feature following OWASP guidelines and best practices for financial applications.

## Step 1: Validate Prerequisites

1. Check if backend and frontend are implemented
2. Identify all API routes for the feature
3. Identify all components handling sensitive data
4. Read backend and frontend implementation files

## Step 2: Identify Scope

Parse the feature files and identify:

```markdown
## Security Audit Scope for {feature-name}

### API Endpoints

- [ ] POST /api/{feature}
- [ ] GET /api/{feature}
- [ ] PATCH /api/{feature}/[id]
- [ ] DELETE /api/{feature}/[id]

### Database Tables

- [ ] {table_name}

### Authentication Points

- [ ] [List all auth-protected endpoints]

### Data Handling

- [ ] User input fields
- [ ] File uploads (if any)
- [ ] External API calls (if any)

### Sensitive Data

- [ ] [List any financial data]
- [ ] [List any PII]
```

## Step 3: Run Automated Security Checks

Execute security scanning tools:

```bash
# Check for vulnerabilities in dependencies
npm audit

# Generate audit report
npm audit --json > .claude/doc/{feature_name}/npm_audit.json

# Check for common security issues
npx eslint src/features/{feature} --ext .ts,.tsx --config .eslintrc.security.json

# Check for hardcoded secrets
npx detect-secrets scan src/features/{feature}
```

## Step 4: Manual Security Review

Review the following security aspects:

### A. Authentication & Authorization

For each API endpoint, check:

```typescript
// ✅ Good patterns:
- [ ] Uses Supabase auth.getUser() to verify authentication
- [ ] Returns 401 for unauthenticated requests
- [ ] Verifies resource ownership before operations
- [ ] Returns 403 for unauthorized access
- [ ] Uses RLS policies as second layer of defense

// ❌ Bad patterns:
- [ ] No authentication check
- [ ] Relies only on client-side auth
- [ ] No resource ownership verification
- [ ] User ID from request body (should be from session)
```

### B. Input Validation

For each input, check:

```typescript
// ✅ Good patterns:
- [ ] Uses Zod for schema validation
- [ ] Validates data types
- [ ] Validates ranges and boundaries
- [ ] Sanitizes string inputs
- [ ] Validates file types and sizes (if applicable)

// ❌ Bad patterns:
- [ ] No validation
- [ ] Trusts client-side validation only
- [ ] Uses eval() or similar dangerous functions
- [ ] Directly uses input in SQL/queries
```

### C. SQL Injection Prevention

```typescript
// ✅ Good patterns:
- [ ] Uses Supabase client (parameterized queries)
- [ ] Uses .eq(), .filter() methods
- [ ] RLS policies enforce access control

// ❌ Bad patterns:
- [ ] Raw SQL with string interpolation
- [ ] Dynamic query building with user input
```

### D. XSS Prevention

```typescript
// ✅ Good patterns:
- [ ] React auto-escapes by default
- [ ] Uses DOMPurify if setting innerHTML
- [ ] Validates and sanitizes rich text

// ❌ Bad patterns:
- [ ] Uses dangerouslySetInnerHTML without sanitization
- [ ] Renders user input as HTML
- [ ] Executes user-provided scripts
```

### E. CSRF Protection

```typescript
// ✅ Good patterns:
- [ ] Uses SameSite cookies
- [ ] Supabase tokens in httpOnly cookies
- [ ] State-changing operations require POST/PUT/DELETE

// ❌ Bad patterns:
- [ ] State changes via GET requests
- [ ] No CSRF token for sensitive operations
```

### F. Data Exposure

```typescript
// ✅ Good patterns:
- [ ] Only returns necessary fields
- [ ] Sanitizes error messages
- [ ] No sensitive data in logs
- [ ] Uses .select() to limit fields

// ❌ Bad patterns:
- [ ] Returns entire database rows
- [ ] Exposes internal error details
- [ ] Logs sensitive data
- [ ] Exposes stack traces to client
```

### G. Rate Limiting

```typescript
// ✅ Good patterns:
- [ ] Implements rate limiting on endpoints
- [ ] Limits requests per user/IP
- [ ] Returns 429 for rate limit exceeded

// ❌ Bad patterns:
- [ ] No rate limiting
- [ ] Allows unlimited requests
```

### H. Secrets Management

```typescript
// ✅ Good patterns:
- [ ] Uses environment variables
- [ ] No hardcoded secrets
- [ ] Secrets in .env.local (gitignored)
- [ ] Uses Supabase anon key (not service key) in client

// ❌ Bad patterns:
- [ ] Hardcoded API keys
- [ ] Secrets in code
- [ ] Service keys in client code
- [ ] Secrets in git history
```

### I. Error Handling

```typescript
// ✅ Good patterns:
- [ ] Sanitized error messages to client
- [ ] Detailed errors logged server-side
- [ ] Proper HTTP status codes
- [ ] Generic messages for security errors

// ❌ Bad patterns:
- [ ] Exposes internal errors
- [ ] Stack traces to client
- [ ] Database errors to client
```

### J. RLS Policies

For each table, verify:

```sql
-- ✅ Good patterns:
- [ ] RLS is enabled
- [ ] Policies for SELECT, INSERT, UPDATE, DELETE
- [ ] Uses auth.uid() for user identification
- [ ] Policies tested with different users

-- ❌ Bad patterns:
- [ ] RLS disabled
- [ ] Missing policies
- [ ] Policies using SECURITY DEFINER incorrectly
- [ ] Overly permissive policies
```

## Step 5: Check OWASP Top 10

Verify compliance with OWASP Top 10:

```markdown
### OWASP Top 10 Checklist

- [ ] **A01: Broken Access Control**
  - Resource ownership verified
  - RLS policies implemented
  - No direct object references

- [ ] **A02: Cryptographic Failures**
  - HTTPS in production
  - Sensitive data encrypted
  - Secure password hashing (Supabase Auth)

- [ ] **A03: Injection**
  - No SQL injection vectors
  - Input validation implemented
  - Parameterized queries used

- [ ] **A04: Insecure Design**
  - Security considered in design
  - Defense in depth implemented
  - Secure defaults used

- [ ] **A05: Security Misconfiguration**
  - No default credentials
  - Unnecessary features disabled
  - Security headers configured

- [ ] **A06: Vulnerable Components**
  - npm audit clean
  - Dependencies up to date
  - No known vulnerabilities

- [ ] **A07: Authentication Failures**
  - Proper session management
  - Secure authentication (Supabase Auth)
  - No weak passwords allowed

- [ ] **A08: Software and Data Integrity**
  - Integrity checks for critical operations
  - Audit logs implemented
  - Change tracking enabled

- [ ] **A09: Security Logging Failures**
  - Security events logged
  - Audit trail for sensitive operations
  - Logs protected from tampering

- [ ] **A10: Server-Side Request Forgery**
  - Validates external URLs
  - Restricts outbound requests
  - No user-controlled redirects
```

## Step 6: Generate Security Report

Create a comprehensive security report:

```markdown
# Security Audit Report: {feature-name}

**Date**: {current_date}
**Auditor**: Claude Code Security Audit
**Scope**: {feature-name} feature

## Executive Summary

[Overall security posture: Excellent/Good/Fair/Poor]

**Critical Issues**: [count]
**High Priority**: [count]
**Medium Priority**: [count]
**Low Priority**: [count]

## Findings

### Critical Issues 🔴

[Issues that must be fixed before deployment]

1. **[Issue Title]**
   - Severity: Critical
   - Category: [OWASP Category]
   - Location: [file:line]
   - Description: [detailed description]
   - Impact: [potential security impact]
   - Recommendation: [how to fix]
   - References: [OWASP link, CWE, etc.]

### High Priority Issues 🟠

[Issues that should be fixed soon]

### Medium Priority Issues 🟡

[Issues that should be addressed]

### Low Priority Issues 🟢

[Minor improvements]

### Best Practices Followed ✅

[List security best practices correctly implemented]

## OWASP Top 10 Compliance

[Results of OWASP Top 10 checklist]

## Automated Scan Results

### NPM Audit

- Total Vulnerabilities: [count]
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

### Dependency Analysis

[List outdated or vulnerable dependencies]

## Recommendations

### Immediate Actions (Before Production)

1. [Critical fixes]

### Short-term (This Sprint)

2. [High priority fixes]

### Long-term (Future Sprints)

3. [Medium/low priority improvements]

## Sign-off

- [ ] All critical issues resolved
- [ ] All high priority issues resolved or documented
- [ ] Security review approved
- [ ] Ready for production deployment

**Reviewed by**: [Name]
**Date**: [Date]
**Status**: [Approved/Conditional/Rejected]

## Appendix

### Files Reviewed

- [List all files reviewed]

### Tools Used

- npm audit
- ESLint security plugin
- Manual code review

### References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Supabase Security: https://supabase.com/docs/guides/platform/going-into-prod#security
```

Save report to: `.claude/doc/{feature_name}/security_report.md`

## Step 7: Summary

Provide a summary to the user:

```
✅ Security audit completed!

📄 Security Report: .claude/doc/{feature_name}/security_report.md

## Security Status: [PASS/CONDITIONAL/FAIL]

### Issues Found:
🔴 Critical: [count] - Must fix before deployment
🟠 High: [count] - Should fix soon
🟡 Medium: [count] - Should address
🟢 Low: [count] - Minor improvements

### Critical Issues:
[List critical issues if any]

### OWASP Top 10 Compliance:
✅ Compliant: [count]
❌ Non-compliant: [count]
⚠️ Partial: [count]

### NPM Audit:
- Total Vulnerabilities: [count]
- Requires immediate attention: [Yes/No]

## Next Steps:

1. **If Critical Issues Found**:
   - Fix all critical issues immediately
   - Re-run security audit
   - Do NOT deploy until resolved

2. **If Only High/Medium Issues**:
   - Create task list for fixes
   - Plan fixes in current or next sprint
   - Consider conditional approval

3. **If All Clear**:
   - Proceed to `/feature-complete {feature-name}`
   - Mark feature ready for production

📋 Detailed Report: .claude/doc/{feature_name}/security_report.md

💡 Tip: Review the OWASP recommendations in the detailed report.
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
- [x] Backend implemented
- [x] Frontend implemented
- [x] Feature validated
- [x] Security audited ✅ {current_date}
- [ ] Feature completed

## Security Audit Results

- **Status**: [PASS/CONDITIONAL/FAIL]
- **Critical Issues**: [count]
- **High Priority**: [count]
- **OWASP Compliant**: [Yes/No/Partial]
- **Ready for Production**: [Yes/No]
- **Report**: .claude/doc/{feature_name}/security_report.md
```

## Important Notes

- Security audit is mandatory before production deployment
- All critical issues must be resolved
- Re-run audit after fixing critical issues
- Document any accepted risks with justification
- Keep audit reports for compliance purposes
