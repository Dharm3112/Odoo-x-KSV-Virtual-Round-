import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_EMAIL_NOTIFICATIONS } from '@infra/queue/queue.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { LoginAttemptService, REDIS_CLIENT } from './login-attempt.service';
import { JwtStrategy } from './jwt.strategy';
import { ThrottlerInfraModule } from '@infra/throttler/throttler.module';
import Redis from 'ioredis';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        privateKey: (configService.get<string>('JWT_PRIVATE_KEY') || '').replace(/\\n/g, '\n'),
        publicKey: (configService.get<string>('JWT_PUBLIC_KEY') || '').replace(/\\n/g, '\n'),
        signOptions: { algorithm: 'RS256', issuer: 'vendorbridge-auth' },
        verifyOptions: {
          algorithms: ['RS256'],
          issuer: 'vendorbridge-auth',
          clockTolerance: 60,
        },
      }),
    }),
    BullModule.registerQueue({ name: QUEUE_EMAIL_NOTIFICATIONS }),
    ThrottlerInfraModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    TokenService,
    JwtStrategy,
    LoginAttemptService,
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis =>
        LoginAttemptService.buildClient(configService),
    },
  ],
  exports: [AuthService, PasswordService, TokenService, JwtStrategy],
})
export class AuthModule {}
