export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid email or password') {
    super(message)
    this.name = 'InvalidCredentialsError'
  }
}

export class EmailNotVerifiedError extends Error {
  constructor(message = 'Email address has not been verified') {
    super(message)
    this.name = 'EmailNotVerifiedError'
  }
}

export class UserNotFoundError extends Error {
  constructor(message = 'User not found') {
    super(message)
    this.name = 'UserNotFoundError'
  }
}

export class DuplicateEmailError extends Error {
  constructor(message = 'Email address is already registered') {
    super(message)
    this.name = 'DuplicateEmailError'
  }
}

export class InvalidTokenError extends Error {
  constructor(message = 'Invalid or expired token') {
    super(message)
    this.name = 'InvalidTokenError'
  }
}

export class SessionExpiredError extends Error {
  constructor(message = 'Session has expired') {
    super(message)
    this.name = 'SessionExpiredError'
  }
}
