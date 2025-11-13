import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ){}

    async signup(email: string, password: string, name: string){
        const existingUser = await this.userRepository.findOne({where: {email}})
        if (existingUser){
            throw new ConflictException('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(password, 10)

        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            name
        })
        const savedUser = await this.userRepository.save(user);

        const { password: _, ...userWithoutPassword } = savedUser;
        return userWithoutPassword;
    }

    async login(email: string , password: string){
        const exists = await this.userRepository.findOne({where: {email}})
        if (!exists){
            throw new NotFoundException("Invalid Credentials")
        }
        const isPasswordValid = await bcrypt.compare(password, exists.password)

        if (!isPasswordValid){
            throw new UnauthorizedException("Invalid Credentials")
        }

        const payload = { sub: exists.id, email: exists.email, role: exists.role };
        const access_token = this.jwtService.sign(payload);

        const {password: _, ...userWithoutPassword} = exists
        
        return {
            access_token,
            user: userWithoutPassword
        }
    }
    async validateUser(userId: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
        throw new UnauthorizedException('User not found');
        }
        return user;
    }
}
