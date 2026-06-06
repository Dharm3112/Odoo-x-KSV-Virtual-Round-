import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const STRONG_PASSWORD_MESSAGE =
  'Password must be at least 8 characters and contain at least one uppercase letter, one lowercase letter, one digit, and one special character';

/**
 * Class-validator decorator enforcing the project-wide password strength policy
 * (min 8 chars, 1 upper, 1 lower, 1 digit, 1 special character).
 *
 * Reused by signup and reset-password DTOs to keep the rule in a single place.
 */
export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && STRONG_PASSWORD_REGEX.test(value);
        },
        defaultMessage(args: ValidationArguments): string {
          return `${args.property} ${STRONG_PASSWORD_MESSAGE}`;
        },
      },
    });
  };
}
