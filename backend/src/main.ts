import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@common/exceptions';
import { ResponseInterceptor } from '@common/interceptors';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ====== Security Headers ======
  app.use(helmet());

  // ====== CORS ======
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ====== Global API Prefix ======
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // ====== Global Exception Filter ======
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ====== Global Response Interceptor ======
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ====== Global Validation Pipe ======
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ====== Swagger API Documentation ======
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

  // ====== Start Server ======
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 VendorBridge API running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📄 Swagger docs available at: http://localhost:${port}/docs`);
}

bootstrap();
