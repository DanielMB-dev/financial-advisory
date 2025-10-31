import { Email } from '../../domain/value-objects/Email';

export interface IEmailService {
  sendVerificationEmail(email: Email, token: string): Promise<void>;
  sendPasswordResetEmail(email: Email, token: string): Promise<void>;
  sendWelcomeEmail(email: Email, userName?: string): Promise<void>;
}
