import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from '@common/validators';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token received via the password-reset email' })
  @IsString()
  @MinLength(10)
  token!: string;

  @ApiProperty({ example: 'NewSecurePassword456!', minLength: 8 })
  @IsString()
  @IsStrongPassword()
  newPassword!: string;
}
