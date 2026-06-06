import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '@common/guards';
import { CurrentUser } from '@common/decorators';
import { AuthService, RequestContext } from './auth.service';
import {
  AuthTokensDto,
  AuthUserDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SignupDto,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new internal user (admin, procurement_officer, manager)' })
  @ApiOkResponse({ type: AuthUserDto })
  async signup(
    @Body() dto: SignupDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthUserDto> {
    return this.authService.signup(dto, this.context(ip, userAgent));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ login: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Authenticate a user and return access + refresh tokens' })
  @ApiOkResponse({ type: AuthTokensDto })
  async login(
    @Body() dto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthTokensDto> {
    return this.authService.login(dto, this.context(ip, userAgent));
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token and return a fresh token pair' })
  @ApiOkResponse({ type: AuthTokensDto })
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<AuthTokensDto> {
    return this.authService.refreshToken(dto, this.context(ip, userAgent));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Invalidate the current session' })
  @ApiOkResponse({
    schema: {
      example: { success: true, message: 'Successfully logged out.' },
    },
  })
  async logout(
    @CurrentUser('userId') userId: string,
    @Body() body: Partial<RefreshTokenDto>,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ success: true; message: string }> {
    await this.authService.logout(userId, body?.refreshToken, this.context(ip, userAgent));
    return { success: true, message: 'Successfully logged out.' };
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ recovery: { limit: 3, ttl: 3_600_000 } })
  @ApiOperation({ summary: 'Request a password-reset email (always returns 200)' })
  @ApiOkResponse({
    schema: {
      example: {
        success: true,
        message: 'If the email exists, a password reset link has been sent.',
      },
    },
  })
  async forgotPassword(
    @Body() dto: ForgotPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ success: true; message: string }> {
    await this.authService.forgotPassword(dto, this.context(ip, userAgent));
    return { success: true, message: 'If the email exists, a password reset link has been sent.' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @Throttle({ recovery: { limit: 3, ttl: 3_600_000 } })
  @ApiOperation({ summary: 'Complete the password reset using the emailed token' })
  @ApiOkResponse({
    schema: { example: { success: true, message: 'Password reset successful.' } },
  })
  async resetPassword(
    @Body() dto: ResetPasswordDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<{ success: true; message: string }> {
    await this.authService.resetPassword(dto, this.context(ip, userAgent));
    return { success: true, message: 'Password reset successful.' };
  }

  private context(ip: string, userAgent: string | undefined): RequestContext {
    return {
      ipAddress: ip || '0.0.0.0',
      userAgent: userAgent ?? null,
    };
  }
}
