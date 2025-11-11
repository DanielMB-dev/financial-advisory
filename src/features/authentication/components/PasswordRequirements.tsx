'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
}

const requirements: PasswordRequirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'One uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'One lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'One number',
    test: (password) => /[0-9]/.test(password),
  },
]

interface PasswordRequirementsProps {
  password: string
}

/**
 * Live password requirements indicator
 * Updates as user types to show which requirements are met
 */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  return (
    <div className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
      <p className="text-sm font-medium text-foreground">Password requirements:</p>
      <ul className="space-y-1.5">
        {requirements.map((requirement, index) => {
          const isMet = requirement.test(password)
          return (
            <li
              key={index}
              className={cn(
                'flex items-center gap-2 text-sm transition-colors',
                isMet ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {isMet ? (
                <Check className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <X className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
              <span>{requirement.label}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
