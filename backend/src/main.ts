import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { GlobalExceptionFilter } from '@common/exceptions';
import { ResponseInterceptor } from '@common/interceptors';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3001'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('VendorBridge ERP API')
    .setDescription('Backend API for VendorBridge Procurement & Vendor Management ERP')
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Health', 'Infrastructure readiness')
    .addTag('Auth', 'Authentication & Identity Management')
    .addTag('Dashboard', 'Dashboard Metrics & Quick Actions')
    .addTag('Vendors', 'Vendor Management Lifecycle')
    .addTag('RFQs', 'Request for Quotation Management')
    .addTag('Quotations', 'Vendor Quotation Submissions')
    .addTag('Approvals', 'Approval Workflow Engine')
    .addTag('Purchase Orders', 'Purchase Order Generation')
    .addTag('Invoices', 'Invoice Processing')
    .addTag('Notifications', 'Activity Notifications')
    .addTag('Audit Logs', 'Immutable Audit Trail')
    .addTag('Reports', 'Analytics & Report Exports')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = Number(configService.get<string>('PORT', '3000'));
  await app.listen(port);
  logger.log(`VendorBridge API running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`Swagger docs available at: http://localhost:${port}/docs`);
}

void bootstrap();
