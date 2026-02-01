import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';

/**
 * AppModule
 *
 * - Adds ConfigModule (global) so environment variables are available everywhere.
 * - Integrates TypeORM using `forRootAsync` so DB config can come from env vars.
 * - Loads any entity files matching `*.entity.ts` or `*.entity.js` under `src/`.
 *
 * Environment variables supported:
 * - DATABASE_URL (optional; if present TypeORM will use it)
 * - DB_TYPE (defaults to "postgres")
 * - DB_HOST (defaults to "localhost")
 * - DB_PORT (defaults to "5432")
 * - DB_USERNAME
 * - DB_PASSWORD
 * - DB_NAME
 *
 * Note: `synchronize` is set to `false` because you said migrations are handled outside of this task.
 */
@Module({
  imports: [
    // Load environment variables and make ConfigService available globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Configure TypeORM from environment variables via ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        const dbType = (config.get<string>('DB_TYPE') || 'postgres') as any;

        return {
          type: dbType,
          // If DATABASE_URL is provided, TypeORM will prefer it (set below).
          url: databaseUrl || undefined,
          host: config.get<string>('DB_HOST', 'localhost'),
          port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
          username: config.get<string>('DB_USERNAME', 'postgres'),
          password: config.get<string>('DB_PASSWORD', ''),
          database: config.get<string>('DB_NAME', 'postgres'),
          // Auto-load all entities in the project by convention. Ensure your entity files end with `.entity.ts`/`.entity.js`.
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // We assume migrations are handled elsewhere; do not auto-sync in production.
          synchronize: false,
          // Turn on logging in development via env if needed
          logging: config.get<boolean>('DB_LOGGING') || false,
        };
      },
    }),

    // Application users module (should export User entity/Repositories and services)
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
