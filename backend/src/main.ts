import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 55598;

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are sent
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    }),
  );
  // CORS Configuration - Support both local dev and production frontend
  const allowedOrigins = [
    'http://localhost:4200', // Local Angular dev server
    'https://myfrontenddomain.com', // Replace with your production frontend URL
    // Add more production domains as needed:
    // 'https://myapp.vercel.app',
    // 'https://myapp.netlify.app',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // In production, you might want to log this
        if (process.env.NODE_ENV === 'production') {
          console.warn(`Blocked CORS request from origin: ${origin}`);
        }
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('Miniflow API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
  console.log(`🚀 NestJS backend listening on ${baseUrl}/api`);
  console.log(`📚 Swagger docs available at ${baseUrl}/swagger`);
}

bootstrap();
