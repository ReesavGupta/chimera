import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Transcript } from './transcripts.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from 'src/users/users.entity';
import { CreateTranscriptDto } from './dto/create-transcript.dto';
import { UpdateTranscriptDto } from './dto/update-transcript.dto';

@Injectable()
export class TranscriptsService {
    constructor(
        @InjectRepository(Transcript)
        private readonly transcriptRepository: Repository<Transcript>
    ){}

    private ensureAccess(transcript: Transcript | null, user: User): void {
        if (!transcript || transcript.workspaceId !== user.workspaceId){
            throw new NotFoundException('Transcript not found');
        }
        if (user.role != UserRole.ADMIN && transcript.ownerId !== user.id){
            throw new ForbiddenException('You are not allowed to access this transcript');
        }
    }

    async create(createTranscriptDto: CreateTranscriptDto, owner: User){
        const transcript = this.transcriptRepository.create({
            ...createTranscriptDto,
            owner: owner,
            ownerId: owner.id,
            workspaceId: owner.workspaceId,
        })
        return await this.transcriptRepository.save(transcript)
    }

    async findAllForUser(user: User){
        if (user.role === UserRole.ADMIN){
            return await this.transcriptRepository.find({
                where: {workspaceId: user.workspaceId},
                order: {createdAt: 'DESC'},
            })
        }
        return await this.transcriptRepository.find({
            where: {ownerId: user.id},
            order: {createdAt: 'DESC'},
        })
    }

    async findOne(id: string, user: User){
        const transcript = await this.transcriptRepository.findOne({where: {id}})
        this.ensureAccess(transcript, user)
        return transcript
    }

    async update(id: string, updateTranscriptDto: UpdateTranscriptDto, user: User){
        const transcript = await this.transcriptRepository.findOne({ where: { id } });
        this.ensureAccess(transcript, user);

        const updateData = Object.fromEntries(
            Object.entries(updateTranscriptDto).filter(([, value]) => value !== undefined),
          );

        const updated = await this.transcriptRepository.update(id, updateData);

        if (updated.affected === 0) {
            throw new NotFoundException('Transcript not found');
        }
        return await this.findOne(id, user);
    }
    async remove(id: string, user: User) {
        const transcript = await this.transcriptRepository.findOne({
          where: { id },
        });
    
        this.ensureAccess(transcript, user);
    
        await this.transcriptRepository.delete(id);
        return { deleted: true };
      }
}
