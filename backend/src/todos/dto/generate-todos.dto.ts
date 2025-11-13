import { IsOptional, IsString } from 'class-validator';

export class GenerateTodosDto {
  @IsString()
  @IsOptional()
  transcriptId?: string;

  @IsString()
  @IsOptional()
  transcriptContent?: string;
}