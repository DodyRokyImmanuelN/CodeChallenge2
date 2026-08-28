import { Body, Controller, Get, NotFoundException, Param, Post, Req, UseGuards, Put, Delete } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { UpdateThreadDto } from './dto/update-thread.dto';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() dto: CreateThreadDto, @Req() req) {
    return this.threadsService.create(req.user.userId, dto);
  }

  @Get()
  findAll() {
    return this.threadsService.findAll();
  }
  @UseGuards(AuthGuard)
  @Get('my-threads')
  findMyThreads(@Req() req) {
    return this.threadsService.findByUser(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const thread = await this.threadsService.findOne(id);
    if (!thread) {
      throw new NotFoundException('Thread tidak ditemukan');
    }
    return thread;
  }
  @UseGuards(AuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Req() req, @Body() dto: UpdateThreadDto) {
    return this.threadsService.update(id, req.user.userId, dto);
  }
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.threadsService.remove(id, req.user.userId);
  }
}