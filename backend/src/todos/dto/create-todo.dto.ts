import { IsEnum, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';
import { TodoStatus } from '../todos.entity';

export class CreateTodoDto {
  @IsString()
  @MinLength(2)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsISO8601()
  @IsOptional()
  dueDate?: string;

  @IsString()
  @IsOptional()
  assigneeId?: string;

  @IsString()
  @IsOptional()
  transcriptId?: string;

  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus;
}