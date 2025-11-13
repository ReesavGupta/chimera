import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TranscriptsService } from './transcripts.service';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from 'src/users/users.entity';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';

@Controller('transcripts')
@UseGuards(JwtAuthGuard)
export class TranscriptsController {
    constructor(private readonly transcriptsService: TranscriptsService){}

    @Post()
    create(
        @Body() CreateTranscriptDto: CreateTranscriptDto,
        @CurrentUser() user: User,
    ){
        return this.transcriptsService.create(CreateTranscriptDto, user)
    }

    @Get()
    findAllForUser(@CurrentUser() user: User){
        return this.transcriptsService.findAllForUser(user)
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: User){
        return this.transcriptsService.findOne(id, user)
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTranscriptDto: UpdateTranscriptDto, @CurrentUser() user: User){
        return this.transcriptsService.update(id, updateTranscriptDto, user)
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: User){
        return this.transcriptsService.remove(id, user)
    }

    @Post(':id/reprocess')
    reprocess(@Param('id') id: string, @CurrentUser() user: User){
        // placeholder for todo reprocessing
        return { message: 'Todo reprocessing placeholder' }
    }
}
