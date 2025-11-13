import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './todos.entity';
import { Transcript } from 'src/transcripts/transcripts.entity';
import { User } from 'src/users/users.entity';
import { TodosController } from './todos.controller';
import { TodosService } from './todos.service';
import { TodoExtractorService } from './ai/todo-extractor.service';

@Module({
    imports: [TypeOrmModule.forFeature([Todo, Transcript, User])],
    controllers: [TodosController],
    providers: [TodosService, TodoExtractorService],
    exports: [TodosService],
  })
export class TodosModule {}
