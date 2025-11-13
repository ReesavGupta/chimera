import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/users.entity';
import { AuthModule } from './auth/auth.module';
import { TranscriptsModule } from './transcripts/transcripts.module';
import { Transcript } from './transcripts/transcripts.entity';
import { TodosModule } from './todos/todos.module';
import { Todo } from './todos/todos.entity';

@Module({
  imports: [
    // here we are loading the environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    // db connection
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [User, Transcript, Todo],
        synchronize: configService.get("NODE_ENV") === "development",
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    TranscriptsModule,
    TodosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
