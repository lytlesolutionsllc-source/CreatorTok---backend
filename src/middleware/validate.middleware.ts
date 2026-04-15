import { Request, Response, NextFunction } from 'express';
import { fail } from '../types';

type FieldSpec = {
  field: string;
  type?: 'string' | 'number' | 'boolean';
  required?: boolean;
};

/**
 * Middleware factory that validates presence of required body fields.
 *
 * Usage:
 *   router.post('/register', validate([{ field: 'email', type: 'string' }, { field: 'password', type: 'string' }]), handler)
 */
export function validate(fields: FieldSpec[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const { field, type, required = true } of fields) {
      const value = (req.body as Record<string, unknown>)[field];

      if (required && (value === undefined || value === null || value === '')) {
        errors.push(`"${field}" is required`);
        continue;
      }

      if (value !== undefined && value !== null && type) {
        if (typeof value !== type) {
          errors.push(`"${field}" must be of type ${type}`);
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json(fail(errors.join(', ')));
      return;
    }

    next();
  };
}
