import { ApiProperty } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';

export class AuthUserDto {
  @ApiProperty({ example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d' })
  userId!: string;

  @ApiProperty({ example: 'officer.john@vendorbridge.com' })
  email!: string;

  @ApiProperty({ enum: Role, example: Role.procurement_officer })
  role!: Role;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ enum: UserStatus, example: UserStatus.active })
  status!: UserStatus;
}

export class AuthTokensDto {
  @ApiProperty({ description: 'Short-lived bearer token' })
  accessToken!: string;

  @ApiProperty({ description: 'Opaque long-lived refresh token' })
  refreshToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
