import { Transcript } from "src/transcripts/transcripts.entity";
import { User } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum TodoStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    ARCHIVED = 'archived',
}

@Entity('todos')
export class Todo{
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    title: string

    @Column({ nullable: true , type: 'text'})
    description?: string

    @Column({ nullable: true })
    dueDate: Date | null
    
    @Column({
        type: 'enum',
        enum: TodoStatus,
        default: TodoStatus.PENDING,
      })
      status: TodoStatus;
    
      @Column({ nullable: true })
      assigneeId?: string;
    
      @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
      @JoinColumn({ name: 'assigneeId' })
      assignee?: User;
    
      @Column({ nullable: true })
      transcriptId?: string;
    
      @ManyToOne(() => Transcript, { nullable: true, onDelete: 'CASCADE' })
      @JoinColumn({ name: 'transcriptId' })
      transcript?: Transcript;
    
      @Column({ nullable: true })
      workspaceId?: string;
    
      @Column()
      createdById: string;
    
      @ManyToOne(() => User, { onDelete: 'CASCADE' })
      @JoinColumn({ name: 'createdById' })
      createdBy: User;
    
      @CreateDateColumn()
      createdAt: Date;
    
      @UpdateDateColumn()
      updatedAt: Date;
}