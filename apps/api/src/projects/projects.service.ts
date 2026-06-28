import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.project.findMany({
      include: { owner: true, rooms: { include: { surfaces: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async create(input: CreateProjectDto) {
    const owner = await this.prisma.user.upsert({
      where: { email: input.ownerEmail },
      create: { email: input.ownerEmail, name: input.ownerEmail.split('@')[0] },
      update: {},
    });

    return this.prisma.project.create({
      data: {
        name: input.name,
        type: 'RESIDENTIAL',
        ownerId: owner.id,
        rooms: {
          create: {
            name: input.name,
            type: 'BEDROOM',
            length: input.length,
            width: input.width,
            height: input.height,
          },
        },
      },
      include: { rooms: true },
    });
  }
}
