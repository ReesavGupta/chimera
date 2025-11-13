import { IsEnum, IsISO8601, IsOptional, IsString, MinLength } from 'class-validator';
import { TodoStatus } from '../todos.entity';

export class UpdateTodoDto {
  @IsString()
  @MinLength(2)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsISO8601()
  @IsOptional()
  dueDate?: string | null;

  @IsString()
  @IsOptional()
  assigneeId?: string | null;

  @IsEnum(TodoStatus)
  @IsOptional()
  status?: TodoStatus;
}