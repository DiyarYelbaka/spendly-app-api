/**
 * User Types
 * Type definitions for authenticated user
 */

export interface UserPayload {
  id: string;
  email: string;
  name?: string;
}

export interface UserContext {
  preferences: Record<string, any>;
  firstName: string;
  initials: string;
}

