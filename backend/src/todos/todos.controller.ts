import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
  } from '@nestjs/common';
import { TodosService } from './todos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/users.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { GenerateTodosDto } from './dto/generate-todos.dto';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
    constructor(private readonly todosService: TodosService) {}

    @Post()
    create(@Body() dto: CreateTodoDto, @CurrentUser() user: User) {
        return this.todosService.create(dto, user);
    }

    @Get()
    findAll(@CurrentUser() user: User) {
        return this.todosService.findAll(user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @CurrentUser() user: User) {
        return this.todosService.findOne(id, user);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() dto: UpdateTodoDto,
        @CurrentUser() user: User,
    ) {
        return this.todosService.update(id, dto, user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @CurrentUser() user: User) {
        return this.todosService.remove(id, user);
    }

    @Post('generate')
    async generate(
        @Body() dto: GenerateTodosDto,
        @CurrentUser() user: User,
    ) {
        if (dto.transcriptId) {
            return this.todosService.generateFromTranscript(dto.transcriptId, user);
        }

        if (dto.transcriptContent) {
            return this.todosService.generateFromTranscriptContent(
                dto.transcriptContent,
                user,
            );
        }

        return [];
    }
}