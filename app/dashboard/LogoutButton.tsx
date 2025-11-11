'use client'

import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { signout } from '@/app/auth/actions'

function LogoutButtonInner() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" variant="outline" disabled={pending}>
      {pending ? 'Logging out...' : 'Logout'}
    </Button>
  )
}

export function LogoutButton() {
  return (
    <form action={signout}>
      <LogoutButtonInner />
    </form>
  )
}
