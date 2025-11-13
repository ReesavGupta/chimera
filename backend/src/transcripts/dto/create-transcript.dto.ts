import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTranscriptDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  sourceFileUrl?: string;
}