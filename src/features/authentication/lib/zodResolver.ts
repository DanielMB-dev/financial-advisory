import { z } from 'zod'
import type { FieldValues, ResolverResult, Resolver, FieldErrors } from 'react-hook-form'

/**
 * Custom Zod resolver for react-hook-form
 * Properly catches Zod validation errors and converts to react-hook-form format
 * Compatible with Zod v4+
 */
export function zodResolver<TFieldValues extends FieldValues = FieldValues>(
  schema: z.ZodType<TFieldValues>
): Resolver<TFieldValues> {
  return async (values): Promise<ResolverResult<TFieldValues>> => {
    try {
      // Use safeParse to avoid throwing exceptions
      const result = await schema.safeParseAsync(values)

      if (result.success) {
        // Validation passed
        return {
          values: result.data,
          errors: {},
        }
      }

      // Validation failed - convert Zod errors to react-hook-form format
      const errors: FieldErrors<TFieldValues> = {}

      result.error.issues.forEach((issue: z.ZodIssue) => {
        const path = issue.path.join('.')
        if (path) {
          errors[path as keyof TFieldValues] = {
            type: issue.code,
            message: issue.message,
          } as FieldErrors<TFieldValues>[keyof TFieldValues]
        }
      })

      return {
        values: {},
        errors,
      }
    } catch (_error) {
      // Should never happen with safeParse, but just in case
      return {
        values: {},
        errors: {},
      }
    }
  }
}
