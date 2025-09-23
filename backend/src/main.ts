import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { setupDatabase } from './database/setup';

async function bootstrap() {
  // Setup database before starting the application
  try {
    await setupDatabase();
  } catch (error) {
    console.error('Failed to setup database:', error);
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`🚀 AI Content Workflow API running on port ${port}`);
  console.log(`📊 GraphQL Playground: http://localhost:${port}/graphql`);
}

bootstrap();
