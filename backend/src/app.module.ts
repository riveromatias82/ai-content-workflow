import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ContentModule } from './modules/content/content.module';
import { AiModule } from './modules/ai/ai.module';

@Module({
  imports: [
    // Configuration module - loads environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env', // Path to .env file relative to backend/src
    }),

    // Database configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'admin'),
        database: configService.get('DB_NAME', 'ai_content_workflow'),
        entities: [join(__dirname, '**', '*.entity.{ts,js}')],
        synchronize: configService.get('NODE_ENV') !== 'production', // Only for development
        logging: configService.get('NODE_ENV') === 'development',
        // Retry connection configuration
        retryAttempts: 3,
        retryDelay: 3000,
        // Auto-create database if it doesn't exist (development only)
        ...(configService.get('NODE_ENV') !== 'production' && {
          migrationsRun: false,
          dropSchema: false,
        }),
      }),
      inject: [ConfigService],
    }),

    // GraphQL configuration
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      introspection: true,
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
      context: ({ req, connection }) => {
        if (connection) {
          return { req: connection.context };
        }
        return { req };
      },
    }),

    // Feature modules
    CampaignsModule,
    ContentModule,
    AiModule,
  ],
})
export class AppModule {}
