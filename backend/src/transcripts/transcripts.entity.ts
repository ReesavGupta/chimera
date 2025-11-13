import { User } from 'src/users/users.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
  } from 'typeorm';
  
  @Entity('transcripts')
  export class Transcript {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ nullable: true })
    title?: string;
  
    @Column({ type: 'text' })
    content: string;
  
    @Column({ nullable: true })
    sourceFileUrl?: string;
  
    @Column()
    ownerId: string;
  
    @Column({ nullable: true })
    workspaceId?: string;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ownerId' })
    owner: User;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }