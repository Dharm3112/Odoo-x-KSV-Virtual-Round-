import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from '@prisma/client';
import { IsStrongPassword } from '@common/validators';

export const SELF_SIGNUP_ROLES: Role[] = [Role.admin, Role.procurement_officer, Role.manager];

export class SignupDto {
  @ApiProperty({ example: 'officer.john@vendorbridge.com' })
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'SecurePassword123!', minLength: 8 })
  @IsString()
  @IsStrongPassword()
  password!: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiProperty({ enum: SELF_SIGNUP_ROLES, example: Role.procurement_officer })
  @IsEnum(SELF_SIGNUP_ROLES as unknown as object, {
    message: `role must be one of: ${SELF_SIGNUP_ROLES.join(', ')}`,
  })
  role!: Role;
}
