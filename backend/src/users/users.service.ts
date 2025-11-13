import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './users.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    findAllForWorkspace(workspaceId: string) {
        return this.usersRepository.find({ where: { workspaceId } });
    }

    findOneById(id: string) {
        return this.usersRepository.findOne({ where: { id } });
    }

    findOneByEmail(email: string) {
        return this.usersRepository.findOne({ where: { email } });
    }

    async create(createUserDto: CreateUserDto) {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
            role: createUserDto.role ?? UserRole.MEMBER,
        });

        const saved = await this.usersRepository.save(user);
        const { password, ...rest } = saved;
        return rest;
    }

    async update(id: string, updateUserDto: UpdateUserDto) {
        const user = await this.findOneById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        const updateData = Object.fromEntries(
            Object.entries(updateUserDto).filter(([, value]) => value !== null && value !== undefined)
        );

        await this.usersRepository.update(id, updateData);

        const updated = await this.findOneById(id);
        if (!updated) {
            throw new NotFoundException('User not found');
        }
        const { password, ...rest } = updated;
        return rest;
    }

    async remove(id: string) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }
        return { deleted: true };
    }
}
