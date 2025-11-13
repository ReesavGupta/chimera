import { Module } from '@nestjs/common';
import { TranscriptsController } from './transcripts.controller';
import { TranscriptsService } from './transcripts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transcript } from './transcripts.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transcript])],
  controllers: [TranscriptsController],
  providers: [TranscriptsService],
  exports: [TranscriptsService],
})
export class TranscriptsModule {}
