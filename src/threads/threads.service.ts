import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateThreadDto } from "./dto/update-thread.dto";

@Injectable()
export class ThreadsService{
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: { title: string; content: string }) {
    return this.prisma.thread.create({
      data: {
        title: dto.title,
        content: dto.content,
        user_id: userId,
      },
    });
  }
  findByUser(userId: string) {
    return this.prisma.thread.findMany({ where: { user_id: userId } });
}
  findAll() {
    return this.prisma.thread.findMany();
  }
  findOne(id: string) {
    return this.prisma.thread.findUnique({ where: {id}});
  }
  async update(id: string, userId: string, dto: UpdateThreadDto) {
  const thread = await this.prisma.thread.findUnique({ where: { id } });
  if (!thread) {
    throw new NotFoundException('Thread tidak ditemukan');
  }
  if (thread.user_id !== userId) {
    throw new ForbiddenException('Kamu bukan pemilik thread ini');
  }
  return this.prisma.thread.update({ where: { id }, data: dto });
}
  async remove(id: string, userId: string) {
    const thread = await this.prisma.thread.findUnique({ where: {id}});
    if(!thread) {
      throw new NotFoundException("Thread tidak ditemukan");
    }
    if (thread.user_id !== userId) {
      throw new ForbiddenException('Kamu bukan pemilik thread ini');
    }
    return this.prisma.thread.delete({ where: { id }});
  }

}