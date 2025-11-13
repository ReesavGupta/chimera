import { IsOptional, IsString } from 'class-validator';

export class UpdateTranscriptDto {
  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  sourceFileUrl?: string | null;
}