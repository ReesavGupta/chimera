import {
    ForbiddenException,
        Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { Todo, TodoStatus } from './todos.entity';
  import { CreateTodoDto } from './dto/create-todo.dto';
  import { UpdateTodoDto } from './dto/update-todo.dto';
  import { User, UserRole } from '../users/users.entity';
  import { Transcript } from '../transcripts/transcripts.entity';
  import { TodoExtractorService } from './ai/todo-extractor.service';
  
  @Injectable()
  export class TodosService {
    constructor(
        @InjectRepository(Todo)
        private readonly todoRepository: Repository<Todo>,
        @InjectRepository(Transcript)
        private readonly transcriptRepository: Repository<Transcript>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly todoExtractorService: TodoExtractorService,
    ) {}
  
    private ensureWorkspace(todo: Todo | null, user: User) {
      if (!todo || todo.workspaceId !== user.workspaceId) {
        throw new NotFoundException('Todo not found');
      }
      if (
        user.role !== UserRole.ADMIN &&
        todo.assigneeId !== user.id &&
        todo.createdById !== user.id
      ) {
        throw new ForbiddenException('Access denied');
      }
    }
  
    async create(dto: CreateTodoDto, currentUser: User) {
        let transcript: Transcript | null = null;

        if (dto.transcriptId) {
        transcript = await this.transcriptRepository.findOne({
            where: { id: dto.transcriptId },
        });
        if (!transcript || transcript.workspaceId !== currentUser.workspaceId) {
            throw new NotFoundException('Transcript not found');
        }
        }

        if (dto.assigneeId) {
        const assignee = await this.usersRepository.findOne({
            where: { id: dto.assigneeId },
        });
        if (!assignee || assignee.workspaceId !== currentUser.workspaceId) {
            throw new NotFoundException('Assignee not found');
        }
        }

        const todo = this.todoRepository.create({
            title: dto.title,
            description: dto.description,
            dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
            status: dto.status ?? TodoStatus.PENDING,
            assigneeId: dto.assigneeId,
            transcriptId: dto.transcriptId,
            workspaceId: currentUser.workspaceId,
            createdById: currentUser.id,
        });

        return this.todoRepository.save(todo);
    }
  
    async findAll(currentUser: User) {
      if (currentUser.role === UserRole.ADMIN) {
        return this.todoRepository.find({
          where: { workspaceId: currentUser.workspaceId },
          order: { createdAt: 'DESC' },
        });
      }
  
      return this.todoRepository.find({
        where: [
          { assigneeId: currentUser.id },
          { createdById: currentUser.id },
        ],
        order: { createdAt: 'DESC' },
      });
    }
  
    async findOne(id: string, currentUser: User) {
        const todo = await this.todoRepository.findOne({ where: { id } });
        this.ensureWorkspace(todo, currentUser);
        return todo;
    }
  
    async update(id: string, dto: UpdateTodoDto, currentUser: User) {
        const todo = await this.todoRepository.findOne({ where: { id } });
        this.ensureWorkspace(todo, currentUser);

        if (dto.assigneeId) {
            const assignee = await this.usersRepository.findOne({
                where: { id: dto.assigneeId },
            });
            if (!assignee || assignee.workspaceId !== currentUser.workspaceId) {
                throw new NotFoundException('Assignee not found');
            }
        }
        if (todo === null) {
            throw new NotFoundException('Todo not found');
        }

        const updateData: any = { ...dto };
        if (dto.assigneeId === null) {
            updateData.assigneeId = null;
        }
        if (dto.dueDate !== undefined) {
            updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
        }

        const cleanedUpdateData = Object.fromEntries(
            Object.entries(updateData).filter(([, value]) => value !== undefined)
        );
        await this.todoRepository.update(id, cleanedUpdateData);
        return this.findOne(id, currentUser);
    }
  
    async remove(id: string, currentUser: User) {
      const todo = await this.todoRepository.findOne({ where: { id } });
      this.ensureWorkspace(todo, currentUser);
      await this.todoRepository.delete(id);
      return { deleted: true };
    }
  
    async generateFromTranscript(transcriptId: string, currentUser: User) {
      const transcript = await this.transcriptRepository.findOne({
        where: { id: transcriptId },
      });
  
      if (!transcript || transcript.workspaceId !== currentUser.workspaceId) {
        throw new NotFoundException('Transcript not found');
      }
  
      const todos = await this.todoExtractorService.extractTodos(
        transcript.content,
      );
  
      const workspaceUsers = await this.usersRepository.find({
        where: { workspaceId: currentUser.workspaceId },
      });
  
      const userByName = new Map(
        workspaceUsers.map((user) => [user.name.toLowerCase(), user]),
      );
  
      const savedTodos: Todo[] = [];
  
      for (const item of todos) {
        const assignee =
          (item.assigneeName &&
            userByName.get(item.assigneeName.toLowerCase())) ||
          undefined;

        const todo = this.todoRepository.create({
          title: item.title,
          description: item.description,
          dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
          assigneeId: assignee?.id,
          transcriptId: transcript.id,
          workspaceId: currentUser.workspaceId,
          createdById: currentUser.id,
        });
  
        savedTodos.push(await this.todoRepository.save(todo));
      }
  
      return savedTodos;
    }
    async generateFromTranscriptContent(content: string, currentUser: User) {
        const todos = await this.todoExtractorService.extractTodos(content);
      
        const workspaceUsers = await this.usersRepository.find({
          where: { workspaceId: currentUser.workspaceId },
        });
      
        const userByName = new Map(
          workspaceUsers.map((user) => [user.name.toLowerCase(), user]),
        );
      
        const savedTodos: Todo[] = [];
      
        for (const item of todos) {
          const assignee =
            (item.assigneeName &&
              userByName.get(item.assigneeName.toLowerCase())) ||
            undefined;
      
          const todo = this.todoRepository.create({
            title: item.title,
            description: item.description,
            dueDate: item.dueDate ? new Date(item.dueDate) : undefined,
            assigneeId: assignee?.id ?? undefined,
            workspaceId: currentUser.workspaceId,
            createdById: currentUser.id,
          });
      
          savedTodos.push(await this.todoRepository.save(todo));
        }
      
        return savedTodos;
      }
  }